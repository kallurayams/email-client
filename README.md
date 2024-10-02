# Project Name

Brief description of your project.

## Prerequisites

- Node.js (v20.10.0)
- npm
- Docker (for deployment)

## Installation and Setup

### Frontend Setup

1. Navigate to the client folder:

   ```
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Configure the proper URLs in the config file.

4. Start the frontend server:
   ```
   npm start
   ```

### Backend Setup

1. From the root folder, install dependencies:

   ```
   npm install
   ```

2. Configure the `.env` file with proper URLs and Microsoft Azure App credentials.

3. Create private and secret keys:

   - Rename them as `privateKey.pem` and `certificate.pem`
   - Move them to `server/cert/outlook/` folder
   - These are used to encrypt and decrypt info from webhook

4. Start the backend server:
   ```
   npm start
   ```

## Docker Deployment

1. Update certificates, environment file, and all URLs.

2. Run the following command:
   ```
   docker-compose up --build -d
   ```
   or
   ```
   docker compose up --build -d
   ```

## Accessing the Application

After starting the application, you can access it at:

```
http://localhost:3000/
```
