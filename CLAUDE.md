# CLAUDE.md - Micro Journal

This file provides guidance to Claude Code when working with the Micro Journal application.

## Project Overview

Micro Journal is a beautiful journaling app with mood tracking, streak counters, and calendar heat maps. Built as a full-stack TypeScript application with React frontend and Node.js backend.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with TypeORM
- **Styling**: Custom CSS with Claude-inspired theme (grays + orange)

## Project Structure

```
.
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── entities/     # TypeORM entities
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   ├── styles/      # Global styles
│   │   └── types/       # TypeScript types
│   └── package.json
└── docker-compose.yml   # PostgreSQL container
```

## Development Setup

### First Time Setup

1. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start PostgreSQL**:
   ```bash
   npm run docker:up
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:3000

### Common Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Database
npm run docker:up        # Start PostgreSQL container
npm run docker:down      # Stop PostgreSQL container
npm run db:migrate       # Run database migrations

# Build
npm run build            # Build both projects
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only
```

### Backend Commands (from /backend directory)

```bash
cd backend
npm run dev                # Start dev server with hot reload
npm run build              # Build TypeScript
npm run start              # Start production server
npm run migration:generate # Generate new migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
```

### Frontend Commands (from /frontend directory)

```bash
cd frontend
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Database Schema

### Users Table
- `id` (uuid, primary key)
- `username` (unique)
- `email` (unique)
- `passwordHash`
- `createdAt`, `updatedAt`

### Entries Table
- `id` (uuid, primary key)
- `content` (text)
- `mood` (enum: amazing, good, okay, bad, terrible)
- `entryDate` (date, unique per user)
- `userId` (foreign key)
- `createdAt`, `updatedAt`

## API Endpoints

### Entries
- `POST /api/entries` - Create new entry
- `GET /api/entries` - Get all entries (with optional date filters)
- `GET /api/entries/:id` - Get entry by ID
- `GET /api/entries/date/:date` - Get entry for specific date
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Analytics
- `GET /api/streak` - Get streak data (current, longest, total)
- `GET /api/heatmap?days=365` - Get heat map data

### Health
- `GET /api/health` - Health check endpoint

## Key Features

### 1. Mood Tracking
Users can select from 5 mood states for each entry:
- Amazing 🤩
- Good 😊
- Okay 😐
- Bad 😞
- Terrible 😢

Each mood has a corresponding color in the heat map.

### 2. Streak Counter
Calculates and displays:
- Current streak (consecutive days with entries)
- Longest streak ever
- Total number of entries

### 3. Calendar Heat Map
Visual representation of journaling activity over the past year, with:
- Color-coded cells based on mood
- Interactive cells (click to view entry)
- Week-by-week layout

## Design System

The app uses a Claude-inspired color theme:

### Colors
- **Background**: Dark grays (#1a1a1a, #2d2d2d, #3d3d3d)
- **Text**: Light grays (#f5f5f5, #b8b8b8, #8a8a8a)
- **Accent**: Orange (#d97706, #ea580c)
- **Moods**: Green to red spectrum

### Spacing
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem

## Authentication (Future)

Currently uses a simple header-based user ID (`x-user-id: default-user-id`) for prototyping.

For production deployment:
- Add JWT authentication
- Implement login/signup endpoints
- Add session management
- Secure API endpoints

## AWS Deployment Plan

### Frontend (React)
- **Build**: `npm run build:frontend`
- **Hosting**: AWS S3 + CloudFront
- **Domain**: Route 53 (optional)

### Backend (Node.js)
- **Container**: Docker image
- **Hosting Options**:
  - AWS ECS/Fargate (recommended)
  - AWS Elastic Beanstalk
  - AWS Lambda + API Gateway (serverless)
- **Load Balancer**: Application Load Balancer

### Database (PostgreSQL)
- **Service**: AWS RDS PostgreSQL
- **Backups**: Automated daily backups
- **Multi-AZ**: For high availability

### Infrastructure as Code
Consider using:
- AWS CDK (TypeScript)
- Terraform
- CloudFormation

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=journal_user
DB_PASSWORD=journal_pass
DB_DATABASE=micro_journal
```

### Frontend
No environment variables needed (uses proxy to backend during development).

## Development Notes

- TypeORM `synchronize: true` is enabled in development for automatic schema updates
- Use migrations in production (`synchronize: false`)
- Frontend uses Vite proxy to avoid CORS issues in development
- All dates are stored as UTC and handled with date-fns
- One entry per user per day (enforced by unique index)

## Testing (Future)

### Backend
- Unit tests: Jest
- API tests: Supertest
- Test database: Separate PostgreSQL instance

### Frontend
- Component tests: React Testing Library
- E2E tests: Playwright or Cypress

## Performance Considerations

- Heat map limited to 365 days to prevent large data transfers
- Entries are paginated (implement when entry count grows)
- Database indexes on `userId` and `entryDate`
- Consider caching streak data (Redis) for high traffic

## Security Checklist for Production

- [ ] Add authentication (JWT)
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (TypeORM handles this)
- [ ] CORS configuration
- [ ] HTTPS only
- [ ] Environment variables for secrets
- [ ] Database connection pooling
- [ ] Request logging and monitoring
