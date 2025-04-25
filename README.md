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

---

## 🔐 Environment Variables

Create a .env file with the following variables:

- PORT=3000
- DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>?sslmode=require
- JWT_SECRET=<your-jwt-secret>
- AWS_ACCESS_KEY_ID=<your-aws-access-key-id>
- AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
- AWS_REGION=ap-southeast-2
- S3_BUCKET_NAME=<your-s3-bucket-name>
- CORS_ORIGINS=<your-cors-list>
- AI_AGENT_API=https://<your-ai-agent-api-url>
- OPENAI_API_KEY=<your-openai-api-key>
- ATTACHMENT_API=https://<your-attachment-api-url>
- PINECONE_API_KEY=<your-pinecone-api-key>
- INDEX_NAME=<your-index-name>
- INDEX_HOST=https://<your-index-host>
