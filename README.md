# Calculator App with Neon Database

A simple calculator with calculation history stored in PostgreSQL (Neon).

## Project Structure

```
calculator-app/
├── backend/          # Express.js API
│   ├── index.js      # Server & API routes
│   ├── package.json
│   └── .env.example
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup

### 1. Create Neon Database

1. Go to [Neon](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string from the dashboard

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Neon connection string
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

## Development

Start backend:
```bash
cd backend
npm run dev
```

Start frontend (in another terminal):
```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## Deployment Options

### Option 1: Deploy to Render.com (Recommended)

**Backend:**
1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your repo, select `/backend` as root directory
4. Add environment variable: `DATABASE_URL` = your Neon connection string
5. Set `NODE_ENV` = `production`

**Frontend:**
1. Create a Static Site on Render
2. Connect repo, select `/frontend` as root directory
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add env variable: `VITE_API_URL` = your backend URL

### Option 2: Deploy to Railway

1. Push to GitHub
2. Create new project on Railway
3. Add both services (backend & frontend)
4. Configure environment variables

### Option 3: Deploy to Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
1. Import project, set root to `frontend`
2. Add `VITE_API_URL` environment variable

**Backend on Railway:**
1. Import project, set root to `backend`
2. Add `DATABASE_URL` environment variable

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/calculate` - Calculate expression and save to history
- `GET /api/history` - Get calculation history (last 50)
- `DELETE /api/history` - Clear all history

## Environment Variables

### Backend
- `DATABASE_URL` - Neon PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Frontend
- `VITE_API_URL` - Backend API URL (empty for development proxy)
