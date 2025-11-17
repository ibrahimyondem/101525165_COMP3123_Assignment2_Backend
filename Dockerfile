# Backend Dockerfile
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Environment and port
ENV PORT=3001
EXPOSE 3001

# Start the backend
CMD ["npm", "start"]