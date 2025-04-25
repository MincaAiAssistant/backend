# Backend API

This is the backend service for MincaAI - MVP version. It provides RESTful APIs and connects to a database to serve frontend applications.

## 🚀 Tech Stack

- Language: Node.js (Express with TypeScript)
- Database: PostgreSQL, S3, Pinecone
- Authentication: JWT

## 📂 Project Structure

```plaintext
.
├── controllers/    # Request handlers (business logic)
├── db/             # Database connection and query logic
├── middleware/     # Express middlewares (e.g., auth, error handling)
├── models/         # Database models and schema definitions
├── routes/         # API routes definitions
├── utils/          # Utility functions and helpers
├── index.ts        # App entry point
├── server.ts       # Server setup and listening
├── .env            # Environment variables (not committed)
└── .DS_Store       # (ignore this file in production)
```

---

## ⚙️ Setup Instructions

1. Clone the repository:

   ```sh
   git clone https://github.com/MincaAiAssistant/backend.git
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm start
   ```
