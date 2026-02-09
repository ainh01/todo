# Full-Stack To-Do List Application [![npm](https://img.shields.io/npm/v/npm.svg?style=flat-square)](https://www.npmjs.com/package/npm) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/ainh01/todo/blob/main/LICENSE)

A simple yet powerful full-stack to-do list application that enables users to manage their tasks efficiently with secure user authentication.

**Key Highlights:**
* **User Authentication:** Secure login with email and password.
* **Task Management:** Intuitive interface to create, edit, and delete tasks.
* **Drag-and-Drop Sorting:** Easily reorder your tasks.
* **Data Import/Export:** Save and upload your task lists.
* **Dockerized Backend:** Effortless setup and deployment of backend environment.

<img width="1898" height="883" alt="image" src="https://github.com/user-attachments/assets/57d3c89c-c817-4144-b0b3-bb950c31e24b" />


Demo: **[View Live Demo here](https://todo.xain.click/)**

Login: community@guest.demo

Pass: 123456

## Features

* **User Authentication:** Secure login with email/password using JWT (JSON Web Tokens).
* **Task Management:** Create, edit, and delete items in your to-do list.
* **Quick Actions:** Access frequently used actions from the right sidebar.
* **Drag-and-Drop Sorting:** Easily rearrange your tasks (desktop only).
* **Edit Tagline:** Double-click to customize the tagline for your list.
* **Persistent Data Storage:** Tasks are saved to MongoDB database.
* **Data Import/Export:** Support for downloading your task list and adding new tasks from a file.
* **Enter Key Submit:** Quickly submit actions (such as creating new tasks) by pressing Enter.

## Technology Stack

* **Backend:**
  * [Node.js](https://nodejs.org/)
  * [Express](https://expressjs.com/)
  * [MongoDB](https://www.mongodb.com/)
  * [JSON Web Tokens (JWT)](https://jwt.io/)
  * [Docker](https://www.docker.com/)
* **Frontend:**
  * Vue 2.x
  * Sass

## Installation Requirements

To run this project locally, you need to install the following software:

* **Node.js:** A recent stable version is recommended.
* **Docker:** Required if you run the backend in a container.
* **MongoDB:** A running MongoDB instance (can be installed locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)).
* **npm** or **yarn:** Package manager for Node.js.

## Backend Installation

### a. Navigate to the `backend/` directory

```bash
cd backend/
```

### b. Create a `.env` file

Create a file named `.env` in the `backend/` directory and add environment variables according to `.env.example`

### c. Build and run Docker container

This is the recommended way to run the backend.

1. **Build Docker image:**
   ```bash
   docker build -t todolist-backend .
   ```

2. **Run Docker container:**
   ```bash
   # This command maps port 3000 of the host machine to port 3000 of the container
   # and loads environment variables from the .env file
   docker run -p 3000:3000 --env-file ./.env todolist-backend
   ```

### d. (Optional) Run locally without Docker

If you want to develop without Docker:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

## Frontend Installation

### a. File location

Frontend static files (HTML, CSS, JS) are located in the `public/` directory.

### b. Configure Backend URL

1. Open the file `public/js/config.js`.
2. Update the `__BASE_URL__` constant to point to your backend API.

### c. Run Frontend

To run the frontend locally, simply open the `public/index.html` file in your web browser.

## Deployment

### a. Deploy Frontend

You can deploy the static files in the `public/` directory to services like **Vercel, Netlify, or GitHub Pages**.

1. **Configure API URL:** Ensure that `public/js/config.js` is configured with the deployed backend API URL.

2. **(Optional) Replace URL dynamically (skip step 1):**
   Some platforms (like Vercel) allow you to set environment variables and use them during build. You can place a placeholder in `config.js` (e.g., `__BASE_URL__`) and replace it during build.

   * **Build Command:**
     ```bash
     # This command finds and replaces "__BASE_URL__" with the value of the $BASE_URL environment variable
     sed -i "s|__BASE_URL__|$BASE_URL|g" public/js/config.js
     ```
   * **Environment variable on platform:**
     Set the `BASE_URL` variable on Vercel/Netlify to your backend URL (e.g., `https://api.yourdomain.com/api`).

   > **Note:** The `sed` command above works on Unix-like systems (Linux, macOS). If you build on Windows, you may need an alternative solution.

### b. Deploy Backend (using Docker)

1. **Push Docker Image:** Push your image to a container registry such as Docker Hub, Google Container Registry (GCR), or Amazon Elastic Container Registry (ECR).

2. **Deploy Image:** Deploy the image from the registry to a cloud provider that supports Docker, such as **Railway, Render, AWS ECS, Google Cloud Run**.

3. **Configure Environment Variables:** Ensure that environment variables (`MONGODB_URI`, `JWT_SECRET`, `PORT`) are securely configured in your deployment environment. **Never include these values in public source code.**

**API Documentation:** You can refer to detailed API documentation at: [https://twtodo.xain.click/api-docs/](https://twtodo.xain.click/api-docs/)

## License

The frontend user interface (UI) is a modified version based on [uiineed-todo-list](https://github.com/ricocc/uiineed-todo-list) by author [ricocc](https://github.com/ricocc), also licensed under the [MIT License](https://github.com/ricocc/uiineed-todo-list/blob/master/LICENSE).

The confetti effects is from [canvas-confetti](https://github.com/catdad/canvas-confetti) by author [catdad](https://github.com/catdad/), also licensed under the [ISC License](https://github.com/catdad/canvas-confetti/blob/master/LICENSE).
