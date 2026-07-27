<div align="center">

# 🏎️ F1DecisionMaker

### Data-driven Formula 1 strategy simulator powered by the OpenF1 API.

[![Java](https://img.shields.io/badge/Backend-Python-blue?style=for-the-badge&logo=openjdk&logoColor=white)]()
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-Framework-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)]()
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)]()

</div>

---

# Overview

F1DecisionMaker is a Formula 1 race strategy simulator that combines historical race telemetry with statistical analysis to evaluate strategic decisions before and during a race.

Instead of simply displaying telemetry, the platform allows users to compare different race strategies, simulate pit stop windows, evaluate tire compounds, and analyze how specific decisions could affect the final race outcome.

The project uses real-world Formula 1 data obtained through the OpenF1 API.

---

# Features

- Driver comparison
- Team comparison
- Tire strategy simulation
- Pit stop window prediction
- Race pace analysis
- Historical race data
- Lap-by-lap visualization
- Telemetry analysis
- Sector performance comparison
- Tire degradation analysis
- Interactive dashboards
- Strategy recommendation engine

---

# Tech Stack

## Backend

- Python
- Pandas

## Frontend

- React
- TypeScript
- TailwindCSS

## Database

- PostgreSQL

## Data

- OpenF1 API

## DevOps

- Docker
- GitHub Actions

---

# Architecture

```
             OpenF1 API
                  │
                  ▼
        Data Collection Service
                  │
                  ▼
        Data Processing Pipeline
                  │
                  ▼
          PostgreSQL Database
                  │
                  ▼
        Spring Boot REST API
                  │
                  ▼
            React Dashboard
```

---

# Example Use Cases

## Strategy Simulation

Compare two different pit stop strategies using historical race data.

Example:

Driver A

- Medium → Hard
- Pit Lap 19

versus

Driver B

- Soft → Medium → Soft
- Pit Laps 13 and 42

The simulator estimates which strategy would likely produce the best finishing position under similar race conditions.

---

## Telemetry Analysis

Analyze:

- Speed
- Throttle
- Brake
- RPM
- DRS
- Gear
- Sector Times

for any available driver session.

---

## Race Analysis

Explore:

- Race pace
- Tire degradation
- Average lap time
- Fastest laps
- Gap evolution
- Position changes

---

# Project Goals

The objective of F1DecisionMaker is to explore how real motorsport data can be transformed into meaningful strategic insights through software engineering and data analysis.

The project also serves as a practical study of:

- API integration
- Backend architecture
- Data processing
- Interactive visualization
- Predictive analysis

---

# Future Roadmap

- AI strategy recommendation
- Machine Learning prediction models
- Weather simulation
- Safety Car simulation
- Virtual Safety Car simulation
- Fuel strategy
- Multi-race comparison
- Championship analytics
- Driver performance trends
- Custom dashboards
- Export reports (PDF/CSV)

---

# Screenshots

> Coming soon

---

# API

Data provided by:

https://openf1.org

---

# Running Locally

```bash
git clone https://github.com/nathanscd/F1DecisionMaker.git

cd F1DecisionMaker
```

Backend

```bash
./mvnw spring-boot:run
```

Frontend

```bash
npm install
npm run dev
```

---

# Author

Nathanael Secundo Cardoso

Software Engineer focused on backend development, distributed systems and data-driven applications.

LinkedIn

Email

Portfolio
