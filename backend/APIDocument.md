# TODO API — Complete Reference

---

## Global Information

### Base URL

```
https://api.example.com/api
```

All endpoints are prefixed with `/api`.

### Authentication

The API uses **JWT Bearer tokens**. Include the token in the `Authorization` header for all protected routes.

```
Authorization: Bearer <token>
```

**How to obtain a token:**

1. Register a new account via `POST /api/users/register` — the token is returned in the response.
2. Log in with existing credentials via `POST /api/users/login` — the token is returned in the response.

Tokens expire after **30 days** by default.

### Common Request Headers

| Header          | Value              | Required | Notes                        |
| --------------- | ------------------ | -------- | ---------------------------- |
| `Content-Type`  | `application/json` | Yes      | For all requests with a body |
| `Authorization` | `Bearer <token>`   | Yes      | For all protected routes     |

### Rate Limiting

- **300 requests** per IP per **1 minute**.
- Exceeding the limit returns:

```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

### Standard Error Response Format

All errors follow this shape:

```json
{
  "success": false,
  "error": "<error message string>"
}
```

### Common Error Codes

| Status | Meaning                          | When it occurs                              |
| ------ | -------------------------------- | ------------------------------------------- |
| `401`  | Unauthorized                     | Missing or invalid/expired JWT token        |
| `429`  | Too Many Requests                | Rate limit exceeded                         |
| `500`  | Internal Server Error            | Unexpected server-side failure               |

### Key Concepts

- **Sets**: Named task groups (e.g. "Default", "Work", "🎯Goals"). Each user always has at least one set.
- **currentKey**: The set the user is currently working in. All task operations act on the current set.
- **task_id**: An integer identifier for tasks within a set (not globally unique).
- **slot**: An integer representing the display order of a task within its set.

---

## User Routes

---

### Register User

Create a new account. A default set named `"Default"` is automatically created.

- **Method:** `POST`
- **Endpoint:** `/api/users/register`
- **Auth required:** No

#### Request Body

| Field   | Type   | Required | Description                          |
| ------- | ------ | -------- | ------------------------------------ |
| `email` | string | Yes      | Valid email address                  |
| `pass`  | string | Yes      | Password (minimum 6 characters)      |

#### Example Request

```json
POST /api/users/register
Content-Type: application/json

{
  "email": "john@example.com",
  "pass": "mypassword123"
}
```

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "email": "john@example.com",
    "currentKey": "Default",
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status | Error                       | When                                      |
| ------ | --------------------------- | ----------------------------------------- |
| `400`  | `"Email already registered"` | An account with this email already exists |
| `400`  | `"Email is required"`        | Email field missing or invalid format     |
| `400`  | `"Password is required"`     | Password field missing                    |

```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### Login User

Authenticate and receive a JWT token.

- **Method:** `POST`
- **Endpoint:** `/api/users/login`
- **Auth required:** No

#### Request Body

| Field   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| `email` | string | Yes      | Registered email |
| `pass`  | string | Yes      | Account password |

#### Example Request

```json
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "pass": "mypassword123"
}
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "email": "john@example.com",
    "id": "665f1a2b3c4d5e6f7a8b9c0d"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Responses

| Status | Error                              | When                                 |
| ------ | ---------------------------------- | ------------------------------------ |
| `400`  | `"Email and password required"`    | Either field is missing              |
| `401`  | `"Invalid credentials"`            | Email not found or wrong password    |

```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## Set Routes

All set routes require authentication.

---

### Get All Sets

Returns all sets for the authenticated user with task counts.

- **Method:** `GET`
- **Endpoint:** `/api/sets`
- **Auth required:** Yes

#### Parameters

None.

#### Example Request

```
GET /api/sets
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": [
    { "key": "Default", "taskCount": 5 },
    { "key": "Work", "taskCount": 12 },
    { "key": "🎯Goals", "taskCount": 3 }
  ]
}
```

#### Error Responses

| Status | Error                                        | When               |
| ------ | -------------------------------------------- | ------------------ |
| `401`  | `"Not authorized, no token"`                 | No token provided  |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token  |

---

### Create or Switch Set

