# Use the official Node.js LTS version as the base image
FROM node:lts-slim

# Install dependencies required for Playwright and the Firefox browser
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libwayland-server0 \
    libgbm1 \
    libasound2 \
    fonts-liberation \
    libgtk-3-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# Install PM2 globally
RUN npm install pm2 -g

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Install Playwright browsers with dependencies (specifically Firefox)
RUN npx playwright install --with-deps firefox

# Copy the Playwright script into the container
COPY user_simulation_playwright.js /app/user_simulation_playwright.js

# Expose any necessary ports (optional)
# EXPOSE 9615

# Define the command to run your script using shell format to expand environment variables
CMD pm2-runtime start user_simulation_playwright.js -i $PM2_INSTANCES
