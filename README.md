# Agency Operating System

A specialized Internal OS for freelancers and small agencies to manage deliverables, approvals, and invoices.

## Project Structure

- `server/`: Node.js + Fastify + Prisma (Backend)

- `web/`: Next.js (Web App)
- `docker-compose.yml`: Database configuration

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- Postgres (Local or via Docker)

### 1. Database Setup

The project is designed to run with Docker. Can be started with:
```bash
docker compose up -d
```
*Note: If Docker is unavailable, you must provide a running Postgres instance and update `server/.env` with the correct `DATABASE_URL`.*

### 2. Backend Setup

```bash
cd server
npm install
# Initialize Database Schema (Requires running Postgres)
npx prisma migrate dev --name init
# Generate Prisma Client
npx prisma generate
# Start Server
npm run dev
```

### 3. Web Setup (Next.js)

```bash
cd web
npm install
npm run dev
```

## Features Implemented

- **Authentication**: JWT-based auth for Owners/Team.
- **Project Management**: Create and list projects.
- **Deliverables**: Upload (stub) and client approval workflow.
- **Client Access**: Token-based access for clients (no login required).

## Known Issues (Environment)

- The development environment encountered issues with Docker and Prisma CLI connectivity.
- `npx prisma migrate` and `npx prisma generate` MUST be run successfully for the backend to function and for type checking to pass.
