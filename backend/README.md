# Elite DevHack 2026 - Backend API

A RESTful API for a competitive programming platform built with Node.js, Express, and MongoDB.

## Project Structure

```
backend/
├── config/             # Configuration files
│   ├── database.js    # MongoDB connection
│   └── jwt.js         # JWT utilities
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── userController.js
│   ├── problemController.js
│   ├── submissionController.js
│   └── contestController.js
├── middleware/         # Custom middleware
│   ├── auth.js        # Authentication middleware
│   └── errorHandler.js
├── models/            # Mongoose schemas
│   ├── User.js
│   ├── Problem.js
│   ├── Submission.js
│   └── Contest.js
├── routes/            # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── problemRoutes.js
│   ├── submissionRoutes.js
│   └── contestRoutes.js
├── .env.example       # Environment variables template
├── .gitignore
├── Dockerfile
├── package.json
└── server.js          # Entry point
```

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: User profiles, ratings, and leaderboard
- **Problems**: CRUD operations for coding problems with test cases
- **Submissions**: Code submission and evaluation system
- **Contests**: Contest management with registration and leaderboards
- **Role-Based Access**: Admin and user roles with protected routes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/elite_devhack
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

### Running the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/leaderboard` - Get leaderboard

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get problem by ID
- `POST /api/problems` - Create problem (admin only)
- `PUT /api/problems/:id` - Update problem (admin only)
- `DELETE /api/problems/:id` - Delete problem (admin only)

### Submissions
- `POST /api/submissions` - Submit solution (protected)
- `GET /api/submissions/user/:userId` - Get user submissions (protected)
- `GET /api/submissions/problem/:problemId` - Get problem submissions (protected)
- `GET /api/submissions/:id` - Get submission by ID (protected)

### Contests
- `GET /api/contests` - Get all contests
- `GET /api/contests/:id` - Get contest by ID
- `POST /api/contests` - Create contest (admin only)
- `PUT /api/contests/:id` - Update contest (admin only)
- `DELETE /api/contests/:id` - Delete contest (admin only)
- `POST /api/contests/:id/register` - Register for contest (protected)

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected routes require valid JWT token
- Admin-only routes for sensitive operations
- Input validation on all endpoints

## License

ISC
