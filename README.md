# Farmer Management API

REST API for Farmer/FPO Member Management System built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js
- Express.js
- MongoDB
- Mongoose

## Features
- Farmer CRUD operations
- Multiple land management per farmer
- Sequential Farmer ID generation
- Soft delete
- Pagination & Search

## API Endpoints

### Farmers
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/farmers | Create farmer |
| GET | /api/farmers | Get all farmers |
| GET | /api/farmers/:id | Get farmer by ID |
| PUT | /api/farmers/:id | Update farmer |
| DELETE | /api/farmers/:id | Soft delete farmer |

### Lands
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/lands | Add land |
| GET | /api/lands/farmer/:farmerId | Get all lands of farmer |
| GET | /api/lands/:id | Get land by ID |
| PUT | /api/lands/:id | Update land |
| DELETE | /api/lands/:id | Soft delete land |