If the set key already exists, switches `currentKey` to it. If it does not exist, creates a new set (with an empty task list) and switches to it.

- **Method:** `POST`
- **Endpoint:** `/api/sets`
- **Auth required:** Yes

#### Request Body

| Field | Type   | Required | Description                                          |
| ----- | ------ | -------- | ---------------------------------------------------- |
| `key` | string | Yes      | Set name — any string including unicode/emoji/spaces |

#### Example Request

```json
POST /api/sets
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "key": "Work"
}
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "currentKey": "Work"
  }
}
```

#### Error Responses

| Status | Error                                        | When              |
| ------ | -------------------------------------------- | ----------------- |
| `400`  | `"key is required"`                          | `key` is missing  |
| `401`  | `"Not authorized, no token"`                 | No token provided |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token |

```json
{
  "success": false,
  "error": "key is required"
}
```

---

### Delete Set

Deletes a set and all its tasks. If the deleted set was the current set, automatically switches to another existing set. If no other set remains, a new `"Default"` set is created.

- **Method:** `DELETE`
- **Endpoint:** `/api/sets`
- **Auth required:** Yes

#### Request Body

| Field | Type   | Required | Description            |
| ----- | ------ | -------- | ---------------------- |
| `key` | string | Yes      | Set name to delete     |

#### Example Request

```json
DELETE /api/sets
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "key": "Work"
}
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "currentKey": "Default"
  }
}
```

The `currentKey` in the response is the set the user is now active in after deletion.

#### Error Responses

| Status | Error                                        | When              |
| ------ | -------------------------------------------- | ----------------- |
| `400`  | `"key is required"`                          | `key` is missing  |
| `401`  | `"Not authorized, no token"`                 | No token provided |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token |

---

## Task Routes

All task routes require authentication. Tasks are read from and written to the user's **current set** (`currentKey`). Switch sets via `POST /api/sets` before performing task operations on a different set.

---

### Get All Tasks

Returns all tasks in the user's current set, sorted by slot (display order).

- **Method:** `GET`
- **Endpoint:** `/api/tasks`
- **Auth required:** Yes

#### Parameters

None.

#### Example Request

```
GET /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "task_id": 1,
      "title": "Buy groceries",
      "slot": 1,
      "finished": false,
      "created_at": "2026-03-14T10:30:00.000Z",
      "updated_at": "2026-03-14T10:30:00.000Z",
      "_id": "665f1a2b3c4d5e6f7a8b9c10"
    },
    {
      "task_id": 2,
      "title": "Walk the dog",
      "slot": 2,
      "finished": true,
      "created_at": "2026-03-14T11:00:00.000Z",
      "updated_at": "2026-03-14T12:00:00.000Z",
      "_id": "665f1a2b3c4d5e6f7a8b9c11"
    },
    {
      "task_id": 3,
      "title": "Read a book",
      "slot": 3,
      "finished": false,
      "created_at": "2026-03-14T11:30:00.000Z",
      "updated_at": "2026-03-14T11:30:00.000Z",
      "_id": "665f1a2b3c4d5e6f7a8b9c12"
    }
  ]
}
```

#### Error Responses

| Status | Error                                        | When                  |
| ------ | -------------------------------------------- | --------------------- |
| `401`  | `"Not authorized, no token"`                 | No token provided     |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token     |
| `404`  | `"User not found"`                           | User account deleted  |

---

### Create Task

Add a new task to the user's current set. The `task_id` and `slot` are auto-assigned.

- **Method:** `POST`
- **Endpoint:** `/api/tasks`
- **Auth required:** Yes

#### Request Body

| Field   | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| `title` | string | Yes      | Task title text |

#### Example Request

