# Task Management API

## Overview

This is a Task Management API built with Express.js and Mongoose. It provides endpoints for creating, retrieving, updating, and deleting tasks, as well as filtering and sorting tasks based on various criteria.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **Filtering**: Filter tasks by priority and status.
- **Sorting**: Sort tasks by due date, priority, or status.
- **Custom Priority Sorting**: Custom sort order for priority (High, Medium, Low).

## Technologies

- **Node.js**: JavaScript runtime used for the server.
- **Express.js**: Web framework for Node.js.
- **Mongoose**: ODM library for MongoDB.
- **MongoDB**: NoSQL database to store tasks.
- **Redis**: Caching (optional, based on your setup).

## Installation

### Prerequisites

- Node.js
- MongoDB

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/task-management-api.git
   cd task-management-api

2. **Install dependencies**

    ```bash
    npm install

3. **setup environment variables**
rename .env file and set environment variables.


4. **start the server**
    ```
    npm start


## API documentation
Openapi doc - https://app.swaggerhub.com/apis/TARUNKUMAR9142/task-management_api/1.0.0