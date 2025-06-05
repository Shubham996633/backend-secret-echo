# Secret Echo - Chapters Management API

## Overview

Secret Echo is a backend API built with TypeScript, Express, and MongoDB, designed to manage educational chapters for students. This project provides endpoints to upload, retrieve, and filter chapters, with caching support using Redis. The API supports file uploads for bulk chapter creation, with validation to ensure data integrity, and returns detailed responses for both successful and failed operations.

## Note

 Checking Postman with deployed link or direct access initial not work due to stiffness nature of Render deployment but after trying some time it works 


### Features

- **Upload Chapters via JSON File**: Bulk upload chapters using a JSON file, with support for array   formats.
- **Retrieve Chapters**: Fetch chapters with filtering, pagination, sorting, and caching.
- **User Authentication**:
  - Sign-up and sign-in with email, encrypted password, first name, and last name.
  - Session-based authentication using JWT tokens for secure API access.
  - User details and sessions are stored in MongoDB.
- **Error Handling**: Comprehensive error handling for invalid data, with failed chapters returned in the response.
- **MongoDB Integration**: Persistent storage for user data, sessions, and chat history.
- **Middleware**: Secures each Rest API Call on each interaction.
- **Redis Integration**: Implemented Rate limiting via `Redis-Cloud` with `Sliding window` algorithm
- **Redis Caching**: Cache chapter data to improve performance, with cache invalidation on updates.
- **Mongoose Validation**: Schema validation to ensure data consistency in MongoDB.
- **Session Management**:
  - Each sign-in creates a session, ensuring secure access to APIs using JWT tokens.
  - Logout functionality to invalidate sessions.
- **Postman API COLLECTION**: Provided Postman API collection with pre-defined data,
   - Note: Need to  add new Bearer Token as authentication is session Based .
- **Rate Limiting**: Protects the API from abuse by limiting the number of requests per user, rate limiting is done by Redis.
- **Deployment on Render**: Hosted on Render with automatic scaling and environment variable management.


## Tech Stack

- **Node.js**: Runtime environment.
- **TypeScript**: For type safety and better developer experience.
- **Express**: Web framework for building the API.
- **MongoDB**: Database for storing chapter data, with Mongoose as the ODM.
- **Redis**: In-memory caching to improve performance.
- **Multer**: Middleware for handling file uploads.
- **Joi**: Schema validation for request data (though removed in favor of Mongoose validation in some cases).
- **Dotenv**: For environment variable management.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Redis Cloud account (or local Redis instance)
- Postman (for testing API endpoints)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd secret-echo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add the following variables:

```env
APP_NAME=secret-echo
APP_ENV=development
APP_PORT=3000

TOKEN_SECRET={{TOKEN_SECRET}}

MONGO_URI={{TOKEN_SECRET}}

GEMINI_API_KEY={{GEMINI_API_KEY}}

REDIS_CLOUD_HOST={{REDIS_CLOUD_HOST}}
REDIS_CLOUD_PORT={{REDIS_CLOUD_PORT}}
REDIS_CLOUD_USERNAME={{REDIS_CLOUD_USERNAME}}
REDIS_CLOUD_PASSWORD={{REDIS_CLOUD_PASSWORD}}
REDIS_CLOUD_TLS={{REDIS_CLOUD_TLS}}

```

### 4. Start the Server

```bash
npm run dev
```

The server will run on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### User Authentication

- **POST /api/v1/auth/signup**  
  Register a new user.  
  **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "first_name": "John",
    "role": "admin / user (Optional)" ,  
    "last_name": "Doe"
  }
  ```

  **Response**:

  ```json
  {
    "success": true,
    "data": {
      "user_id": "user_pid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role":"admin / user (Optional)" ,  
      "token": "jwt_token"
    },
    "errors": []
  }
  ```

- **POST /api/v1/auth/login**  
  Authenticate a user and create a session.  
  **Request Body**:

  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```

  **Response**:

  ```json
  {
    "success": true,
    "data": {
      "token": "jwt_token",
      "user": {
        "user_id": "user_pid",
        "email": "user@example.com",
        "first_name": "John",
        "role": "admin / user (Optional)" ,  
        "last_name": "Doe"
      }
    },
    "errors": []
  }
  ```

- **POST /api/v1/auth/logout**  
  Log out a user and invalidate their session.  
  **Headers**:
  - `Authorization: Bearer <jwt_token>`  
  **Response**:

  ```json
  {
    "success": true,
    "data": { "message": "Logged out successfully" },
    "errors": []
  }
  ```

- **GET /api/v1/users/me**  
  Retrieve the authenticated user’s details.  
  **Headers**:
  - `Authorization: Bearer <jwt_token>`  
  **Response**:

  ```json
  {
    "success": true,
    "data": {
      "user_pid": "user_id",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "admin / user (Optional)" ,  
      "created_at": "2025-05-08T12:00:00Z",
      "updated_at": "2025-05-08T12:00:00Z"
    },
    "errors": []
  }
  ```


### Chapters 

### 1. Upload Chapters

