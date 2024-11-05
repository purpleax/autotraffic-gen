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
-   [Monitoring and Logs](#monitoring-and-logs)
-   [Stopping the Service](#stopping-the-service)
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
      - MIN_DELAY=2000
      - MAX_DELAY=10000
      - CONCURRENCY=5
      - TARGET_WEBSITE=https://www.example.com
      - DISABLE_IMAGES=true
      - DISABLE_CSS=true
      - VIEWPORT_WIDTH=1024
      - VIEWPORT_HEIGHT=768

#### Using an `.env` File

Create a file named `.env` in the project root:

    MIN_DELAY=2000
    MAX_DELAY=10000
    CONCURRENCY=5
    TARGET_WEBSITE=https://www.example.com
    DISABLE_IMAGES=true
    DISABLE_CSS=true
    VIEWPORT_WIDTH=1024
    VIEWPORT_HEIGHT=768

## Building the Docker Image

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
