# Use the official Node.js image from Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Rebuild native modules
RUN npm rebuild bcrypt

# Copy the rest of the application files
COPY . /app/

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "server.js"]