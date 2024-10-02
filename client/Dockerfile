# Use Node.js v20.10.0 as the base image
FROM node:20.10.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on (3000 for React apps)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
