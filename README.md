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
**Frontend:** React.js (planned), CloudFlare Pages  
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
│   └── frontend/                     # React.js frontend (In Progress)
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

## Cloud Infrastructure

**Database:** AWS RDS PostgreSQL (eu-north-1)  
**Storage:** AWS S3 (SDK integrated)  
**Frontend:** CloudFlare Pages (planned)

✅ **Completed:** ✅

+ Spring Boot backend (7 controllers, 14+ endpoints)  
+ AWS RDS PostgreSQL production database  
+ JWT auth + role-based access control  
+ ELO rating calculation & audit logging  
+ Flyway migrations & API testing  

🚧 **In Progress:** 🚧

- React.js frontend  
- AWS S3 configuration  
- Testing & deployment  
