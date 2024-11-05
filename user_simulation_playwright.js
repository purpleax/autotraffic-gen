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
    if (DEBUG) {
      console.error(`Session ${id}: An error occurred: ${error}`);
    }
  } finally {
    if (browser) {
      await browser.close();
      if (DEBUG) {
        console.log(`Session ${id}: Browser closed.`);
      }
    }
  }
}
