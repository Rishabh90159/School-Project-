# Student Learning Portal (MERN)

A full-stack student learning portal where a **teacher** can manage ~500 students, and **students** can access materials, take quizzes, submit assignments, and view results.

## Tech Stack

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (MongoDB Atlas free tier)
- **Auth:** JWT
- **File storage:** Cloudinary (free plan) for PDFs and assignments
- **Hosting:** Render (static + web service)

## Quick Start

### 1. Clone and install

```bash
cd "School Project"
npm run install:all
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

- `MONGO_URI` – MongoDB connection string (e.g. from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- `JWT_SECRET` – A long random string for signing tokens
- `ALLOW_TEACHER_REGISTER=true` – Allow creating the first teacher (set to `false` after signup)
- **Cloudinary** (optional for file uploads): create a free account at [cloudinary.com](https://cloudinary.com), then set:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 3. Run development

From project root:

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000 (API at `/api`)

Or run separately:

```bash
# Terminal 1 – backend
cd server && npm run dev

# Terminal 2 – frontend
cd client && npm run dev
```

### 4. First-time setup

1. Open http://localhost:3000
2. Click **Teacher / Admin** and create the teacher account (first signup only if `ALLOW_TEACHER_REGISTER=true`)
3. Log in as teacher and add students, materials, quizzes, assignments, announcements
4. Students sign up via **Sign up** and use the student dashboard

## Features

### Students

- Register / Login  
- Dashboard with quick stats and announcements  
- Study materials (download PDFs / notes)  
- Quizzes (attempt, submit, see score)  
- Assignments (view, submit file)  
- My results  
- Ask doubts (Q&A)  
- Leaderboard  

### Teacher (Admin)

- Login to admin dashboard  
- Add / remove students  
- Upload study materials (PDF/notes or link)  
- Create quizzes (MCQ, publish/unpublish)  
- View quiz results per quiz  
- Create assignments, view submissions, grade with feedback  
- Post announcements  
- Answer student doubts  

## Project structure

```
├── client/                 # React (Vite) frontend
│   ├── src/
│   │   ├── api.js          # API client
│   │   ├── context/        # Auth context
│   │   ├── components/     # Layout, etc.
│   │   └── pages/          # Student & admin pages
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # Cloudinary
│   │   ├── middleware/     # Auth, roles
│   │   ├── models/        # User, Material, Quiz, etc.
│   │   └── routes/         # API routes
│   └── .env.example
├── package.json            # Root scripts (dev, install:all)
└── README.md
```

## Deployment (Render)

- **Frontend:** Connect repo, build command `npm run build` (from root or `cd client && npm run build`), publish `client/dist` as static site. Set root to `client` if needed.
- **Backend:** New Web Service, build `npm install`, start `node src/index.js` (from `server`). Add env vars: `MONGO_URI`, `JWT_SECRET`, Cloudinary keys, `PORT`.
- In frontend, set API base URL to your backend URL (e.g. via env `VITE_API_URL`) and use it in `client/src/api.js` instead of `/api` for production.

## Capacity

- Designed for ~500 registered students and ~50–100 concurrent users when using free tiers (MongoDB Atlas, Render, Cloudinary).

## License

MIT.
