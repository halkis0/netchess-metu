 NetChess METU

Cloud-based chess club management system for METU NCC.

## Overview

Platform for METU chess club featuring tournament management, game archiving (PGN format), automated ELO rating calculation, and role-based access control.

**Key Features:**
- Tournament scheduling with room conflict detection
- NCC-ELO rating system (FIDE-based, K-factor: 24/16)
- Role-based access (Player, Manager, Organizer, Admin)
- Game upload/approval workflow
- Comprehensive audit logging

**Course:** CNG 495 - Cloud Computing  
**Semester:** Fall 2025-2026  

## Tech Stack

**Backend:** Spring Boot 4.0, Spring Security 7.0 (JWT), Spring Data JPA, Java 17  
**Database:** AWS RDS PostgreSQL 17.6 (eu-north-1), Flyway migrations  
**Storage:** AWS S3 (PGN files)  
**Frontend:** React.js
**Build:** Maven

## Repository Structure

```
netchess-metu/
├── code/
│   ├── backend/                     # Spring Boot backend
│   │   ├── src/main/java/com/metuncc/netchess/
│   │   │   ├── entity/              # JPA entities
│   │   │   ├── repository/          # Data access layer
│   │   │   ├── service/             # Business logic
│   │   │   ├── controller/          # REST API endpoints
│   │   │   ├── dto/                 # Data transfer objects
│   │   │   ├── security/            # JWT & Spring Security
│   │   │   └── exception/           # Exception handling
│   │   ├── src/main/resources/
│   │   │   ├── application.properties
│   │   │   └── db/migration/        # Flyway scripts
│   │   └── pom.xml
│   └── frontend/                     
│       ├── src/
│       ├── public/
│       └── package.json
├── database/
│   ├── schema.sql                   # Database schema export
│   ├── sample-data.sql              # Sample data for demo
│   └── erd-diagram.png              # Entity relationship diagram
└── README.md                        # This file
```

### Directory Descriptions

- **`code/`** - All source code (backend + frontend)
- **`proposal/`** - Initial project proposal document
- **`progress/`** - Progress reports and screenshots
- **`final/`** - Final report, presentation, and demo materials
- **`database/`** - Database schemas, sample data, and diagrams

## 📡 API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`  
**Users:** `GET /api/users/me`, `GET /api/users/leaderboard`  
**Tournaments:** `POST /api/tournaments` (ORGANIZER+), `GET /api/tournaments`  
**Games:** `POST /api/games`, `PATCH /api/games/{id}/approve` (MANAGER+)  
**Ratings:** `GET /api/ratings/player/{id}`  
**Audit:** `GET /api/audit` (ADMIN)

## Database

7 tables: `users`, `user_roles`, `tournaments`, `rooms`, `games`, `rating_history`, `audit_logs`

**ELO Rating Formula:**
```
K-factor: 24 (≤30 games), 16 (>30 games)
New rating = Old + K * (Actual - Expected)
```

Prerequisites

Java 17+
Node.js 18+
PostgreSQL (or use AWS RDS)
Maven 3.9+

## Cloud Infrastructure

**Database:** AWS RDS PostgreSQL (eu-north-1)  
**Storage:** AWS S3 (SDK integrated)  

## Quick Start Guide

### Backend Setup

1. Configure Database
   
   Edit `src/main/resources/application.properties`:
```properties
   spring.datasource.url=jdbc:postgresql://your-db-host:5432/netchess_db
   spring.datasource.username=your-username
   spring.datasource.password=your-password

   aws.access.key.id=your-access-key
   aws.secret.access.key=your-secret-key
   aws.s3.bucket.name=your-bucket-name
   aws.s3.region=eu-north-1
```

2. Run Backend
```bash
   cd code/backend
   mvn clean install
   mvn spring-boot:run
```
   
   Backend runs on `http://localhost:8080`

### Frontend Setup

1. Install Dependencies
```bash
   cd code/frontend
   npm install
```

2. Configure API URL
   
   Create `.env` file:
```
   REACT_APP_API_URL=http://localhost:8080/api
   GENERATE_SOURCEMAP=false
```

3. Run Frontend
```bash
   npm start
```
   
   Frontend runs on `http://localhost:3000`

### Database Migrations

Flyway runs automatically on startup. For manual migration:
```bash
mvn flyway:migrate
```

---

**Note:** For production deployment, configure CORS properly and use environment variables for all credentials.
