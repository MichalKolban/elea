import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
      waitUntil: "networkidle2",
    });

    const links = await page.$$eval(".slider-container a", (els) =>
      els.map((el) => el.href)
    );

    const results = [];

    for (const url of links) {
      const p = await browser.newPage();
      await p.goto(url, { waitUntil: "networkidle2" });

      const meta = await p.evaluate(() => {
        const getMeta = (prop) =>
          document.querySelector(`meta[property='${prop}']`)?.content || "";

        return {
          title: getMeta("og:title"),
          url: getMeta("og:url") || window.location.href,
          description: getMeta("og:description"),
          image: getMeta("og:image"),
        };
      });

      await p.close();
      results.push({ url, ...meta });
    }

    fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

    console.log("✅ Scraping finished");
  } catch (err) {
    console.error("❌ Scraper error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
