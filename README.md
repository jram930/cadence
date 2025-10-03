# Micro Journal

A beautiful micro-journaling app with mood tracking, streak counters, and calendar heat maps.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with TypeORM
- **Styling**: CSS with Claude-inspired theme (grays + orange accent)

## Prerequisites

- Node.js 18+
- Docker Desktop
- npm

## Quick Start

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start PostgreSQL**:
   ```bash
   npm run docker:up
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3000

## Project Structure

```
.
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite app
├── docker-compose.yml
└── package.json
```

## Development Commands

- `npm run dev` - Start both frontend and backend
- `npm run build` - Build both projects
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run db:migrate` - Run database migrations

## Future Deployment (AWS)

- **Frontend**: AWS S3 + CloudFront
- **Backend**: AWS ECS/Fargate or Elastic Beanstalk
- **Database**: AWS RDS PostgreSQL

## Features

- 📝 Quick daily journal entries
- 😊 Mood tracking with visual indicators
- 🔥 Streak counter for consistent journaling
- 📅 Beautiful calendar heat map visualization
- 🎨 Claude-inspired UI theme
