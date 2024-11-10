
# PeerPrep - Collaborative Coding Platform

  

## Overview

PeerPrep is a real-time collaborative coding platform that allows users to practice coding interviews together. Built with a microservices architecture, it features real-time code synchronization, chat functionality, and a comprehensive question pool.

  

## Architecture

- Frontend: React with TypeScript

- Backend Services:

- User Service (Port 5001)

- Question Service (Port 5000)

- Matching Service (Port 5002)

- Collaboration Service (Port 5003)

- Authentication: Firebase

- Database: MongoDB

- Real-time Communication: Socket.IO

- Code Synchronization: Y.js

  

## Prerequisites

- Docker and Docker Compose

- Node.js (for local development)

- MongoDB Atlas Account

- Firebase Account

  

## Quick Start with Docker Compose

  

1. Clone the repository:
`git clone https://github.com/yourusername/peerprep.git`
 `cd peerprep`
 2. Create a `.env` file in the root directory:
 

> # Environment
> 
> NODE_ENV=development
> 
> # MongoDB
> 
> MONGO_DB_URI=your_mongodb_atlas_uri
> 
> # Firebase Configuration
> 
> REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
> 
> REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
> 
> REACT_APP_FIREBASE_PROJECT_ID=your_project_id
> 
> REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
> 
> REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
> 
> REACT_APP_FIREBASE_APP_ID=your_app_id
> 
> REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
> 
> # Service URLs (for production)
> 
> REACT_APP_USER_SERVICE_URL=https://your-user-service-url
> 
> REACT_APP_QUESTION_SERVICE_URL=https://your-question-service-url
> 
> REACT_APP_MATCHING_SERVICE_URL=https://your-matching-service-url
> 
> REACT_APP_COLLABORATION_SERVICE_URL=https://your-collaboration-service-url
> 
2. Start the services using Docker Compose in root directory:
`docker compose up --build`

The services will be available at:
- API TABLE

|Port| Microservice  |
|--|--|
| 3000 |Frontend  |
|5000|Question Service|
|5001|User Service|
|5002|Matching Service|
|5003|Collaboration Service|

## Service Configuration

### Frontend Service
The frontend service connects to the backend services using environment variables. Make sure your `.env` file contains the correct service URLs for both development and production environments.

### Backend Services
Each service runs in its own container and exposes its respective port. The services communicate with each other through the Docker network.

## Features
- Real-time code collaboration
- Integrated chat system
- Question pool with different difficulty levels
- User authentication and session management
- Automatic user matching based on preferences
- Code attempt history tracking

## Technical Details

### Real-time Collaboration
The collaboration service uses Socket.IO and [Y.js](https://docs.yjs.dev) for real-time code synchronization:
- Socket.IO handles real-time communication
- [Y.js](https://docs.yjs.dev) manages Conflict-free Replicated Data Types (CRDT)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) provides the code editing interface

### Authentication
Firebase Authentication is used for:
- User registration and login
- Session management
- Security token generation
- OAuth integration

### Database
MongoDB Atlas is used for:
- Question storage
- User profiles
- Attempt history
- Session management

## Troubleshooting

### Common Issues
1. **Services not connecting**: Check if all ports are correctly mapped in docker-compose.yml
2. **Database connection fails**: Verify MongoDB Atlas connection string in .env
3. **Authentication issues**: Ensure Firebase configuration is correct
4. **WebSocket errors**: Check CORS configuration in backend services

### Solutions
1. Restart Docker containers: `docker compose down && docker compose up --build`
2. Clear Docker volumes: `docker compose down -v`
3. Check logs: `docker compose logs [service-name]`
4. Verify environment variables: `docker compose config`

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments for Technologies Used
- Monaco Editor for the code editor component
- Y.js for real-time collaboration
- Socket.IO for real-time communication
- Firebase for authentication
- MongoDB Atlas for database hosting
