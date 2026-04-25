# Express & Prisma Backend Starter Template

A production-ready robust, and scalable backend starter template built with **Node.js, Express.js, TypeScript, PostgreSQL, and Prisma ORM**. This template includes all essential features like Authentication, File Uploads, Email services, and structured error handling to kickstart your next API project quickly.

## 🚀 Features

- **Framework**: Express.js with TypeScript support.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JWT-based (Access & Refresh tokens), password hashing with bcrypt.
- **Validation**: Schema validation using Zod.
- **File Uploads**: Pre-configured setup for Cloudinary and AWS S3.
- **Email Service**: Nodemailer configured for sending emails (e.g., password reset).
- **Docker Ready**: Includes `Dockerfile` and `docker-compose.yml` for quick containerized deployment.
- **Linting & Formatting**: ESLint and Prettier for maintaining code quality.
- **Global Error Handling**: Standardized error responses using http-status.

---

## 🛠️ Getting Started

### 1. Prerequisites

Ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Bun](https://bun.sh/) (Optional but recommended, as `bun.lock` is present) or npm/yarn.

### 2. Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/ahshobuj1/server-template-production.git

# Navigate into the project directory
cd server-template-production

# Install dependencies using Bun (or npm install / yarn install)
bun install
```

### 3. Environment Variables setup

Copy the example environment file and create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Open `.env` and fill in the necessary variables:

```env
DATABASE_NAME=auth-starter
DATABASE_URL="postgresql://username:password@localhost:5432/auth-starter?schema=public"

BCRYPT_SALT_ROUNDS=12

JWT_ACCESS_SECRET=your_access_secret_key
JWT_ACCESS_EXPIRES_IN=10m
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=365d

RESET_PASS_UI_LINK=http://localhost:5173/reset-password

# Email config
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# File upload configs (Optional: depending on your usage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SUPER_ADMIN_PASS=admin123
```

### 4. Database Setup & Prisma Configuration

Generate the Prisma client and push the schema to your PostgreSQL database.

```bash
# Generate the customized Prisma Client
bunx prisma generate

# Push the schema changes to your database
bunx prisma db push
```

_(Note: The Prisma client is configured to output into a custom directory `prisma/generated/client` based on the recent project configuration.)_

---

## 🏃‍♂️ Running the Application

### Development Mode

To start the application in development mode with hot-reloading:

```bash
bun run dev
# or npm run dev
```

_The server will typically start at `http://localhost:5000` (check terminal output)._

### Production Mode

To run the project in production, compile the TypeScript code and start the compiled JavaScript file:

```bash
# 1. Compile TypeScript to JavaScript
bunx tsc

# 2. Run the production server
bun run start:prod
# or npm run start:prod
```

---

## 🐳 Docker Setup

To run the complete application along with a PostgreSQL database using Docker:

```bash
# Build and start the containers in detached mode
docker-compose up -d --build
```

---

## 📜 Available Scripts

| Script       | Command              | Description                                           |
| ------------ | -------------------- | ----------------------------------------------------- |
| `dev`        | `bun run dev`        | Starts the development server using `ts-node-dev`.    |
| `start:prod` | `bun run start:prod` | Runs the compiled application (`dist/src/server.js`). |
| `lint`       | `bun run lint`       | Runs ESLint to identify problematic patterns.         |
| `lint:fix`   | `bun run lint:fix`   | Runs ESLint and automatically fixes fixable issues.   |
| `format`     | `bun run format`     | Runs Prettier to format codebase.                     |

---

## 📂 Project Structure

A quick overview of the key directories:

- `src/server.ts`: The entry point of the application.
- `src/app/modules/`: Contains domain-specific modules (e.g., Auth, User) adhering to modular architecture.
- `src/app/utils/`: Helper functions and configurations (Prisma client, Cloudinary, S3, Email upload, etc.).
- `prisma/`: Contains `schema.prisma` and generated Prisma client files.

Happy Coding! 🚀
