# Todo Application

A full-stack Todo application built with React (TypeScript) for the frontend, Node.js (TypeScript + Express) for the backend API, and MySQL for the database. All components are containerized using Docker and orchestrated with Docker Compose.

## Table of Contents

* [Features](#features)
* [Technologies Used](#technologies-used)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)

  * [1. Clone the repository](#1-clone-the-repository)
  * [2. Navigate to the project directory](#2-navigate-to-the-project-directory)
  * [3. Build and Run with Docker Compose](#3-build-and-run-with-docker-compose)
  * [4. Access the Application](#4-access-the-application)
* [API Endpoints](#api-endpoints)
* [Project Structure](#project-structure)
* [Development Notes](#development-notes)
* [Troubleshooting](#troubleshooting)

## Features

* Add new tasks with a title and optional description.
* View the 5 most recent incomplete tasks.
* Mark tasks as complete.
* Basic form validation (frontend and backend).
* Loading and error indicators in the frontend.

## Technologies Used

**Frontend:**

* React (with TypeScript)
* HTML5, CSS3

**Backend:**

* Node.js (with TypeScript)
* Express.js
* `mysql2/promise` (MySQL client)
* `express-validator` (API input validation)
* `dotenv` (Environment variable management)

**Database:**

* MySQL 8.0

**Containerization & Orchestration:**

* Docker
* Docker Compose

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

* **Docker Desktop:** Includes Docker Engine, CLI, and Docker Compose.
  👉 [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Clone the repository

```bash
git clone <your-repository-url> # Replace with your actual repo URL
cd todo-app
```

### 2. Navigate to the project directory

```bash
cd todo-app
```

### 3. Build and Run with Docker Compose

```bash
docker-compose up --build --force-recreate
```

If you want a super clean start (removes all related images and volumes, losing DB data):

```bash
docker-compose down --rmi all --volumes
docker-compose up --build --force-recreate
```

### 4. Access the Application

* **Frontend (React App):** [http://localhost:3000](http://localhost:3000)
* **Backend (API Root):** [http://localhost:5000](http://localhost:5000) → *"Todo App Backend API is running!"*
* **Backend API Tasks:** [http://localhost:5000/api/tasks](http://localhost:5000/api/tasks)

## API Endpoints

Base URL: `http://localhost:5000/api`

### `GET /api/tasks`

Retrieve the 5 most recent incomplete tasks.

**Response:**

```json
[
  { "id": 1, "title": "Task Title", "description": "Optional", "is_completed": false }
]
```

---

### `POST /api/tasks`

Add a new task.

**Request Body:**

```json
{
  "title": "Task Title",
  "description": "Optional description"
}
```

**Response (201):**

```json
{ "id": 1, "title": "Task Title", "description": "Optional description", "is_completed": false }
```

**Error (400):**

```json
{ "errors": [{ "msg": "Title is required", "param": "title", "location": "body" }] }
```

---

### `PUT /api/tasks/:id/complete`

Mark a task as complete.

**Success (200):**

```json
{ "message": "Task marked as complete" }
```

**Error (404):**

```json
{ "message": "Task not found" }
```

---

## Project Structure

```
todo-app/
├── backend/
│   ├── src/                 # Backend TypeScript source files
│   │   └── app.ts           # Main Express application file
│   ├── dist/                # Compiled JavaScript output
│   ├── Dockerfile           # Backend service Dockerfile
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # Backend TypeScript config
│   └── .env                 # Local environment variables
├── frontend/
│   ├── public/              # Public assets
│   ├── src/                 # React TypeScript source files
│   │   ├── App.tsx          # Main React component
│   │   ├── App.css          # Component styles
│   │   ├── index.css        # Global styles
│   │   └── App.test.tsx     # Frontend tests
│   ├── Dockerfile           # Frontend service Dockerfile
│   ├── nginx.conf           # Nginx config
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # Frontend TypeScript config
├── docker-compose.yml       # Docker Compose services
└── README.md                # Documentation
```

## Development Notes

* **Live Reloading (Development):**
  Backend can use `nodemon`, frontend auto-refreshes with React dev server.

* **Database Persistence:**
  `db_data` volume persists MySQL data unless removed with `--volumes`.

## Troubleshooting

* **TypeScript errors in backend build:**
  Run:

  ```bash
  rm -rf backend/dist
  docker-compose up --build --force-recreate
  ```

* **Frontend 404 / Failed to fetch tasks:**

  * Check `frontend/nginx.conf` proxy config.
  * Verify backend is running at `http://localhost:5000`.
  * Rebuild frontend image.

* **docker-compose errors:**

  * Check logs: `docker-compose logs <service_name>`
  * Ensure Docker Desktop is running.
  * Try full cleanup:

    ```bash
    docker-compose down --rmi all --volumes
    docker-compose up --build --force-recreate
    ```
