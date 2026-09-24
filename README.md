# Student AI Platform

An AI-powered study tool where students can generate quizzes from their own notes, take extracted paper-based tests, and get AI explanations for the questions they get wrong.

## Tech Stack
- **Backend:** Laravel 12 (REST API) + Laravel Sanctum (authentication)
- **AI:** Google Gemini API
- **Frontend:** React 19 + Vite + Tailwind CSS + React Router

## Project Structure
```
student_ai_platform/
  backend/    → Laravel API
  frontend/   → React app
```

## Features
- User registration, login, and profile management (including profile photo upload and account deletion)
- **AI Quiz Generator** — generate a quiz automatically from source notes using Gemini
- Submit quiz answers and get a scored result (correct/wrong count)
- Ask the AI to explain any wrong answers on a quiz
- **Paper Test extraction** — extract test questions (e.g. from an uploaded paper/document) into a structured test
- Take an extracted paper test, submit answers, and get explanations for wrong answers
- View history of past quizzes and paper tests

## Database Tables
`users`, `quizzes`, `paper_tests`, `personal_access_tokens`, `cache`, `jobs`

The `quizzes` and `paper_tests` tables each store their questions and answers as structured data, along with a correct/wrong count for scoring.

## API Routes

### Public
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/register | Create a new account |
| POST | /api/login | Log in and receive a token |

### Authenticated (requires login)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/user | Get the logged-in user's info |
| POST | /api/profile-photo | Update profile photo |
| DELETE | /api/account | Delete account |
| POST | /api/logout | Log out |
| POST | /api/generate-quiz | Generate a new quiz using AI from provided notes |
| GET | /api/quizzes | List the user's quizzes |
| DELETE | /api/quizzes/{id} | Delete a quiz |
| POST | /api/quizzes/{id}/submit | Submit answers to a quiz and get a score |
| POST | /api/quizzes/{id}/explain | Get an AI explanation for wrong answers |
| POST | /api/paper-tests/extract | Extract a paper test into structured questions |
| GET | /api/paper-tests | List the user's paper tests |
| GET | /api/paper-tests/{id} | View a specific paper test |
| POST | /api/paper-tests/{id}/submit | Submit answers to a paper test and get a score |
| POST | /api/paper-tests/{id}/explain | Get an AI explanation for wrong answers |
| DELETE | /api/paper-tests/{id} | Delete a paper test |

## Frontend Pages
`Login`, `Register`, `Dashboard`, `QuizGenerator`, `MyQuizzes`, `PaperUpload`, `PaperTest`, `MyPaperTests`, `Settings`

## Setup Instructions

### Backend
1. `composer install`
2. Copy `.env.example` to `.env` and set your MySQL database credentials
3. Add your Gemini API key to `.env` as `GEMINI_API_KEY=your_key_here`
4. `php artisan key:generate`
5. `php artisan migrate`
6. `php artisan serve`

### Frontend
1. `npm install`
2. `npm run dev`

## Author
Talha Habib
