# CodeArena - AI-Powered Competitive Coding Platform

CodeArena is a modern, premium competitive programming platform where users can solve algorithmic challenges, receive progressive AI-powered hints, view detailed execution statistics, and track leaderboard ranks.

---

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Lucide Icons, Recharts, Zustand (State Management)
- **Backend (API Gateway)**: Node.js, Express.js, Prisma ORM, JWT Authentication
- **Worker (Execution Engine)**: Node.js, BullMQ, Redis (for queued code evaluation)
- **Database**: PostgreSQL (User accounts, problems, submissions, statistics)
- **Email Gateway**: Resend API (for secure 6-digit OTP verification and password resets)

---

## 🛠️ Prerequisites

Before running CodeArena locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Docker & Docker Compose](https://www.docker.com/)
- [Git](https://git-scm.com/)

---

## ⚙️ Setup and Installation

Follow these steps to set up CodeArena locally:

### 1. Start Database & Redis Services
CodeArena uses PostgreSQL for storage and Redis for queuing submissions. Spin them up instantly using the root docker-compose configuration:
```bash
docker compose up -d
```

### 2. Configure Environment Variables
Create a `.env` configuration file in both the **`backend/`** and **`worker/`** directories.

#### Backend Env (`backend/.env`):
```env
PORT=5000
DATABASE_URL="postgresql://postgres:123456@127.0.0.1:5432/codearena?schema=public"
JWT_ACCESS_SECRET="your-super-secret-access-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
REDIS_URL="redis://localhost:6379"
GEMINI_API_KEY="your-gemini-api-key"
RESEND_API_KEY="your-resend-api-key"
```

#### Worker Env (`worker/.env`):
```env
DATABASE_URL="postgresql://postgres:123456@127.0.0.1:5432/codearena?schema=public"
REDIS_URL="redis://localhost:6379"
```

### 3. Install Package Dependencies
Install the package dependencies inside the frontend, backend, and worker directories:
```bash
# Install backend dependencies
cd backend
npm install

# Install worker dependencies
cd ../worker
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Initialize PostgreSQL Schema & Seed Data
Generate the Prisma Client and run the schema migrations to configure PostgreSQL:
```bash
cd ../backend
npx prisma generate
npx prisma migrate dev --name init

# (Optional) Seed initial coding problems
npm run prisma:seed
```

---

## 🏃 Running the Application

Start the development servers for all three components:

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *(Running on http://localhost:5000)*

2. **Start Code Execution Worker**:
   ```bash
   cd worker
   npm run dev
   ```

3. **Start Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   *(Running on http://localhost:3000)*

---

## 🔐 Credentials (Default Seed Accounts)
If you ran the seed script, you can log in using these default accounts:

* **Admin User**:
  - Username: `admin`
  - Email: `admin@codearena.com`
  - Password: `AdminPassword123`
  
* **Test User**:
  - Username: `testuser`
  - Email: `testuser@codearena.com`
  - Password: `TestPassword123`