```json
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Buy groceries"
}
```

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "title": "Buy groceries",
    "slot": 1,
    "finished": false,
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T10:30:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c10"
  }
}
```

#### Error Responses

| Status | Error                                        | When                  |
| ------ | -------------------------------------------- | --------------------- |
| `400`  | `"Title is required"`                        | `title` is missing    |
| `401`  | `"Not authorized, no token"`                 | No token provided     |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token     |
| `404`  | `"User not found"`                           | User account deleted  |

```json
{
  "success": false,
  "error": "Title is required"
}
```

---

### Get Task by ID

Retrieve a single task from the user's current set by its `task_id`.

- **Method:** `GET`
- **Endpoint:** `/api/tasks/:id`
- **Auth required:** Yes

#### Path Parameters

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| `id` | integer | Yes      | The `task_id` of the task     |

#### Example Request

```
GET /api/tasks/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "title": "Buy groceries",
    "slot": 1,
    "finished": false,
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T10:30:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c10"
  }
}
```

#### Error Responses

| Status | Error                                        | When                                      |
| ------ | -------------------------------------------- | ----------------------------------------- |
| `401`  | `"Not authorized, no token"`                 | No token provided                         |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                         |
| `404`  | `"User not found"`                           | User account deleted                      |
| `404`  | `"Task not found"`                           | No task with this `task_id` in current set|

```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### Update Task

Update the title of a task in the user's current set.

- **Method:** `PUT`
- **Endpoint:** `/api/tasks/:id`
- **Auth required:** Yes

#### Path Parameters

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| `id` | integer | Yes      | The `task_id` of the task     |

#### Request Body

| Field   | Type   | Required | Description         |
| ------- | ------ | -------- | ------------------- |
| `title` | string | No       | New title for task  |

#### Example Request

```json
PUT /api/tasks/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Buy organic groceries"
}
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "title": "Buy organic groceries",
    "slot": 1,
    "finished": false,
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T14:00:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c10"
  }
}
```

#### Error Responses

| Status | Error                                        | When                                       |
| ------ | -------------------------------------------- | ------------------------------------------ |
| `401`  | `"Not authorized, no token"`                 | No token provided                          |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                          |
| `404`  | `"User not found"`                           | User account deleted                       |
| `404`  | `"Task not found"`                           | No task with this `task_id` in current set |

---

### Move Task

Reorder a task by moving it to a different slot position. Other tasks' slots are shifted automatically.

- **Method:** `PUT`
- **Endpoint:** `/api/tasks/:id/move`
- **Auth required:** Yes

#### Path Parameters

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| `id` | integer | Yes      | The `task_id` of the task     |

#### Request Body

| Field         | Type    | Required | Description                         |
| ------------- | ------- | -------- | ----------------------------------- |
| `target_slot` | integer | Yes      | New slot position (must be >= 1)    |

#### Example Request

```json
PUT /api/tasks/3/move
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "target_slot": 1
}
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "task_id": 3,
    "title": "Read a book",
    "slot": 1,
    "finished": false,
    "created_at": "2026-03-14T11:30:00.000Z",
    "updated_at": "2026-03-14T15:00:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c12"
  },
  "message": "Task moved successfully"
}
```

If the task is already in the target slot:

```json
{
  "success": true,
  "data": { ... },
  "message": "Task already in target slot"
}
```

#### Error Responses

| Status | Error                                        | When                                       |
| ------ | -------------------------------------------- | ------------------------------------------ |
| `400`  | `"Valid target_slot is required (>= 1)"`     | `target_slot` missing or < 1               |
| `401`  | `"Not authorized, no token"`                 | No token provided                          |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                          |
| `404`  | `"User not found"`                           | User account deleted                       |
| `404`  | `"Task not found"`                           | No task with this `task_id` in current set |

```json
{
  "success": false,
  "error": "Valid target_slot is required (>= 1)"
}
```

---

### Toggle Task Finished

Toggle the `finished` status of a task (finished ↔ unfinished).

- **Method:** `POST`
- **Endpoint:** `/api/tasks/:id/finish`
- **Auth required:** Yes

#### Path Parameters

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| `id` | integer | Yes      | The `task_id` of the task     |

#### Example Request

```
POST /api/tasks/1/finish
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "task_id": 1,
    "title": "Buy groceries",
    "slot": 1,
    "finished": true,
    "created_at": "2026-03-14T10:30:00.000Z",
    "updated_at": "2026-03-14T16:00:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c10"
  },
  "message": "Task marked as finished"
}
```

When toggling back to unfinished:

```json
{
  "success": true,
  "data": { ... },
  "message": "Task marked as unfinished"
}
```

