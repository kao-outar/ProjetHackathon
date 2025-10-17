# 🌐 Mini Social Network – Hackathon October 2025

A complete mini social network built during the **Hackathon October 2025**, using **Node.js**, **Express**, **MongoDB**, and **React/Vue**.  
The project demonstrates secure authentication, API communication, and deployment with **Vercel** and **GitHub Actions**.

---

## 🚀 Overview

This project aims to create a **fully functional social mini-network** that allows users to register, log in, create profiles, comment on others, and view statistics — all within 3 days by a team of 4 junior developers.

---

## 🧠 Features

### 🔐 Authentication
- Sign up / Sign in with token-based sessions (non-JWT)
- Tokens stored securely with manual generation
- Passwords **hashed** with `bcrypt`
- Automatic token renewal & expiration (24 hours)
- Custom error handling (invalid credentials, expired session, etc.)

### 👤 User Profile
- User fields: **Email**, **Name**, **Age**, **Gender**, **Role**
- Profile editing with permission control
- User posts and comments tracking

### 💬 Interactions
- Comment system on posts
- Only the **comment author** can edit or delete their comments
- Post creation, editing, and deletion
- Author-only permissions for post modifications

### 📊 Statistics Dashboard
- Total number of users
- Gender distribution
- Number of posts and comments
- Customizable KPI and charts (frontend visualization)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (or Vue.js) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB Atlas |
| **Auth** | Custom session tokens (non-JWT) |
| **Deployment** | Vercel |
| **CI/CD** | GitHub Actions |
| **Versioning** | GitHub |
| **Testing** | Jest + Supertest + MongoDB Memory Server |

---

## 🗂️ Project Structure

```bash
/project-root
│
├── /frontend
│   ├── /src
│   │   ├── /pages
│   │   ├── /components
│   │   ├── /api
│   │   └── /utils
│   └── package.json
│
├── /backend
│   ├── /api/routes
│   ├── /models
│   ├── /controllers
│   ├── /middleware
│   ├── /tests
│   └── index.js
│
└── README.md
```

---

## 📚 API Documentation

### Base URL
```
Production: https://hackathon-livid-eight.vercel.app/api
Local: http://localhost:3000/api
```

### Authentication
All protected routes require authentication headers:
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

---

## 🔐 Authentication Routes

### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "age": 25,
  "gender": "male"
}
```

**Response (201 Created):**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z"
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity` - Invalid email format
- `422 Unprocessable Entity` - Password too short (minimum 6 characters)
- `422 Unprocessable Entity` - Missing required fields (email, password, name)
- `409 Conflict` - Email already exists

---

### POST /api/auth/signin
Sign in to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "clientToken": "your-generated-client-token-min-32-chars"
}
```

**Response (200 OK):**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z"
  }
}
```

**Error Responses:**
- `422 Unprocessable Entity` - Invalid email format
- `401 Unauthorized` - Invalid credentials
- `422 Unprocessable Entity` - Client token too short (minimum 32 characters)
- `422 Unprocessable Entity` - Missing required fields

---

### POST /api/auth/verify
Verify if a token is still valid.

