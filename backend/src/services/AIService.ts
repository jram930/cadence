import Anthropic from '@anthropic-ai/sdk';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Entry } from '../entities/Entry';
import { format } from 'date-fns';

export interface AIQueryRequest {
  question: string;
  startDate?: string;
  endDate?: string;
}

export interface AIQueryResponse {
  answer: string;
  relevantEntries: Array<{
    id: string;
    date: string;
    content: string;
    mood: string;
  }>;
}

export class AIService {
  private anthropic: Anthropic;
  private entryRepository: Repository<Entry>;
  private modelName = 'claude-3-5-haiku-20241022'; // Fast and affordable

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    this.anthropic = new Anthropic({ apiKey });
    this.entryRepository = AppDataSource.getRepository(Entry);
  }

  async queryEntries(userId: string, request: AIQueryRequest): Promise<AIQueryResponse> {
    // Fetch relevant entries
    const query = this.entryRepository.createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId });

    if (request.startDate) {
      query.andWhere('entry.entryDate >= :startDate', { startDate: request.startDate });
    }

    if (request.endDate) {
      query.andWhere('entry.entryDate <= :endDate', { endDate: request.endDate });
    }

    const entries = await query
      .orderBy('entry.entryDate', 'DESC')
      .limit(20) // Reduced to 20 for faster processing
      .getMany();

    if (entries.length === 0) {
      return {
        answer: 'No journal entries found for the specified period.',
        relevantEntries: [],
      };
    }

    // Format entries for AI
    const entriesText = entries.map((entry, index) => {
      return `Entry ${index + 1} (${format(new Date(entry.entryDate), 'yyyy-MM-dd')}) - Mood: ${entry.mood}\n${entry.content}`;
    }).join('\n\n---\n\n');

    // Create prompt for AI
    const prompt = `You are analyzing journal entries. The user has asked the following question about their journal:

Question: ${request.question}

Here are their journal entries:

${entriesText}

Please provide a thoughtful, empathetic answer to their question based on the journal entries. If you reference specific entries, mention the dates. Keep your response concise and insightful.`;

    try {
      // Check if API key is configured
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'your-api-key-here') {
        return {
          answer: 'Please configure your Anthropic API key in the backend/.env file to use AI features. Get your key at https://console.anthropic.com/',
          relevantEntries: entries.slice(0, 5).map(entry => ({
            id: entry.id,
            date: format(new Date(entry.entryDate), 'yyyy-MM-dd'),
            content: entry.content,
            mood: entry.mood,
          })),
        };
      }

      // Query Claude
      const response = await this.anthropic.messages.create({
        model: this.modelName,
        max_tokens: 1024,
        system: 'You are a helpful and empathetic journal analysis assistant. Provide thoughtful insights based on the journal entries provided. Keep responses concise and actionable.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const answer = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';

      // Format relevant entries for response
      const relevantEntries = entries.map(entry => ({
        id: entry.id,
        date: format(new Date(entry.entryDate), 'yyyy-MM-dd'),
        content: entry.content,
        mood: entry.mood,
      }));

      return {
        answer,
        relevantEntries: relevantEntries.slice(0, 5), // Return top 5 most recent
      };
    } catch (error: any) {
      console.error('Error querying Anthropic:', error);

      // Check for specific error types
      if (error.status === 529) {
        throw new Error('Anthropic API is temporarily overloaded. Please try again in a few moments.');
      } else if (error.status === 401) {
        throw new Error('Invalid Anthropic API key. Please check your .env file.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }

      throw new Error('Failed to process AI query: ' + (error.message || 'Unknown error'));
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Simple test to check if API key is valid
      const apiKey = process.env.ANTHROPIC_API_KEY;
      return !!apiKey && apiKey.startsWith('sk-ant-');
    } catch (error) {
      console.error('Anthropic connection check failed:', error);
      return false;
    }
  }

  async enhanceNote(userId: string, content: string, currentDate: string): Promise<string> {
    // Fetch recent entries for context (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = await this.entryRepository
      .createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId })
      .andWhere('entry.entryDate >= :startDate', { startDate: format(thirtyDaysAgo, 'yyyy-MM-dd') })
      .andWhere('entry.entryDate != :currentDate', { currentDate }) // Exclude current entry
      .orderBy('entry.entryDate', 'DESC')
      .limit(10)
      .getMany();

    // Build context from recent entries to help with name completion and acronym expansion
    let contextText = '';
    if (recentEntries.length > 0) {
      const contextEntries = recentEntries.map((entry) => {
        return `${format(new Date(entry.entryDate), 'MMM d')}: ${entry.content.slice(0, 200)}`;
      }).join('\n\n');
      contextText = `\n\nRecent journal entries for context:\n${contextEntries}`;
    }

    const prompt = `You are an intelligent journal note enhancement assistant. Your job is to take a quick, shorthand journal entry and enhance it by:

1. **Formatting**: Improve markdown formatting (headings, lists, emphasis)
2. **Grammar & Spelling**: Fix any errors while preserving the user's voice
3. **Context Enhancement**: Based on recent entries, expand abbreviations, add full names where you see patterns (e.g., if you see "John Smith" in context and "John" in the note, keep it as "John" but you might recognize common patterns)
4. **Clarity**: Make the note more readable without changing its meaning
5. **Preservation**: Keep the tone, voice, and core content intact - only polish and enhance

IMPORTANT RULES:
- Do NOT add new information or fabricate details
- Do NOT change the user's meaning or intent
- Keep personal shorthand if unclear (don't guess)
- Return ONLY the enhanced note content, no explanations or meta-commentary
- If the note is already well-formatted, make minimal changes

Current note to enhance:
${content}${contextText}

Enhanced note:`;

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey || apiKey === 'your-api-key-here') {
        throw new Error('Please configure your Anthropic API key to use AI enhancement features.');
      }

      const response = await this.anthropic.messages.create({
        model: this.modelName,
        max_tokens: 2048,
        system: 'You are a journal enhancement assistant. Return only the enhanced note content, no explanations.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const enhancedContent = response.content[0].type === 'text' ? response.content[0].text : content;
      return enhancedContent.trim();
    } catch (error: any) {
      console.error('Error enhancing note:', error);

      if (error.status === 529) {
        throw new Error('AI service temporarily overloaded. Please try again.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }

      throw new Error('Failed to enhance note: ' + (error.message || 'Unknown error'));
    }
  }
}
