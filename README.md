# Restaurant Revenue Analytics - Local Installation Guide

Complete guide to set up and run this project locally on Linux/macOS from scratch.

## Prerequisites

### 1. Install Node.js and npm

**macOS (using Homebrew):**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js (includes npm)
brew install node@18
```

**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Verify installation:**
```bash
node --version  # Should be >= 18.x
npm --version   # Should be >= 10.9.2
```

### 2. Install MongoDB

**macOS:**
```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB service
brew services start mongodb-community@7.0
```

**Linux (Ubuntu/Debian):**
```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

## Project Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd my-turborepo

# Install all dependencies (monorepo-wide)
npm install
```

### 2. Configure Environment Variables

**API Configuration:**
```bash
# Create environment file for API
cat > apps/api/.env << 'EOF'
# Server Configuration
PORT=3214
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-analytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration (optional)
CORS_ORIGIN=http://localhost:3000
EOF
```

**Web Configuration:**
```bash
# Create environment file for web app
cat > apps/web/.env.local << 'EOF'
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3214/api
EOF
```

**Important:** Change `JWT_SECRET` to a secure random string in production.

### 3. Initialize Database

**Seed the database with initial data:**
```bash
cd apps/api
npm run seed
cd ../..
```

This creates:
- Default admin user (credentials will be shown in console output)
- Sample revenue data for testing

## Running the Application

### Development Mode (Recommended)

**Start all services:**
```bash
# From project root - runs both API and web app
npm run dev
```

This starts:
- API server: http://localhost:3214
- Web app: http://localhost:3000
- API documentation: http://localhost:3214/api-docs

**Start individual services:**
```bash
# API only
turbo dev --filter=api

# Web app only
turbo dev --filter=web
```

### Production Build

```bash
# Build all apps
npm run build

# Start API in production mode
cd apps/api
npm start

# Start web app in production mode
cd apps/web
npm start
```

## Verify Installation

### 1. Check API Health

```bash
curl http://localhost:3214/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 2. Access Swagger Documentation

Open browser: http://localhost:3214/api-docs

### 3. Access Web Application

Open browser: http://localhost:3000

### 4. Test Admin Login

Use credentials from the seed script output to log in at:
http://localhost:3000/admin/login

## Database Management

### View Database Contents

```bash
# Connect to MongoDB shell
mongosh

# Switch to database
use restaurant-analytics

# View collections
show collections

# View admin users
db.admins.find().pretty()

# View revenue data
db.revenuedata.find().limit(5).pretty()

# Exit
exit
```

### Reset Database

```bash
# Drop database and re-seed
mongosh restaurant-analytics --eval "db.dropDatabase()"
cd apps/api
npm run seed
```

## Development Commands

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run check-types
```

### Code Formatting
```bash
npm run format
```

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongooseServerSelectionError"**
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list | grep mongodb  # macOS

# Restart MongoDB
sudo systemctl restart mongod  # Linux
brew services restart mongodb-community  # macOS
```

### Port Already in Use

**Error: "EADDRINUSE: address already in use :::3214"**
```bash
# Find and kill process using port 3214
lsof -ti:3214 | xargs kill -9

# Or use a different port in apps/api/.env
PORT=3215
```

### Module Not Found Errors

```bash
# Clean install all dependencies
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Build Errors

```bash
# Clean Turborepo cache
rm -rf .turbo apps/*/.turbo packages/*/.turbo

# Rebuild
npm run build
```

## Project Structure

```
my-turborepo/
├── apps/
│   ├── api/          # Express.js REST API (port 3214)
│   └── web/          # Next.js frontend (port 3000)
├── packages/
│   ├── ui/           # Shared React components
│   ├── eslint-config/
│   └── typescript-config/
└── turbo.json        # Turborepo configuration
```

## Default Credentials

After seeding, check the console output for admin credentials, typically:
- **Email:** admin@restaurant.com
- **Password:** (generated during seed)

## Next Steps

1. Review API documentation at http://localhost:3214/api-docs
2. Explore the admin dashboard at http://localhost:3000/admin
3. Check revenue analytics at http://localhost:3000/revenue
4. Review [CLAUDE.md](./CLAUDE.md) for development guidelines

## Support

For issues or questions, refer to the troubleshooting section above or check the application logs
