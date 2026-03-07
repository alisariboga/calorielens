#!/bin/bash

echo "🚀 CalorieLens Setup Script"
echo "=========================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    exit 1
fi
echo "✅ Node.js version OK"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
cd shared && npm install && cd ..
echo "✅ Dependencies installed"
echo ""

# Build shared types
echo "🔨 Building shared types..."
cd shared && npm run build && cd ..
echo "✅ Shared types built"
echo ""

# Setup server environment
echo "⚙️  Setting up server environment..."
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✅ Created server/.env file"
    echo "⚠️  Please edit server/.env and set a secure JWT_SECRET"
else
    echo "ℹ️  server/.env already exists"
fi
echo ""

# Setup database
echo "💾 Setting up database..."
cd server
npx prisma migrate dev --name init
echo "✅ Database migrations complete"
echo ""

echo "🌱 Seeding database with food items..."
npm run db:seed
echo "✅ Database seeded"
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "The app will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
