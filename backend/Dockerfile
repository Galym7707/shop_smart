# Use an official Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your code
COPY . .

# Expose the port your app uses (e.g., 5000)
EXPOSE 5000

# Start your application
CMD ["node", "src/index.js"]