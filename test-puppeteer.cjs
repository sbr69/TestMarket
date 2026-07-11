const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://unsplash.com/s/photos/water-gun');
    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => img.src).filter(src => src.includes('images.unsplash.com/photo-'));
    });
    console.log(imgs.length > 0 ? imgs[0] : 'No images');
    await browser.close();
  } catch(e) {
    console.error(e);
  }
})();
