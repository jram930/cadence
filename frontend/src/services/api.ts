import { Entry, CreateEntryDto, UpdateEntryDto, StreakData, HeatMapData, AverageMoodData } from '../types';

const API_BASE_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  // Entries
  async createEntry(data: CreateEntryDto): Promise<Entry> {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create entry');
    }

    return response.json();
  },

  async getEntries(startDate?: string, endDate?: string): Promise<Entry[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await fetch(`${API_BASE_URL}/entries?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch entries');
    }

    return response.json();
  },

  async getEntry(id: string): Promise<Entry> {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch entry');
    }

    return response.json();
  },

  async getEntryByDate(date: string): Promise<Entry | null> {
    const response = await fetch(`${API_BASE_URL}/entries/date/${date}`, {
      headers: getHeaders(),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch entry');
    }

    return response.json();
  },

  async updateEntry(id: string, data: UpdateEntryDto): Promise<Entry> {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update entry');
    }

    return response.json();
  },

  async deleteEntry(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete entry');
    }
  },

  // Analytics
  async getStreakData(): Promise<StreakData> {
    const response = await fetch(`${API_BASE_URL}/streak`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch streak data');
    }

    return response.json();
  },

  async getHeatMapData(days: number = 365): Promise<HeatMapData[]> {
    const response = await fetch(`${API_BASE_URL}/heatmap?days=${days}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch heat map data');
    }

    return response.json();
  },

  async getAverageMoodData(): Promise<AverageMoodData> {
    const response = await fetch(`${API_BASE_URL}/average-mood`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch average mood data');
    }

    return response.json();
  },

  // AI
  async queryAI(question: string, startDate?: string, endDate?: string): Promise<{
    answer: string;
    relevantEntries: Array<{
      id: string;
      date: string;
      content: string;
      mood: string;
    }>;
  }> {
    const response = await fetch(`${API_BASE_URL}/ai/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, startDate, endDate }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to query AI');
    }

    return response.json();
  },

  async checkAIHealth(): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/ai/health`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to check AI health');
    }

    return response.json();
  },
};
