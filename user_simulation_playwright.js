// user_simulation_playwright.js

const { firefox } = require('playwright');

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

  function randomDelay() {
    return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1) + MIN_DELAY);
  }

  async function simulateUserBehavior(id) {
    const browser = await firefox.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Set viewport size
    await page.setViewportSize({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

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

    try {
      console.log(`Session ${id}: Opening the homepage ${TARGET_WEBSITE}.`);
      await page.goto(TARGET_WEBSITE);
      await page.waitForTimeout(randomDelay());

      const links = await page.$$eval('a[href]', (anchors) => anchors.map((a) => a.href));
      if (links.length > 0) {
        const randomLink = links[Math.floor(Math.random() * links.length)];
        console.log(`Session ${id}: Navigating to link: ${randomLink}`);
        await page.goto(randomLink);
        await page.waitForTimeout(randomDelay());
      }
    } catch (error) {
      console.error(`Session ${id}: An error occurred: ${error}`);
    } finally {
      await browser.close();
      console.log(`Session ${id}: Browser closed.`);
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