#### Error Responses

| Status | Error                                        | When                                       |
| ------ | -------------------------------------------- | ------------------------------------------ |
| `401`  | `"Not authorized, no token"`                 | No token provided                          |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                          |
| `404`  | `"User not found"`                           | User account deleted                       |
| `404`  | `"Task not found"`                           | No task with this `task_id` in current set |

---

### Delete Task

Delete a task from the user's current set. Remaining tasks with higher slots are reordered (decremented) automatically.

- **Method:** `DELETE`
- **Endpoint:** `/api/tasks/:id`
- **Auth required:** Yes

#### Path Parameters

| Name | Type    | Required | Description                   |
| ---- | ------- | -------- | ----------------------------- |
| `id` | integer | Yes      | The `task_id` of the task     |

#### Example Request

```
DELETE /api/tasks/2
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

#### Error Responses

| Status | Error                                        | When                                       |
| ------ | -------------------------------------------- | ------------------------------------------ |
| `401`  | `"Not authorized, no token"`                 | No token provided                          |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                          |
| `404`  | `"User not found"`                           | User account deleted                       |
| `404`  | `"Task not found"`                           | No task with this `task_id` in current set |

---

### Generate Tasks with AI

Send a text prompt to a GenAI service to auto-generate multiple tasks in the user's current set.

- **Method:** `POST`
- **Endpoint:** `/api/longTasks`
- **Auth required:** Yes

#### Request Body

| Field   | Type   | Required | Description                                  |
| ------- | ------ | -------- | -------------------------------------------- |
| `title` | string | Yes      | Text prompt to generate related tasks from   |

#### Example Request

```json
POST /api/longTasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Plan a birthday party for 20 guests"
}
```

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": [
    {
      "task_id": 4,
      "title": "Create guest list",
      "slot": 4,
      "finished": false
    },
    {
      "task_id": 5,
      "title": "Book a venue",
      "slot": 5,
      "finished": false
    },
    {
      "task_id": 6,
      "title": "Order birthday cake",
      "slot": 6,
      "finished": false
    }
  ]
}
```

#### Error Responses

| Status | Error                                                  | When                                         |
| ------ | ------------------------------------------------------ | -------------------------------------------- |
| `400`  | `"Title is required"`                                  | `title` is missing                           |
| `400`  | `"No valid tasks found in GenAI response"`             | AI response could not be parsed into tasks   |
| `401`  | `"Not authorized, no token"`                           | No token provided                            |
| `401`  | `"Not authorized, token invalid or expired"`           | Bad/expired token                            |
| `404`  | `"User not found"`                                     | User account deleted                         |
| `500`  | `"Missing environment variables: ..."`                 | Server GenAI config incomplete               |
| `500`  | `"GenAI API error: ..."`                               | GenAI service unreachable or returned error  |
| `500`  | `"Database save error: ..."`                           | Failed to persist generated tasks            |

```json
{
  "success": false,
  "error": "Title is required"
}
```

---

## Admin Routes

All admin routes require authentication **and** admin privileges. Admin status is determined by the server-side `ADMIN_LIST` environment variable (comma-separated emails).

---

### Check Admin Status

Check whether the authenticated user is an admin.

- **Method:** `GET`
- **Endpoint:** `/api/admin/check-status`
- **Auth required:** Yes

#### Parameters

None.

#### Example Request

```
GET /api/admin/check-status
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "isAdmin": true
}
```

Non-admin user:

```json
{
  "success": true,
  "isAdmin": false
}
```

#### Error Responses

| Status | Error                                        | When                 |
| ------ | -------------------------------------------- | -------------------- |
| `401`  | `"Not authorized, no token"`                 | No token provided    |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token    |
| `404`  | `"User not found"`                           | User account deleted |

---

### Get User Tasks (Admin)

Retrieve all tasks for a specific user, grouped by set key.

- **Method:** `GET`
- **Endpoint:** `/api/admin/tasks/:email`
- **Auth required:** Yes (admin only)

#### Path Parameters

| Name    | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| `email` | string | Yes      | Email address of the target user |

#### Example Request

