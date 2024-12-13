# Use an official Node runtime as the base image
FROM node:20

# Create the app directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the Node.js server port
EXPOSE 5000

# Start the Node.js app
CMD ["npm", "start"]