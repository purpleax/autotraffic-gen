# Use the official Node.js LTS version as the base image
FROM node:lts-slim

# Install dependencies required for Playwright and the Chromium browser
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
    libpangocairo-1.0-0 \
    libxcomposite1 \
    libxrandr2 \
    libatk1.0-0 \
    libcups2 \
    libatspi2.0-0 \
    libpango-1.0-0 \
    libharfbuzz0b \
    libxdamage1 \
    libxext6 \
    libvpx7 \
    && rm -rf /var/lib/apt/lists/*

# Install PM2 globally
RUN npm install pm2 -g

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Install Playwright browsers with dependencies (specifically Chromium)
RUN npx playwright install --with-deps chromium

# Copy the Playwright script into the container
COPY user_simulation_playwright.js /app/user_simulation_playwright.js

# Expose any necessary ports (optional)
# EXPOSE 9615

# Define the command to run your script using JSON array syntax and environment variable expansion
CMD ["sh", "-c", "exec pm2-runtime start user_simulation_playwright.js -i $PM2_INSTANCES"]