- **Endpoint**: `POST /api/v1/chapters`
- **Description**: Upload chapters via a JSON file it can be only done by user with role as "Admin" only.
- **Authentication**: Requires admin authentication (Bearer token).
- **Request**:
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: JSON file containing an array of chapters .
  - Example JSON File (`chapters.json`):

    ```json
    [
      {
        "subject": "Physics",
        "chapter": "Units and Dimensions",
        "class": "Class 11",
        "unit": "Mechanics 1",
        "yearWiseQuestionCount": {
          "2019": 2,
          "2020": 6,
          "2021": 8,
          "2022": 4,
          "2023": 6,
          "2024": 3,
          "2025": 10
        },
        "questionSolved": 39,
        "status": "Completed",
        "isWeakChapter": true
      }
    ]
    ```

- **Response**:
  - Status: `201 Created`
  - Body:

    ```json
    {
      "success": true,
      "data": {
        "uploadedCount": 1,
        "failedChapters": []
      },
      "errors": []
    }
    ```

  - If some chapters fail validation:

    ```json
    {
      "success": true,
      "data": {
        "uploadedCount": 0,
        "failedChapters": [
          {
            "chapter": {
              "chapter": "Mathematics in Physics",
              "class": "Class 11",
              "unit": "Mechanics 1",
              "yearWiseQuestionCount": {
                "2019": 0,
                "2020": 2,
                "2021": 5,
                "2022": 5,
                "2023": 3,
                "2024": 7,
                "2025": 6
              },
              "questionSolved": 0,
              "status": "Not Started",
              "isWeakChapter": false
            },
            "error": "\"subject\" is required"
          }
        ]
      },
      "errors": []
    }
    ```

### 2. Get All Chapters

- **Endpoint**: `GET /api/v1/chapters`
- **Description**: Retrieve a list of chapters with optional filters, pagination, and sorting.
- **Authentication**: Requires authentication (Bearer token).
- **Query Parameters**:
  - `class` (optional): Filter by class (e.g., `Class 11`).
  - `unit` (optional): Filter by unit (e.g., `Mechanics 1`).
  - `status` (optional): Filter by status (`Not Started`, `In Progress`, `Completed`).
  - `weakChapters` (optional): Filter by weak chapters (`true` or `false`).
  - `subject` (optional): Filter by subject (e.g., `Physics`).
  - `page` (default: `1`): Page number for pagination.
  - `limit` (default: `10`): Number of chapters per page.
  - `sortBy` (default: `chapter`): Field to sort by (e.g., `chapter`, `questionSolved`).
  - `order` (default: `asc`): Sort order (`asc` or `desc`).
- **Response**:
  - Status: `200 OK`
  - Body:

    ```json
    {
      "success": true,
      "data": {
        "total": 1,
        "chapters": [
          {
            "chapter_pid": "chapter_xxx",
            "subject": "Physics",
            "chapter": "Units and Dimensions",
            "class": "Class 11",
            "unit": "Mechanics 1",
            "yearWiseQuestionCount": {
              "2019": 2,
              "2020": 6,
              "2021": 8,
              "2022": 4,
              "2023": 6,
              "2024": 3,
              "2025": 10
            },
            "questionSolved": 39,
            "status": "Completed",
            "isWeakChapter": true,
            "created_at": "2025-06-04T02:19:00.000Z",
            "updated_at": "2025-06-04T02:19:00.000Z"
          }
        ]
      },
      "errors": []
    }
    ```

### 3. Get Chapter By ID

- **Endpoint**: `GET /api/v1/chapters/:ChapterID`
- **Description**: Retrieve any chapter with ChapterID .
- **Authentication**: Requires authentication (Bearer token).

- **Response**:
  - Status: `200 OK`
  - Body:

    ```json
       {
        "success": true,
        "data": {
            "chapter_id": "chp_xxx",
            "subject": "Physics",
            "chapter": "Magnetic Properties of Matter",
            "class": "Class 12",
            "unit": "Electromagnetism",
            "yearWiseQuestionCount": {
                "2019": 3,
                "2020": 8,
                "2021": 6,
                "2022": 2,
                "2023": 9,
                "2024": 1,
                "2025": 2
            },
            "questionSolved": 0,
            "status": "Not Started",
            "isWeakChapter": true,
            "created_at": "2025-06-03T21:17:49.783Z",
            "updated_at": "2025-06-03T21:17:49.783Z"
        },
        "errors": []
    }
    ```

## Project Structure

```
secret-echo/
├── src/
│   ├── controllers/
│   │   └── chapter.controller.ts  # API controllers for chapter endpoints
│   ├── dbProviders/
│   │   └── chapter.repository.ts  # Database provider for chapter operations
│   ├── entities/
│   │   └── chapter.ts             # Mongoose schema for chapters
│   ├── middleware/
│   │   ├── context.ts             # SecretEchoContext for dependency injection
│   │   └── fileUpload.ts          # Multer middleware for file uploads
│   ├── oplog/
│   │   ├── error.ts               # Error handling utilities
│   │   └── oplog.ts               # Logging utility
│   ├── services/
│   │   └── chapter.service.ts     # Business logic for chapter operations
│   ├── types/
│   │   └── chapters.ts            # TypeScript types and Joi schemas
│   ├── utils/
│   │   ├── ids.ts                 # Utility for generating public IDs
│   │   └── redis.ts               # Redis client configuration
│   └── index.ts                   # Application entry point
├── .env                           # Environment variables
├── package.json                   # Project dependencies
└── README.md                      # Project documentation
```




## Contact

For questions or support, reach out to [Shubham Maurya](mailto:shubhammaurya996633@gmail.com).

## License

This project is licensed under the MIT License.
