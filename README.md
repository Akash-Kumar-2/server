<h1 align='center'>ATG BACKEND</h1>

<h3>Overview</h3>

- The backend of ATG is responsible for handling user authentication, media upload, database management, and providing API endpoints for the frontend. This README provides a guide for setting up, running, 
  and contributing to the backend.

  - **Table of Contents**

    - Technologies Used
    - Setup and Installation
    - Environment Variables
    - Running the Application
    - Database
    - Authentication
    - File Uploads
    
<h2>Technologies Used</h2>

  -  Node.js: JavaScript runtime for server-side development.
  -  Express.js: Web framework for building the backend API.
  -  MongoDB: NoSQL database for data storage.
  -  Mongoose: ODM for MongoDB.
  -  JWT (JsonWebToken): For handling authentication and authorization.
  -  bcryptjs: For password hashing.
  -  dotenv: For environment variable management.
  -  multer: For handling file uploads.
  -  Cloudinary: For managing media (image and video) uploads.
  -  nodemailer: For sending emails.
  -  validator: For validating user input.
  -  morgan: HTTP request logger for development purposes.

<h2>Setup and Installation</h2>
  
  **Prerequisites**

    Node.js v14.x or later
    MongoDB (local or hosted)
    A package manager like npm or yarn

  **Installation**

  - **Clone the repository:**

        git clone https://github.com/Akash-Kumar-2/server.git
        cd server

 - **Install the necessary dependencies:**

       npm install
<h2>Environment Variables</h2>

- **Create a .env file in the root directory with the following variables:**


      PORT=5000
      DATABASE=your_database_url
      DATABASE_PASSWORD=your_database_password
      
      JWT_SECRET=your_jwt_secret_key
      JWT_EXPIRES_IN=10d
      JWT_COOKIE_EXPIRES_IN=10
      
      CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
      CLOUDINARY_API_KEY=your_cloudinary_api_key
      CLOUDINARY_API_SECRET=your_cloudinary_api_secret
      
      NODE_ENV=development
      
      EMAIL=your_email_for_nodemailer
      PASSWORD=your_email_password_for_nodemailer

<h2>Running the Application</h2>

 - **To start the application in development mode, run:**

       npm start

 - **To start the application in production mode:**

       npm run start:prod


<h3>Database</h3>

  The backend uses MongoDB to store user data, session information, and media metadata. Mongoose is utilized to define models and interact with the database in a structured manner. The database includes models for users, storing details such as usernames, passwords (hashed), and media URLs. Queries are performed using Mongoose to interact with collections, and relationships between collections can be managed.

<h3>Authentication</h3>

Authentication is implemented using **JWT (JsonWebToken)**. When a user logs in, a token is issued, containing a payload that includes user data and a secret key. This token is then passed along with requests to protected endpoints via the Authorization header. JWT_SECRET and expiration settings are stored in environment variables, ensuring secure token generation. The token also manages user sessions and restricts access to certain routes based on roles or authentication status.
**Example:**

- To access protected routes, the following header must be included in your requests:


      Authorization: Bearer <your_token_here>

<h3>File Uploads</h3>

File uploads, such as profile pictures or post images, are handled using Multer and integrated with Cloudinary for storing files. Multer handles incoming multipart/form-data for uploads, while Cloudinary stores and manages the files in the cloud. Uploaded files are processed, and their URLs are saved in MongoDB as references for retrieval later.

To upload a file, you must send a POST request to /api/uploads with the file in the form-data body.

**Setup** for cloudinary , multer and nodemailer is inside the **Utils** folder in repo.


