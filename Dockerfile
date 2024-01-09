# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Install dependencies
RUN npm install express sqlite3 cors

# Copy only the server.js file into the container
COPY src/server.js /app

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run server.js when the container launches
CMD ["node", "server.js"]
