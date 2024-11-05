# Auto Traffic Generator

A Dockerized solution to simulate user behavior on a website using Playwright. This tool allows you to generate configurable traffic to a target website by automating browser interactions, with options to control concurrency, resource usage, and more.

## Table of Contents

-   [Features](#features)
-   [Prerequisites](#prerequisites)
-   [Getting Started](#getting-started)
    -   [Clone the Repository](#clone-the-repository)
    -   [Directory Structure](#directory-structure)
-   [Configuration](#configuration)
    -   [Environment Variables](#environment-variables)
-   [Building the Docker Image](#building-the-docker-image)
-   [Running the Container](#running-the-container)
    -   [Using Docker Compose](#using-docker-compose)
    -   [Scaling the Service](#scaling-the-service)
-   [Customization](#customization)
-   [Troubleshooting](#troubleshooting)

## Features

-   **Simulate User Behavior**: Automates browser interactions to mimic real user actions.
-   **Configurable Delays**: Set minimum and maximum delays between actions.
-   **Concurrency Control**: Adjust the number of concurrent sessions.
-   **Resource Usage Options**: Disable images and CSS to reduce resource consumption.
-   **Viewport Configuration**: Specify viewport dimensions.
-   **Target Website Configuration**: Specify the target website without modifying the script.
-   **Dockerized Setup**: Easy deployment and isolation using Docker and Docker Compose.

## Prerequisites

-   **Docker**: Make sure Docker is installed and running on your system.
    -   Install Docker
-   **Docker Compose**: Required to run the service using `docker-compose.yml`.
    -   Install Docker Compose

## Getting Started

### Clone the Repository

    git clone https://github.com/yourusername/autotraffic-gen.git
    cd autotraffic-gen

**Directory Structure**

    autotraffic-gen/
    ├── Dockerfile
    ├── docker-compose.yml
    ├── package.json
    ├── user_simulation_playwright.js
    └── README.md

## Configuration

### Environment Variables

Configure the behavior of the traffic generator using environment variables. You can set these variables in the `docker-compose.yml` file or in an `.env` file.

#### Available Variables:

-   **MIN_DELAY**: Minimum delay between actions in milliseconds (default: `1000`).
-   **MAX_DELAY**: Maximum delay between actions in milliseconds (default: `5000`).
-   **CONCURRENCY**: Number of concurrent sessions (default: `5`).
-   **TARGET_WEBSITE**: URL of the target website (default: `https://www.fastlylab.com`).
-   **DISABLE_IMAGES**: Disable loading of images (`true` or `false`, default: `false`).
-   **DISABLE_CSS**: Disable loading of CSS (`true` or `false`, default: `false`).
-   **VIEWPORT_WIDTH**: Width of the browser viewport (default: `800`).
-   **VIEWPORT_HEIGHT**: Height of the browser viewport (default: `600`).

#### Setting Variables in `docker-compose.yml`

    environment:
      - MIN_DELAY=2000            # Minimum delay in milliseconds
      - MAX_DELAY=10000           # Maximum delay in milliseconds
      - CONCURRENCY=5             # Number of concurrent sessions per script instance
      - TARGET_WEBSITE=https://www.example.com  # Replace with your target website
      - DISABLE_IMAGES=true       # Disable images to reduce resource usage
      - DISABLE_CSS=true          # Disable CSS to reduce resource usage
      - VIEWPORT_WIDTH=1024       # Width of the browser viewport
      - VIEWPORT_HEIGHT=768       # Height of the browser viewport
      - PM2_INSTANCES=5           # Number of script instances to run
      - ONLY_INTERNAL_LINKS=true  # Set to 'true' to only follow internal links
      - DEBUG=false               # Set to 'true' to enable debug logging
    restart: always


#### Using an `.env` File

Create a file named `.env` in the project root:

 # Delay configuration
MIN_DELAY=2000
MAX_DELAY=10000

# Concurrency settings
CONCURRENCY=5
PM2_INSTANCES=3

# Target website
TARGET_WEBSITE=https://www.example.com

# Resource optimization
DISABLE_IMAGES=true
DISABLE_CSS=true

# Viewport settings
VIEWPORT_WIDTH=1024
VIEWPORT_HEIGHT=768

# Navigation options
ONLY_INTERNAL_LINKS=true

# Custom headers (JSON string)
CUSTOM_HEADERS={"X-Custom-Header1":"Value1","X-Custom-Header2":"Value2"}

# Debug mode
DEBUG=false

## Building the Docker Image

**Explanation of the Dockerfile:**

-   **Base Image:**
    
    -   Uses `node:lts-slim` as the base image for a lightweight Node.js environment compatible with multiple architectures, including ARM64.
-   **Installing Dependencies:**
    
    -   Installs system libraries required by Playwright and Firefox using `apt-get install`.
    -   The libraries include GTK, NSS, and others necessary for headless browser operation.
-   **Working Directory:**
    
    -   Sets `/app` as the working directory inside the container.
-   **Copying Files:**
    
    -   Copies `package.json` and `package-lock.json` to install Node.js dependencies.
    -   Copies the `user_simulation_playwright.js` script into the container.
-   **Installing Node.js Dependencies:**
    
    -   Runs `npm install` to install the dependencies specified in `package.json`, including Playwright.
-   **Installing Playwright Browsers:**
    
    -   Executes `npx playwright install --with-deps firefox` to install the Firefox browser and any additional dependencies required by Playwright.
    -   If you wish to use a different browser (e.g., Chromium or WebKit), replace `firefox` with the desired browser in the command.
-   **Environment Variables:**
    
    -   Environment variables such as `MIN_DELAY`, `MAX_DELAY`, `CONCURRENCY`, and others are not set in the Dockerfile. Instead, they are specified at runtime via `docker-compose.yml` or an `.env` file to allow for flexibility and easy configuration changes without modifying the Docker image.
-   **Command:**
    
    -   The `CMD` instruction defines the default command to run when the container starts. It uses `npm start`, which executes the `start` script defined in your `package.json`.
-   **Optional Steps:**
    
    -   If you're using an `.env` file for environment variables, you may need to copy it into the Docker image. Uncomment the `COPY .env /app/.env` line if necessary.
    -   The `EXPOSE` instruction is commented out but can be used to expose any ports if your application requires it.

----------

### **Additional Notes:**

-   **Multi-Architecture Support:**
    
    -   The `node:lts-slim` image is a multi-architecture image, which means it supports both `amd64` and `arm64` platforms. This is useful if you're running Docker on an ARM-based system.
-   **Browser Choice:**
    
    -   The Dockerfile installs Firefox by default for use with Playwright due to its better support on ARM architectures.
    -   If you wish to use a different browser, adjust the `npx playwright install` command accordingly and ensure that your script imports the correct browser.
-   **Environment Variables:**
    
    -   Since the script reads configuration options from environment variables, you should specify these variables in your `docker-compose.yml` file or via the `docker run` command.
    -   This approach allows you to change configurations without rebuilding the Docker image.
-   **Dependencies:**
    
    -   The list of libraries installed via `apt-get` may vary depending on the browser and version of Playwright you're using. If you encounter errors related to missing libraries, you may need to install additional packages.

Build the Docker image using Docker Compose:

    docker-compose build

Alternatively, build the image using Docker:

    docker build -t user-simulator-playwright .

## Running the Container

### Using Docker Compose

Start the service in detached mode:

    docker-compose up -d

Running with Docker (Without Compose)

    docker run -d \
      --name user-simulator \
      -e MIN_DELAY=2000 \
      -e MAX_DELAY=10000 \
      -e CONCURRENCY=5 \
      -e TARGET_WEBSITE=https://www.example.com \
      -e DISABLE_IMAGES=true \
      -e DISABLE_CSS=true \
      -e VIEWPORT_WIDTH=1024 \
      -e VIEWPORT_HEIGHT=768 \
      user-simulator-playwright

## Scaling the Service

Increase the number of containers to simulate more users.

    docker-compose up -d --scale user-simulator=3

This command runs 3 instances of the service, each with the specified concurrency level.


## Customization

### Modifying the Script

The script `user_simulation_playwright.js` can be customized to change the user simulation behavior.

### Changing Browsers

The script uses Firefox by default. To use a different browser (e.g., Chromium or WebKit), modify the import statement and update the Dockerfile accordingly.

----------

## Troubleshooting

-   **Invalid `package.json`**: Ensure your `package.json` file is valid JSON. Use a linter or validator if necessary.
-   **Docker Build Errors**: Check the Dockerfile and ensure all dependencies are correctly specified.
-   **Resource Usage**: High concurrency levels may consume significant resources. Monitor system usage with `docker stats` or system monitoring tools.
