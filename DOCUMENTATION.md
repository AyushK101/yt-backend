# YouTube like Backend project

**Project Name**: Video Hosting Backend
**Version**: 1.0.0  
**License**: MIT  
**Author**: Ayush Kumar  
**Technologies Used**: Node.js, Express.js, MongoDB(mongoose), JWT, Multer, Cloudinary  
**Description**: This project is a beginner-level backend for a YouTube-like platform. It supports user authentication, video uploads, channel subscriptions, video deletion, and video viewing features.

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- Cloudinary account (for media storage)

### Steps to run the project locally

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/yt-backend.git
   cd yt-backend

2. install dependencies

    ```bash
    npm i

3. Set environment variables by creating a .env file

    ```bash
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/ytclone
    CLOUDINARY_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_secret

4. start the server

    ```bash
    npm start

5. Open your browser and visit

    ```bash
    http://localhost:5000


### **Project Structure**

Describing the structure of project, explaining the purpose of key folders and files.

```md
yt-backend/
│
├── controllers/     # Business logic for different entities like user, video, subscription
├── models/          # MongoDB schema models for users, videos, channels
├── routes/          # All API routes
├── middlewares/     # Authentication, error-handling middleware
├── utils/           # Utility functions
<!-- ├── config/          # Configuration files (e.g., for MongoDB, Cloudinary) -->
├── .env             # Environmental variables (not in version control)
├── server.js        # Entry point for the server
└── README.md        # Project documentation
```

## API Endpoints

### 1. User Routes

#### Register User

- **Method**: `POST`
- **Endpoint**: `/api/users/register`
- **Request Body**:

  ```json
  {
    "username": "johnDoe",
    "email": "john@example.com",
    "password": "password123"
  }


