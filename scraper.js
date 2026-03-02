// import puppeteer from "puppeteer";
// import fs from "fs";

// (async () => {
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();
//     await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
//       waitUntil: "networkidle2",
//     });

//     const links = await page.$$eval(".slider-container a", (els) =>
//       els.map((el) => el.href)
//     );

//     const results = [];

//     for (const url of links) {
//       const p = await browser.newPage();
//       await p.goto(url, { waitUntil: "networkidle2" });

//       const meta = await p.evaluate(() => {
//         const getMeta = (prop) =>
//           document.querySelector(`meta[property='${prop}']`)?.content || "";

//         console.log("=====================");
//         console.log('getMeta("og:description")', getMeta("og:description"));
//         console.log("=====================");

//         return {
//           title: getMeta("og:title"),
//           url: getMeta("og:url") || window.location.href,
//           description: getMeta("og:description"),
//           image: getMeta("og:image"),
//         };
//       });

//       await p.close();
//       results.push({ url, ...meta });
//     }

//     console.log("--------------");
//     console.log("results", results);
//     console.log("--------------");

//     fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

//     console.log("✅✅✅ Scraping finished");
//   } catch (err) {
//     console.error("❌❌❌ Scraper error:", err);
//     process.exit(1);
//   } finally {
//     if (browser) await browser.close();
//   }
// })();

// import puppeteer from "puppeteer";
// import fs from "fs";

// (async () => {
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     console.log("➡️ Opening sales page...");

//     await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
//       waitUntil: "networkidle2",
//     });

//     // poczekaj aż DOM się wyrenderuje (SPA)
//     await page.waitForSelector(".span-content", { timeout: 15000 });

//     console.log("➡️ Collecting course links...");

//     // ✅ pobieramy tylko kursy spod "Wszystkie kursy"
//     const links = await page.evaluate(() => {
//       const span = [...document.querySelectorAll(".span-content")].find((el) =>
//         el.textContent.toLowerCase().includes("wszystkie kursy")
//       );

//       if (!span) {
//         console.log("❌ Nie znaleziono sekcji 'Wszystkie kursy'");
//         return [];
//       }

//       // znajdź najbliższą sekcję
//       let parent = span.parentElement;

//       while (
//         parent &&
//         !parent.querySelector(".columns.is-centered.has-text-centered")
//       ) {
//         parent = parent.parentElement;
//       }

//       if (!parent) return [];

//       const container = parent.querySelector(
//         ".columns.is-centered.has-text-centered"
//       );

//       if (!container) return [];

//       const anchors = [...container.querySelectorAll("a")];

//       return anchors.map((a) => a.href).filter(Boolean);
//     });

//     console.log(`✅ Found ${links.length} course links`);

//     const results = [];

//     // ✅ używamy jednej strony = dużo szybciej
//     const coursePage = await browser.newPage();

//     for (const url of links) {
//       console.log("➡️ Scraping:", url);

//       await coursePage.goto(url, {
//         waitUntil: "networkidle2",
//       });

//       const meta = await coursePage.evaluate(() => {
//         const getMeta = (prop) =>
//           document.querySelector(`meta[property='${prop}']`)?.content || "";

//         return {
//           title: getMeta("og:title"),
//           url: getMeta("og:url") || window.location.href,
//           description: getMeta("og:description"),
//           image: getMeta("og:image"),
//         };
//       });

//       results.push({
//         sourceUrl: url,
//         ...meta,
//       });
//     }

//     await coursePage.close();

//     console.log("--------------");
//     console.log("results:", results);
//     console.log("--------------");

//     // upewnij się że folder istnieje
//     fs.mkdirSync("public", { recursive: true });

//     fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

//     console.log("✅✅✅ Scraping finished");
//   } catch (err) {
//     console.error("❌❌❌ Scraper error:", err);
//     process.exit(1);
//   } finally {
//     if (browser) await browser.close();
//   }
// })();

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

    const links = await page.evaluate(() => {
      const span = [...document.querySelectorAll(".span-content")].find((el) =>
        el.textContent.trim().toLowerCase().includes("wszystkie kursy")
      );

      if (!span) return [];

      // idziemy w górę aż znajdziemy sekcję zawierającą slider
      let parent = span.parentElement;

      while (parent && !parent.querySelector(".slider-container")) {
        parent = parent.parentElement;
      }

      if (!parent) return [];

      const slider = parent.querySelector(".slider-container");
      if (!slider) return [];

      return [...slider.querySelectorAll("a")]
        .map((a) => a.href)
        .filter(Boolean);
    });

    const results = [];

    for (const url of links) {
      const p = await browser.newPage();
      await p.goto(url, { waitUntil: "networkidle2" });

      const meta = await p.evaluate(() => {
        const getMeta = (prop) =>
          document.querySelector(`meta[property='${prop}']`)?.content || "";

        console.log("=====================");
        console.log('getMeta("og:description")', getMeta("og:description"));
        console.log("=====================");

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

    console.log("--------------");
    console.log("results", results);
    console.log("--------------");

    fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

    console.log("✅✅✅ Scraping finished");
  } catch (err) {
    console.error("❌❌❌ Scraper error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
