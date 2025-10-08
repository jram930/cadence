# Cadence

A beautiful journaling app with mood tracking, AI-powered insights, and analytics. Track the rhythm of your daily reflections and gain deeper understanding of your emotional patterns.

🌐 **Live App**: [cadencenotes.com](https://cadencenotes.com)

## ✨ Features

- 📝 **Daily Journaling** - Write entries with Markdown support for rich formatting
- 😊 **Mood Tracking** - Track how you're feeling with five distinct mood levels
- 🔥 **Streak Counter** - Stay motivated with daily, longest, and total entry counts
- 📅 **Heat Map Visualization** - See your journaling patterns at a glance with a year-long calendar
- 🤖 **AI Insights** - Ask questions about your entries and get thoughtful insights powered by Claude AI
- 📊 **Analytics Dashboard** - View average mood trends and journaling statistics
- 📱 **Mobile Friendly** - Responsive design with bottom navigation for mobile devices
- 🎨 **Beautiful UI** - Clean, modern interface with orange accent theme
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- ⚡ **Rate Limiting** - Smart AI query limits (5 per hour) to manage API usage

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing
- **date-fns** - Date manipulation
- **react-markdown** - Markdown rendering

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe backend
- **TypeORM** - Database ORM with migrations
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Anthropic Claude API** - AI-powered insights

### Infrastructure
- **Docker** - Containerization for backend and database
- **AWS Lightsail** - Production hosting
- **Nginx** - Reverse proxy and static file serving
- **Let's Encrypt** - SSL certificates

## 📋 Prerequisites

- Node.js 18+ (22+ recommended)
- Docker Desktop
- npm or pnpm
- PostgreSQL (via Docker)

## 🛠️ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/jram930/micro-journal.git
cd micro-journal
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up environment variables

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=journal_user
DB_PASSWORD=journal_pass
DB_DATABASE=micro_journal

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI (Optional - for AI Insights feature)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 4. Start PostgreSQL
```bash
npm run docker:up
```

### 5. Run database migrations
```bash
cd backend
npm run migration:run
```

### 6. Start development servers
```bash
npm run dev
```

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is in use)
- **Backend**: http://localhost:3000

## 📁 Project Structure

```
cadence/
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/       # Database and app configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── entities/     # TypeORM entities (User, Entry, AiQueryUsage)
│   │   ├── migrations/   # Database migrations
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic (AI, Auth, Rate limiting)
│   │   ├── middleware/   # Auth middleware
│   │   └── types/        # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── frontend/            # React SPA
│   ├── public/
│   │   └── favicon.svg  # App icon
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── pages/       # Page components (Home, Login)
│   │   ├── services/    # API client
│   │   ├── styles/      # Global styles
│   │   └── types/       # TypeScript types
│   ├── index.html
│   └── package.json
├── docker-compose.yml   # PostgreSQL container
├── DEPLOYMENT.md        # Production deployment guide
└── package.json         # Root package with scripts
```

## 🎯 Development Commands

### Root Commands
```bash
npm run install:all      # Install all dependencies
npm run dev              # Start both frontend and backend
npm run build            # Build both projects
npm run docker:up        # Start PostgreSQL
npm run docker:down      # Stop PostgreSQL
```

### Backend Commands (from `/backend`)
```bash
npm run dev                    # Start dev server with hot reload
npm run build                  # Build TypeScript
npm run migration:generate     # Generate new migration
npm run migration:run          # Run pending migrations
npm run migration:revert       # Revert last migration
```

### Frontend Commands (from `/frontend`)
```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## 🗄️ Database Schema

### Users
- Authentication and user management
- Stores username, email, and hashed passwords

### Entries
- Journal entries with mood tracking
- One entry per user per day (enforced by unique index)
- Markdown content support

### AI Query Usage
- Tracks AI query usage for rate limiting
- Records query time and type per user
- Enables 5 queries per hour limit

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/me` - Get current user info

### Entries
- `POST /api/entries` - Create new entry
- `GET /api/entries` - Get all entries (with date filters)
- `GET /api/entries/:id` - Get specific entry
- `GET /api/entries/date/:date` - Get entry for specific date
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Analytics
- `GET /api/streak` - Get streak statistics
- `GET /api/heatmap?days=365` - Get heat map data
- `GET /api/average-mood` - Get average mood statistics

### AI (Requires Anthropic API Key)
- `POST /api/ai/query` - Ask questions about entries
- `GET /api/ai/rate-limit` - Check remaining queries
- `GET /api/ai/health` - Check AI service health

## 🚀 Deployment

The app is deployed on AWS Lightsail. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Production Stack
- **Frontend**: Nginx static hosting at `/var/www/cadence/frontend/`
- **Backend**: Docker container with systemd service
- **Database**: PostgreSQL on the same Lightsail instance
- **Domain**: Configured via Route 53 with Let's Encrypt SSL
- **SSL**: Automated certificate renewal via certbot

### Quick Deploy
```bash
# Build and deploy frontend
cd frontend
npm run build
sudo cp -r dist/* /var/www/cadence/frontend/

# Build and restart backend
cd ../backend
docker build -t cadence-backend .
sudo systemctl restart cadence-backend
```

## 🎨 Design

### Color Palette
- **Background**: Dark grays (#1a1a1a, #2d2d2d, #3d3d3d)
- **Text**: Light grays (#f5f5f5, #b8b8b8, #8a8a8a)
- **Accent**: Orange (#d97706, #ea580c)
- **Moods**: Green to red gradient spectrum

### Mobile Design
- Bottom navigation bar on mobile devices
- Responsive layouts for all screen sizes
- Touch-friendly UI elements

## 🔒 Security

- JWT authentication with httpOnly considerations
- Bcrypt password hashing (salt rounds: 10)
- Rate limiting on AI queries
- Environment-based configuration
- Input validation and sanitization
- SQL injection protection via TypeORM

## 📝 License

MIT

## 🙏 Acknowledgments

- Built with Claude AI assistance
- Inspired by minimalist journaling apps
- UI design influenced by Claude's aesthetic

---

**Made with ❤️ for mindful reflection**