**Request Body:**
```json
{
  "clientToken": "your-client-token",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Token expired or invalid
- `422 Unprocessable Entity` - Missing token or userId

---

### POST /api/auth/signout
Sign out and invalidate the current token.

**Request Body:**
```json
{
  "clientToken": "your-client-token",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Response (200 OK):**
```json
{
  "message": "Déconnexion réussie"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `422 Unprocessable Entity` - Missing token or userId

---

## 👥 User Routes

### GET /api/users
Get all users (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "age": 25,
      "gender": "male",
      "role": "user",
      "date_created": "2025-10-17T09:00:00.000Z",
      "date_updated": "2025-10-17T09:00:00.000Z",
      "posts": []
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication

---

### GET /api/users/:id
Get a specific user by ID (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "age": 25,
    "gender": "male",
    "role": "user",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z",
    "posts": []
  }
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Missing or invalid authentication

---

### PUT /api/users/:id
Update a user profile (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Request Body (all fields optional):**
```json
{
  "name": "Jane Doe",
  "age": 26,
  "gender": "female",
  "email": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "newemail@example.com",
  "name": "Jane Doe",
  "age": 26,
  "gender": "female",
  "role": "user",
  "date_created": "2025-10-17T09:00:00.000Z",
  "date_updated": "2025-10-17T09:30:00.000Z",
  "posts": []
}
```

**Error Responses:**
- `404 Not Found` - User not found
- `409 Conflict` - Email already in use
- `401 Unauthorized` - Missing or invalid authentication

---

## 📝 Post Routes

### GET /api/posts
Get all posts (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author": "507f1f77bcf86cd799439012",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z",
    "comments": []
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication

---

### GET /api/posts/user/:userId
Get all posts from a specific user (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "author": "507f1f77bcf86cd799439012",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z",
    "comments": []
  }
]
```

**Error Responses:**
- `404 Not Found` - User not found
- `401 Unauthorized` - Missing or invalid authentication

---

### POST /api/posts
Create a new post (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Request Body:**
```json
{
  "title": "My New Post",
  "content": "This is the content of my new post."
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "My New Post",
  "content": "This is the content of my new post.",
  "author": "507f1f77bcf86cd799439012",
  "date_created": "2025-10-17T09:00:00.000Z",
  "date_updated": "2025-10-17T09:00:00.000Z",
  "comments": []
}
```

**Error Responses:**
- `400 Bad Request` - Missing title or content
- `401 Unauthorized` - Missing or invalid authentication

---

### PUT /api/posts/:postId
Update a post (requires authentication, author only).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Request Body:**
```json
{
  "title": "Updated Post Title",
  "content": "Updated post content."
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Updated Post Title",
  "content": "Updated post content.",
  "author": "507f1f77bcf86cd799439012",
  "date_created": "2025-10-17T09:00:00.000Z",
  "date_updated": "2025-10-17T09:30:00.000Z",
  "comments": []
}
```

**Error Responses:**
- `404 Not Found` - Post not found
- `403 Forbidden` - Not authorized (not the author)
- `401 Unauthorized` - Missing or invalid authentication

---

### DELETE /api/posts/:postId
Delete a post (requires authentication, author only).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
{
  "message": "Post supprimé"
}
```

**Error Responses:**
- `404 Not Found` - Post not found
- `403 Forbidden` - Not authorized (not the author)
- `401 Unauthorized` - Missing or invalid authentication

---

## 💬 Comment Routes

### POST /api/comments
Create a new comment (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Request Body:**
```json
{
  "postId": "507f1f77bcf86cd799439011",
  "content": "This is my comment."
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "post": "507f1f77bcf86cd799439011",
  "content": "This is my comment.",
  "author": "507f1f77bcf86cd799439012",
  "date_created": "2025-10-17T09:00:00.000Z",
  "date_updated": "2025-10-17T09:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing postId or content
- `404 Not Found` - Post not found
- `401 Unauthorized` - Missing or invalid authentication

---

### GET /api/comments/post/:postId
Get all comments for a specific post (requires authentication).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "post": "507f1f77bcf86cd799439011",
    "content": "This is my comment.",
    "author": "507f1f77bcf86cd799439012",
    "date_created": "2025-10-17T09:00:00.000Z",
    "date_updated": "2025-10-17T09:00:00.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication

---

### PUT /api/comments/:commentId
Update a comment (requires authentication, author only).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Request Body:**
```json
{
  "content": "Updated comment content."
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "post": "507f1f77bcf86cd799439011",
  "content": "Updated comment content.",
  "author": "507f1f77bcf86cd799439012",
  "date_created": "2025-10-17T09:00:00.000Z",
  "date_updated": "2025-10-17T09:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found` - Comment not found
- `403 Forbidden` - Not authorized (not the author)
- `401 Unauthorized` - Missing or invalid authentication

---

### DELETE /api/comments/:commentId
Delete a comment (requires authentication, author only).

**Headers Required:**
```
x-client-token: <your-client-token>
x-user-id: <your-user-id>
```

**Response (200 OK):**
```json
{
  "message": "Commentaire supprimé"
}
```

**Error Responses:**
- `404 Not Found` - Comment not found
- `403 Forbidden` - Not authorized (not the author)
- `401 Unauthorized` - Missing or invalid authentication

---

## 🧪 Testing

The backend includes comprehensive unit tests with **73 tests** covering all routes and models.

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

### Test Coverage
- **Overall Coverage**: 94.11%
- **Routes**: 100%
- **Models**: 100%
- **Middleware**: 85%
- **Test Suites**: 7 passed
- **Tests**: 73 passed

### Test Structure
```
tests/
├── auth.test.js           # Authentication routes (23 tests)
├── auth-simple.test.js    # Basic auth tests (4 tests)
├── users-simple.test.js   # User routes (5 tests)
├── posts.test.js          # Post routes (11 tests)
├── comments.test.js       # Comment routes (10 tests)
├── integration.test.js    # Integration tests (6 tests)
├── models.test.js         # Mongoose models (14 tests)
└── globalSetup.js         # Test configuration
```

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Add your MongoDB URI to .env
MONGO_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development

# Start development server
npm start

# Or for production
npm run start:prod
```

### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

---

## 🚀 Deployment

### Backend (Vercel)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_ENV`: production
4. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Import frontend project in Vercel
2. Add environment variable:
   - `VITE_API_URL`: Your backend API URL
3. Deploy automatically on push to main branch

---

## 🔒 Security Notes

### Token Management
- **Token Generation**: Client-side tokens must be at least 32 characters
- **Token Hashing**: Tokens are hashed with bcrypt (10 rounds) before storage
- **Token Expiration**: Tokens expire after 24 hours
- **Token Verification**: All protected routes verify token validity

### Password Security
- **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
- **Password Validation**: Minimum 6 characters required
- **No Password Exposure**: Passwords are never returned in API responses

### Data Protection
- **Sensitive Data**: password, token, and token_expiration are never included in responses
- **Author Permissions**: Only authors can edit/delete their own posts and comments
- **Admin Override**: Admin users can edit/delete any content (if role='admin')

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String (required, unique, validated),
  password: String (required, hashed),
  name: String (required),
  age: Number (optional),
  gender: String (optional, enum: ['male', 'female', 'other']),
  role: String (default: 'user'),
  token: String (hashed),
  token_expiration: Date,
  uuid: String,
  date_created: Date (auto),
  date_updated: Date (auto),
  posts: [ObjectId] (ref: 'Post')
}
```

### Post Model
```javascript
{
  title: String (required),
  content: String (required),
  author: ObjectId (required, ref: 'User'),
  date_created: Date (auto),
  date_updated: Date (auto),
  comments: [ObjectId] (ref: 'Comment')
}
```

### Comment Model
```javascript
{
  post: ObjectId (required, ref: 'Post'),
  content: String (required),
  author: ObjectId (required, ref: 'User'),
  date_created: Date (auto),
  date_updated: Date (auto)
}
```

---

## 🛠️ Development Scripts

```bash
# Backend
npm start              # Start development server
npm test              # Run all tests
npm run test:coverage # Run tests with coverage report
npm run test:watch    # Run tests in watch mode
npm run test:verbose  # Run tests with detailed output

# Frontend
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
```

---

## 👥 Team

Developed during the **Hackathon October 2025** by a team of 4 junior developers:
- Backend API with authentication
- Frontend user interface
- Database design and optimization
- Deployment and CI/CD setup

---

## 📄 License

This project is part of an educational hackathon.

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 Known Issues & Future Improvements

- [ ] Add file upload for user avatars
- [ ] Implement real-time notifications with WebSockets
- [ ] Add pagination for posts and comments
- [ ] Implement search functionality
- [ ] Add email verification
- [ ] Create admin dashboard
- [ ] Add rate limiting
- [ ] Implement refresh tokens

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the development team.
