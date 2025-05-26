# AI-Powered Resume & Cover Letter Generator

A modern web application that uses AI to generate professional resumes and cover letters tailored to specific job applications.

## Features

- AI-powered resume and cover letter generation
- ATS optimization with keyword scoring
- Job description parsing and personalization
- Export to PDF/DOCX formats
- Portfolio site generation (coming soon)
- Subscription-based access

## Tech Stack

- Frontend: React.js + Tailwind CSS
- Backend: Node.js (Express)
- AI: OpenAI GPT-4
- Database: PostgreSQL
- Authentication: Firebase Auth
- Payments: Stripe

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- OpenAI API key
- Firebase configuration
- Stripe API keys

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
ai-resume-generator/
├── client/           # React frontend
├── server/           # Node.js backend
├── .env.example      # Environment variables template
├── package.json
└── README.md
```
