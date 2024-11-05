// user_simulation_playwright.js

const { firefox } = require('playwright');

// Global error handling for unhandled promise rejections and exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

(async () => {
  // Read configuration from environment variables
  const MIN_DELAY = parseInt(process.env.MIN_DELAY, 10);
  const MAX_DELAY = parseInt(process.env.MAX_DELAY, 10);
  const CONCURRENCY = parseInt(process.env.CONCURRENCY, 10);
  const TARGET_WEBSITE = process.env.TARGET_WEBSITE;
  const DISABLE_IMAGES = process.env.DISABLE_IMAGES === 'true';
  const DISABLE_CSS = process.env.DISABLE_CSS === 'true';
  const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH, 10);
  const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT, 10);
  const ONLY_INTERNAL_LINKS = process.env.ONLY_INTERNAL_LINKS === 'true';
  const DEBUG = process.env.DEBUG === 'true'; // Debug flag

  // Custom headers
  let customHeaders = {};
  if (process.env.CUSTOM_HEADERS) {
    try {
      customHeaders = JSON.parse(process.env.CUSTOM_HEADERS);
      if (typeof customHeaders !== 'object' || Array.isArray(customHeaders)) {
        throw new Error('CUSTOM_HEADERS must be a JSON object.');
      }
    } catch (error) {
      console.error('Error parsing CUSTOM_HEADERS environment variable:', error.message);
      process.exit(1);
    }
  }

  // Validate required environment variables
  if (
    isNaN(MIN_DELAY) ||
    isNaN(MAX_DELAY) ||
    isNaN(CONCURRENCY) ||
    !TARGET_WEBSITE ||
    isNaN(VIEWPORT_WIDTH) ||
    isNaN(VIEWPORT_HEIGHT)
  ) {
    console.error('Error: One or more required environment variables are missing or invalid.');
    console.error('Please ensure MIN_DELAY, MAX_DELAY, CONCURRENCY, TARGET_WEBSITE, VIEWPORT_WIDTH, and VIEWPORT_HEIGHT are set correctly.');
    process.exit(1);
  }

  // Parse the target URL to extract the domain
  const targetUrl = new URL(TARGET_WEBSITE);
  const targetDomain = targetUrl.hostname;

  function randomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1) + MIN_DELAY);
  }

  async function simulateUserBehavior(id) {
    let browser;
    try {
      browser = await firefox.launch({
        headless: true,
      });
      const page = await browser.newPage();

      // Set viewport size
      await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

      // Set custom headers if specified
      if (Object.keys(customHeaders).length > 0) {
        await page.setExtraHTTPHeaders(customHeaders);
        if (DEBUG) {
          console.log(`Session ${id}: Setting custom headers:`, customHeaders);
        }
      }

      // Optionally disable images and CSS
      if (DISABLE_IMAGES || DISABLE_CSS) {
        await page.route('**/*', (route) => {
          const request = route.request();
          const resourceType = request.resourceType();

          if (DISABLE_IMAGES && resourceType === 'image') {
            route.abort();
          } else if (DISABLE_CSS && resourceType === 'stylesheet') {
            route.abort();
          } else {
            route.continue();
          }
        });
      }

      if (DEBUG) {
        console.log(`Session ${id}: Opening the homepage ${TARGET_WEBSITE}.`);
      }
      await page.goto(TARGET_WEBSITE);
      await page.waitForTimeout(randomDelay());

      // Extract links from the page
      let links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => a.href));

      // Filter links to only include those within the target domain if ONLY_INTERNAL_LINKS is true
      if (ONLY_INTERNAL_LINKS) {
        links = links.filter((link) => {
          try {
            const url = new URL(link, TARGET_WEBSITE);
            return url.hostname === targetDomain;
          } catch (e) {
            // Ignore invalid URLs
            return false;
          }
        });
      }

      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * links.length)];
        if (DEBUG) {
          console.log(`Session ${id}: Navigating to link: ${randomLink}`);
        }
        await page.goto(randomLink);
        await page.waitForTimeout(randomDelay());
      } else {
        if (DEBUG) {
          console.log(`Session ${id}: No links found to navigate to.`);
        }
      }
    } catch (error) {
      console.error(`Session ${id}: An error occurred:`, error);
    } finally {
      if (browser) {
        await browser.close();
        if (DEBUG) {
          console.log(`Session ${id}: Browser closed.`);
        }
      }
    }
  }

  // Run the simulations concurrently in a loop
  while (true) {
    const sessions = [];
    for (let i = 1; i <= CONCURRENCY; i++) {
      sessions.push(simulateUserBehavior(i));
    }
    await Promise.all(sessions);
    // Optional: Add a delay between batches
    await new Promise((resolve) => setTimeout(resolve, randomDelay()));
  }
})();
