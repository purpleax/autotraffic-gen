// user_simulation_playwright.js

const { firefox } = require('playwright');

(async () => {
  // Configurable settings via environment variables
  const MIN_DELAY = parseInt(process.env.MIN_DELAY, 10) || 1000; // in milliseconds
  const MAX_DELAY = parseInt(process.env.MAX_DELAY, 10) || 5000; // in milliseconds
  const CONCURRENCY = parseInt(process.env.CONCURRENCY, 10) || 5; // Number of concurrent sessions
  const TARGET_WEBSITE = process.env.TARGET_WEBSITE || 'https://www.fastlylab.com';
  const DISABLE_IMAGES = process.env.DISABLE_IMAGES === 'true'; // Disable images if set to 'true'
  const DISABLE_CSS = process.env.DISABLE_CSS === 'true'; // Disable CSS if set to 'true'
  const VIEWPORT_WIDTH = parseInt(process.env.VIEWPORT_WIDTH, 10) || 800; // Default width
  const VIEWPORT_HEIGHT = parseInt(process.env.VIEWPORT_HEIGHT, 10) || 600; // Default height

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
