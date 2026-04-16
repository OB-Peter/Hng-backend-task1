Markdown

# 🧬 Profile Classification API — HNG Backend Stage 1

A REST API that accepts a name, concurrently fetches demographic data from three
external APIs (Genderize, Agify, Nationalize), classifies the results, stores them
in a SQLite database, and exposes full CRUD endpoints to manage the data.

---

## 📌 Project Overview

This project is part of the **HNG Backend Internship Stage 1** task. The goal is to:

- Accept a name via POST request
- Call three external APIs **concurrently** to fetch gender, age, and nationality data
- Apply classification logic to determine age group
- Store the result in a database (idempotent — no duplicates)
- Expose endpoints to create, read, filter, and delete profiles

---

## 🛠️ Tech Stack

| Layer            | Technology              |
|------------------|-------------------------|
| Runtime          | Node.js 20              |
| Framework        | Express.js              |
| Database         | SQLite (better-sqlite3) |
| HTTP Client      | Axios                   |
| ID Generation    | UUID v7                 |
| Process Manager  | systemd                 |
| Web Server       | Nginx (reverse proxy)   |
| Cloud Provider   | AWS EC2                 |
| OS               | Ubuntu 24.04 LTS        |

---

## 📂 Project Structure
hng-backend-task1/
├── src/
│ ├── app.js # Express app setup
│ ├── config/
│ │ └── database.js # SQLite connection & migrations
│ ├── controllers/
│ │ └── profiles.controller.js # Route handlers
│ ├── middleware/
│ │ ├── errorHandler.js # Global error & 404 handler
│ │ └── validate.js # Request validation
│ ├── routes/
│ │ └── profiles.route.js # Route definitions
│ ├── services/
│ │ ├── externalApis.service.js # Genderize, Agify, Nationalize calls
│ │ └── profiles.service.js # Business logic
│ └── utils/
│ └── classify.js # Age classification helper
├── index.js # Entry point
├── package.json
└── README.md

text


---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/OB-Peter/hng-backend-task1.git
cd hng-backend-task1

# Install dependencies
npm install

# Start the server
npm start
Server starts on http://localhost:3000

🔗 API Endpoints
POST /api/profiles
Creates a new profile by fetching data from external APIs.
Returns existing profile if name already exists (idempotent).

Request:

Bash

curl -X POST http://localhost:3000/api/profiles \
  -H "Content-Type: application/json" \
  -d '{"name": "ella"}'
Response (201 — Created):

JSON

{
  "status": "success",
  "data": {
    "id": "019d9750-2b43-74eb-93b0-616ad7e44334",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.097,
    "created_at": "2026-04-16T17:21:46.820Z"
  }
}
Response (200 — Already exists):

JSON

{
  "status": "success",
  "message": "Profile already exists",
  "data": { "...existing profile..." }
}
GET /api/profiles
Returns all profiles. Supports optional filters via query parameters.

Query Parameters (all optional, case-insensitive):

Param	Example
gender	?gender=female
country_id	?country_id=NG
age_group	?age_group=adult
Request:

Bash

# Get all
curl http://localhost:3000/api/profiles

# With filters
curl "http://localhost:3000/api/profiles?gender=female&age_group=adult"
Response (200):

JSON

{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": "019d9750-2b43-74eb-93b0-616ad7e44334",
      "name": "ella",
      "gender": "female",
      "age": 53,
      "age_group": "adult",
      "country_id": "CM"
    }
  ]
}
GET /api/profiles/:id
Returns a single profile by its UUID.

Request:

Bash

curl http://localhost:3000/api/profiles/019d9750-2b43-74eb-93b0-616ad7e44334
Response (200):

JSON

{
  "status": "success",
  "data": {
    "id": "019d9750-2b43-74eb-93b0-616ad7e44334",
    "name": "ella",
    "gender": "female",
    "gender_probability": 0.99,
    "sample_size": 97517,
    "age": 53,
    "age_group": "adult",
    "country_id": "CM",
    "country_probability": 0.097,
    "created_at": "2026-04-16T17:21:46.820Z"
  }
}
DELETE /api/profiles/:id
Deletes a profile by its UUID.

Request:

Bash

curl -X DELETE http://localhost:3000/api/profiles/019d9750-2b43-74eb-93b0-616ad7e44334
Response: 204 No Content

❌ Error Responses
All errors follow this structure:

JSON

{
  "status": "error",
  "message": "<error message>"
}
Status	Cause
400	Missing or empty name field
404	Profile not found
422	name is not a string
502	External API returned invalid/null data
500	Internal server error
502 example:

JSON

{
  "status": "error",
  "message": "Genderize returned an invalid response"
}
🧠 Classification Logic
Age Groups (from Agify)
Age Range	Group
0 – 12	child
13 – 19	teenager
20 – 59	adult
60+	senior
Nationality (from Nationalize)
The country with the highest probability is selected from the response array.

Edge Cases (returns 502, nothing stored)
Genderize returns gender: null or count: 0
Agify returns age: null
Nationalize returns empty country array
🌍 External APIs Used
API	URL	Purpose
Genderize	https://api.genderize.io?name={name}	Predict gender
Agify	https://api.agify.io?name={name}	Predict age
Nationalize	https://api.nationalize.io?name={name}	Predict nationality
All three are called concurrently using Promise.all() for maximum speed.

🔒 CORS
All responses include:

text

Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
🏗️ Deployment Architecture
text

Internet
    │
    ▼
 Port 80
    │
 Nginx (Reverse Proxy)
    │
    ├── /api/*  ──▶  Port 3000 (Profile Classification API)
    │
    └── /*      ──▶  Port 8000 (DevOps Personal API)
Deployment Stack
Cloud: AWS EC2 (Ubuntu 24.04)
Process Manager: systemd (auto-restart on failure/reboot)
Reverse Proxy: Nginx
Port 3000 is not publicly exposed — all traffic goes through Nginx
�� systemd Service
ini

[Unit]
Description=HNG Backend Task1 - Profile API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/Hng-backend-task1
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
Useful commands:

Bash

# Check status
sudo systemctl status backend-api

# Restart
sudo systemctl restart backend-api

# View live logs
journalctl -u backend-api -f
🔗 Live Deployment
🌍 Base URL	http://13.60.99.178
📋 All Profiles	http://13.60.99.178/api/profiles
👤 Single Profile	http://13.60.99.178/api/profiles/:id
👨‍💻 Developer
Name	Oluyemi Boluwatife Peter
Email	obpeterapp@gmail.com
GitHub	@OB-Peter

