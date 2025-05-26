# AI Resume Generator - Server

This is the backend server for the AI Resume Generator application, built with Node.js, Express, and Firebase.

## Features

- User authentication with Firebase Authentication
- User profile management
- Secure API endpoints
- Integration with OpenAI for AI-powered resume generation
- Role-based access control
- Rate limiting and security best practices

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase project with Firestore and Authentication enabled
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   
   # Firebase
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   
   # JWT
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRE=30d
   
   # OpenAI
   OPENAI_API_KEY=your-openai-api-key
   
   # CORS
   CLIENT_URL=http://localhost:3000
   ```

4. Place your Firebase service account key file as `serviceAccountKey.json` in the `config` directory

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/updatedetails` - Update user details
- `PUT /api/v1/auth/updatepassword` - Update password

## Security

This application implements several security best practices:

- Helmet for setting various HTTP headers for security
- Rate limiting to prevent brute force attacks
- Data sanitization to prevent NoSQL injection
- XSS protection
- HTTP Parameter Pollution protection
- Secure cookie settings
- JWT authentication

## Environment Variables

- `NODE_ENV` - Node environment (development/production)
- `PORT` - Port to run the server on
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `JWT_SECRET` - Secret for JWT
- `JWT_EXPIRE` - JWT expiration time
- `OPENAI_API_KEY` - OpenAI API key
- `CLIENT_URL` - URL of the client application for CORS

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
