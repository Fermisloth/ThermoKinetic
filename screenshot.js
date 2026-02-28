const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new"
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL
    await page.goto('https://stripe.com/', {
        waitUntil: 'networkidle2',
        timeout: 60000
    });

    // Take a full page screenshot
    await page.screenshot({ path: 'stripe_fullpage.png', fullPage: true });

    await browser.close();
    console.log('Successfully saved screenshot to stripe_fullpage.png');
})();
