# CalorieLens - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm installed

## Quick Setup

```bash
# 1. Run the setup script (does everything automatically)
chmod +x setup.sh
./setup.sh

# 2. Start the application
npm run dev
```

That's it! The app will open at http://localhost:3000

## Manual Setup (if setup.sh doesn't work)

```bash
# 1. Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
cd shared && npm install && cd ..

# 2. Build shared types
cd shared && npm run build && cd ..

# 3. Setup environment
cd server
cp .env.example .env
# Edit .env and set JWT_SECRET to a random string

# 4. Setup database
npx prisma migrate dev --name init
npm run db:seed
cd ..

# 5. Start development servers
npm run dev
```

## First Steps

1. **Register**: Go to http://localhost:3000 and create an account
2. **Onboard**: Complete the 3-step setup wizard
3. **Log a Meal**: Click "Log Meal" and add some foods
4. **View Dashboard**: See your daily progress and calorie tracking

## Test Credentials (if you want to skip setup)

After setting up, you can create a test account:
- Email: test@example.com
- Password: password123

## Common Commands

```bash
# Start development mode
npm run dev

# Run tests
npm test

# View database (Prisma Studio)
cd server && npm run db:studio

# Reset database
cd server && npx prisma migrate reset

# Reseed food database
cd server && npm run db:seed
```

## Troubleshooting

### Port already in use
- Frontend (3000): Edit `client/vite.config.ts`
- Backend (3001): Edit `server/.env`

### Database errors
```bash
cd server
rm -f prisma/dev.db
npx prisma migrate dev --name init
npm run db:seed
```

### Module not found
```bash
cd shared && npm run build
```

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Explore the API endpoints
- Customize the food database
- Add your own features!

## Need Help?

Check the troubleshooting section in README.md or open an issue.
