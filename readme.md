# MediQueue Server - Tutor Booking API

MediQueue Server is the backend API for the MediQueue tutor booking web application. It handles tutor management, session booking, booked session management, slot updates, cancellation status updates, and database operations using MongoDB.

---

## Live API URL - https://mediqueue-server-one.vercel.app

---

## Features

- REST API for tutor booking application
- Add, update, delete, and retrieve tutor data
- Book tutoring sessions by student
- Prevent duplicate course booking by the same student
- Automatically decrease tutor slot after successful booking
- Cancel booked sessions using PATCH request
- Automatically increase tutor slot after session cancellation
- Fetch user-specific booked sessions
- MongoDB database integration
- CORS enabled for frontend communication
- Environment variable support using dotenv
- JWT-related token handling support with jose-cjs

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- CORS
- dotenv
- jose-cjs

---

## Dependencies

```json
{
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "jose-cjs": "^6.2.3",
  "mongodb": "^7.2.0"
}
```

---

## API Endpoints

### Tutors

```txt
GET /tutors
```

Get all tutors.

```txt
GET /tutors?limit=6
```

Get limited tutors for home page.

```txt
POST /add-tutors
```

Add a new tutor.

```txt
PATCH /tutors/:id
```

Update tutor information.

```txt
DELETE /my-tutors/:id
```

Delete tutor.

---

### Session Bookings

```txt
POST /session-bookings
```

Book a tutoring session.

```txt
GET /my-booked-session/:userId
```

Get booked sessions for a specific logged-in student.

```txt
PATCH /my-booked-session/:sessionId
```

Cancel a booked session and update status to cancelled.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=your_database_name
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/anaitullah31/mediqueue-server.git
```

Go to the project directory:

```bash
cd mediqueue-server
```

Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm run dev
```

Or:

```bash
node index.js
```

---

## Example Booking Data

```json
{
  "courseId": "course_id_here",
  "courseName": "Mathematics",
  "tutorName": "Md. Rakib Hasan",
  "subject": "Mathematics",
  "teachingMode": "Online",
  "availableTime": "Sat - Wed 6:00 PM - 9:00 PM",
  "hourlyFee": 600,
  "studentId": "student_id_here",
  "studentName": "Student Name",
  "studentEmail": "student@example.com"
}
```

---

## Booking Rules

- A student cannot book the same course twice.
- Booking is blocked if tutor slots are unavailable.
- After successful booking, tutor `totalSlot` decreases by `1`.
- After cancellation, booking status changes to `cancel`.
- After cancellation, tutor `totalSlot` increases by `1`.

---

## Project Purpose

The backend is built to support a tutor booking system where students can register, browse tutors, book sessions, and manage their scheduled classes. It simplifies booking management, prevents duplicate bookings, and keeps tutor slot availability updated automatically.

---

## Developer

Developed by **Anait Ullah**