```
GET /api/admin/tasks/john@example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### Success Response — `200 OK`

Tasks are returned as an object keyed by set name, with each value being a sorted array of tasks:

```json
{
  "success": true,
  "data": {
    "Default": [
      {
        "task_id": 1,
        "title": "Buy groceries",
        "slot": 1,
        "finished": false,
        "created_at": "2026-03-14T10:30:00.000Z",
        "updated_at": "2026-03-14T10:30:00.000Z",
        "_id": "665f1a2b3c4d5e6f7a8b9c10"
      }
    ],
    "Work": [
      {
        "task_id": 1,
        "title": "Finish quarterly report",
        "slot": 1,
        "finished": false,
        "created_at": "2026-03-14T11:00:00.000Z",
        "updated_at": "2026-03-14T11:00:00.000Z",
        "_id": "665f1a2b3c4d5e6f7a8b9c20"
      },
      {
        "task_id": 2,
        "title": "Review pull requests",
        "slot": 2,
        "finished": true,
        "created_at": "2026-03-14T11:30:00.000Z",
        "updated_at": "2026-03-14T13:00:00.000Z",
        "_id": "665f1a2b3c4d5e6f7a8b9c21"
      }
    ],
    "🎯Goals": []
  }
}
```

#### Error Responses

| Status | Error                                        | When                                  |
| ------ | -------------------------------------------- | ------------------------------------- |
| `400`  | `"Email parameter is required"`              | Email path param is missing           |
| `401`  | `"Not authorized, no token"`                 | No token provided                     |
| `401`  | `"Not authorized, token invalid or expired"` | Bad/expired token                     |
| `403`  | `"Admin access required"`                    | Authenticated user is not an admin    |
| `404`  | `"User not found"`                           | No user with the given email exists   |

```json
{
  "success": false,
  "error": "Admin access required"
}
```

---

### Create Task for User (Admin)

Create a task in a specific set for a specific user. The target set must already exist for that user.

- **Method:** `POST`
- **Endpoint:** `/api/admin/tasks/:email`
- **Auth required:** Yes (admin only)

#### Path Parameters

| Name    | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| `email` | string | Yes      | Email address of the target user |

#### Request Body

| Field   | Type   | Required | Description                                    |
| ------- | ------ | -------- | ---------------------------------------------- |
| `title` | string | Yes      | Task title text                                |
| `key`   | string | Yes      | Target set key (must already exist for user)   |

#### Example Request

```json
POST /api/admin/tasks/john@example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "title": "Complete onboarding checklist",
  "key": "Work"
}
```

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": {
    "task_id": 3,
    "title": "Complete onboarding checklist",
    "slot": 3,
    "finished": false,
    "created_at": "2026-03-14T14:00:00.000Z",
    "updated_at": "2026-03-14T14:00:00.000Z",
    "_id": "665f1a2b3c4d5e6f7a8b9c30"
  }
}
```

#### Error Responses

| Status | Error                                               | When                                        |
| ------ | --------------------------------------------------- | ------------------------------------------- |
| `400`  | `"title and key are required"`                      | `title` or `key` is missing                 |
| `400`  | `"Set \"Work\" does not exist for this user"`       | The specified set key doesn't exist for user|
| `401`  | `"Not authorized, no token"`                        | No token provided                           |
| `401`  | `"Not authorized, token invalid or expired"`        | Bad/expired token                           |
| `403`  | `"Admin access required"`                           | Authenticated user is not an admin          |
| `404`  | `"User not found"`                                  | No user with the given email exists         |

```json
{
  "success": false,
  "error": "title and key are required"
}
```

---

## Task Object Schema

Every task object returned by the API has the following fields:

| Field        | Type    | Description                                |
| ------------ | ------- | ------------------------------------------ |
| `_id`        | string  | MongoDB subdocument ObjectId               |
| `task_id`    | integer | Task identifier (unique within a set)      |
| `title`      | string  | Task title text                            |
| `slot`       | integer | Display order position (1-based)           |
| `finished`   | boolean | Whether the task is marked complete        |
| `created_at` | string  | ISO 8601 creation timestamp                |
| `updated_at` | string  | ISO 8601 last-updated timestamp            |
