# CalorieLens - Weight Loss Calorie Tracking MVP

CalorieLens is a full-stack web application for tracking calories and managing weight loss goals with support for "calorie debt" amortization.

## Features

✅ **User Authentication** - Secure email/password registration and login
✅ **Onboarding** - Multi-step wizard to calculate BMR, TDEE, and daily calorie targets
✅ **Meal Logging** - Log meals via photo upload or text entry
✅ **Food Database** - 200+ common foods with calories and macros
✅ **Daily Tracking** - Real-time dashboard showing calories consumed vs target
✅ **Weekly Charts** - Visual progress tracking over 7 days
✅ **Calorie Debt** - Amortize overages across future days with safety limits
✅ **Settings** - Update profile and recalculate targets

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (navigation)
- Recharts (data visualization)
- Axios (API client)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- SQLite database
- JWT authentication
- Bcrypt password hashing
- Multer (file uploads)
- Zod (validation)

### Testing
- Jest (server tests)
- Vitest (client tests)

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
cd calorielens

# Install all dependencies (root, server, client, shared)
npm run install:all
```

### 2. Setup Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-this-to-a-secure-random-string"
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./uploads
```

### 3. Setup Database

```bash
# From the server directory
cd server

# Run Prisma migrations to create the database schema
npx prisma migrate dev --name init

# Seed the database with 200+ common foods
npm run db:seed
```

### 4. Build Shared Types

```bash
# From the root directory
cd ../shared
npm run build
```

## Running the Application

### Development Mode

From the root directory:

```bash
# Start both client and server concurrently
npm run dev
```

This will start:
- **Backend API**: http://localhost:3001
- **Frontend**: http://localhost:3000

### Production Build

```bash
# Build both client and server
npm run build

# Start server (after building)
cd server && npm start
```

## Testing

```bash
# Run all tests
npm test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client
```

## Usage Guide

### 1. Register & Onboard

1. Navigate to http://localhost:3000
2. Click "Sign up" and create an account
3. Complete the onboarding wizard:
   - Enter your sex, age, height, weight
   - Select your activity level
   - Choose your weight loss goal (0.25-1 kg/week)
4. Review your calculated BMR, TDEE, and daily calorie target

### 2. Log Meals

1. Click "Log Meal" in the navigation
2. Choose meal type (breakfast/lunch/dinner/snack)
3. Search for foods and add them to your meal
4. Adjust portion sizes (in grams)
5. Save the meal

**Photo Upload**: You can upload a photo for reference, but food detection is manual in this MVP. Future versions can integrate ML models for automated recognition.

### 3. Track Progress

- **Dashboard** shows today's calories consumed vs target
- **Macros** display protein, carbs, and fat totals
- **Weekly chart** visualizes your 7-day progress
- **Meal list** shows all logged meals for the day

### 4. Manage Calorie Debt

If you go over your daily target:

1. Navigate to the Debt Management page
2. Click "Create Debt" on any overage
3. Choose payback period (1-30 days)
4. The system will reduce your daily target until debt is paid

**Safety Features**:
- Will not reduce below 1200 cal for females or 1500 cal for males
- Automatically extends payback period if needed
- Shows progress and remaining balance

### 5. Update Settings

- Adjust your weight as you progress
- Change activity level
- Modify weight loss goal rate
- View recalculated BMR, TDEE, and targets

## Project Structure

```
calorielens/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (auth)
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── index.ts       # Server entry point
│   │   └── seed.ts        # Database seeder
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
├── shared/                 # Shared TypeScript types
│   └── src/
│       └── index.ts       # Type definitions
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Profile
- `POST /api/profile` - Create/update profile (onboarding)
- `GET /api/profile` - Get user profile

### Meals
- `POST /api/meals` - Create meal (with optional photo)
- `POST /api/meals/parse-text` - Parse text input for foods
- `POST /api/meals/:mealId/items` - Add item to meal
- `GET /api/meals?date=YYYY-MM-DD` - Get meals for date
- `DELETE /api/meals/:mealId` - Delete meal

### Summary
- `GET /api/summary/today` - Get today's summary
- `GET /api/summary/week` - Get weekly summary

### Debt
- `POST /api/debt/create` - Create calorie debt
- `GET /api/debt/status` - Get debt status
- `DELETE /api/debt/:debtId` - Cancel debt

### Food
- `GET /api/food/search?q=query` - Search food database

## Calculations

### BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation

```
Men: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
Women: BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### TDEE (Total Daily Energy Expenditure)

```
Sedentary: BMR × 1.2
Light: BMR × 1.375
Moderate: BMR × 1.55
Active: BMR × 1.725
Very Active: BMR × 1.9
```

### Daily Deficit

```
Deficit = (goal_kg_per_week × 7700) / 7

Daily Target = TDEE - Deficit

Minimum: 1200 cal (female) or 1500 cal (male)
```

## Development Notes

### Photo-to-Food Detection

This MVP uses a user-assisted approach:
1. User uploads photo (optional, for reference)
2. User manually searches and adds foods
3. Portion sizes are confirmed/adjusted by user

**Future Enhancement**: The `FoodDetectionService` is designed to be swapped out with an ML model (e.g., local TensorFlow.js model or cloud vision API) without changing the API interface.

### Database Seeding

The seed script includes 200+ common foods covering:
- Proteins (meat, fish, eggs, dairy, plant-based)
- Carbs (grains, bread, potatoes, pasta)
- Vegetables & fruits
- Nuts & seeds
- Fats & oils
- Snacks & treats
- Restaurant/fast food items

### Safety & Disclaimers

- Medical disclaimer shown in UI
- Calorie estimates are always labeled as approximate
- Minimum daily calories enforced (1200F/1500M)
- Debt payback periods auto-adjusted if targets would be unsafe

## Troubleshooting

### Database Issues

```bash
# Reset database
cd server
rm -f prisma/dev.db
npx prisma migrate reset
npm run db:seed
```

### Port Conflicts

If ports 3000 or 3001 are in use:
- Client: Edit `client/vite.config.ts` → change `server.port`
- Server: Edit `server/.env` → change `PORT`

### Module Not Found Errors

```bash
# Rebuild shared types
cd shared
npm run build

# Reinstall dependencies
cd ..
rm -rf node_modules client/node_modules server/node_modules shared/node_modules
npm run install:all
```

## Known Limitations (MVP)

1. **Photo Recognition**: Manual food entry required (ML integration planned)
2. **Barcode Scanning**: Not implemented
3. **Meal Templates**: Not implemented
4. **Social Features**: Not implemented
5. **Mobile Apps**: Web-only (responsive design included)

## Future Enhancements

- [ ] Integrate local ML model for image-based food detection
- [ ] Add barcode scanner using QuaggaJS
- [ ] Implement meal templates and favorites
- [ ] Add export to PDF/CSV
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support
- [ ] Integration with fitness trackers

## License

MIT License - See LICENSE file for details

## Medical Disclaimer

CalorieLens provides calorie estimates for informational purposes only. These estimates are approximate and should not be considered medical advice. Consult with a healthcare professional before starting any diet or exercise program. Individual nutritional needs vary based on many factors including age, sex, activity level, metabolism, and health conditions.

## Support

For issues or questions, please open a GitHub issue or contact support.

---

**Built with ❤️ for people on their weight loss journey**
