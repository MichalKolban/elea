// import puppeteer from "puppeteer";
// import fs from "fs";

// (async () => {
//   // version 0.2
//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: "new",
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//         "--single-process",
//       ],
//     });

//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );

//     await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
//       waitUntil: "networkidle2",
//       timeout: 60000,
//     });

//     await page.waitForFunction(
//       () => document.querySelectorAll(".slider-container a").length > 0,
//       { timeout: 20000 }
//     );

//     const links = await page.evaluate(() => {
//       // Szukaj spanu który zawiera "All Courses" LUB "Wszystkie kursy"
//       const allSpans = Array.from(document.querySelectorAll(".span-content"));
//       const targetSpan = allSpans.find((el) => {
//         const text = el.textContent.trim();
//         return text.includes("All Courses") || text.includes("Wszystkie kursy");
//       });

//       if (!targetSpan) return [];

//       const columnsRow = targetSpan.closest(".columns");
//       if (!columnsRow) return [];

//       let sibling = columnsRow.nextElementSibling;
//       while (sibling) {
//         const sliderContainer = sibling.querySelector(".slider-container");
//         if (sliderContainer) {
//           return Array.from(sliderContainer.querySelectorAll("a"))
//             .map((el) => el.href)
//             .filter(Boolean);
//         }
//         sibling = sibling.nextElementSibling;
//       }

//       return [];
//     });

//     console.log(`Found ${links.length} course links:`, links);

//     const results = [];

//     for (const url of links) {
//       const p = await browser.newPage();
//       await p.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//       );
//       try {
//         await p.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

//         const meta = await p.evaluate(() => {
//           const getMeta = (prop) =>
//             document.querySelector(`meta[property='${prop}']`)?.content || "";

//           return {
//             title: getMeta("og:title"),
//             url: getMeta("og:url") || window.location.href,
//             description: getMeta("og:description"),
//             image: getMeta("og:image"),
//           };
//         });

//         results.push({ url, ...meta });
//         console.log(`✔ Scraped: ${meta.title || url}`);
//       } catch (err) {
//         console.warn(`⚠ Failed to scrape ${url}: ${err.message}`);
//         results.push({ url, title: "", description: "", image: "" });
//       } finally {
//         await p.close();
//       }
//     }

//     fs.mkdirSync("public", { recursive: true });
//     fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

//     console.log("✅✅✅ Scraping finished, saved", results.length, "results");
//   } catch (err) {
//     console.error("❌❌❌ Scraper error:", err);
//     process.exit(1);
//   } finally {
//     if (browser) await browser.close();
//   }
// })();

/////////////////////////////////////

// import puppeteer from "puppeteer";
// import fs from "fs";

// (async () => {     /// version 0.1
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

import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  // scraper version 0.0.4 with additional course dates added
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--single-process",
      ],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.waitForFunction(
      () => document.querySelectorAll(".slider-container a").length > 0,
      { timeout: 20000 }
    );

    const links = await page.evaluate(() => {
      const allSpans = Array.from(document.querySelectorAll(".span-content"));
      const targetSpan = allSpans.find((el) => {
        const text = el.textContent.trim();
        return text.includes("All Courses") || text.includes("Wszystkie kursy");
      });

      if (!targetSpan) return [];

      const columnsRow = targetSpan.closest(".columns");
      if (!columnsRow) return [];

      let sibling = columnsRow.nextElementSibling;
      while (sibling) {
        const sliderContainer = sibling.querySelector(".slider-container");
        if (sliderContainer) {
          return Array.from(sliderContainer.querySelectorAll("a"))
            .map((el) => el.href)
            .filter(Boolean);
        }
        sibling = sibling.nextElementSibling;
      }

      return [];
    });

    console.log(`Found ${links.length} course links:`, links);

    const results = [];
    const now = new Date();

    for (const url of links) {
      const p = await browser.newPage();
      await p.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );
      try {
        await p.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        // Poczekaj chwilę na dynamiczny content
        await new Promise((r) => setTimeout(r, 2000));

        const data = await p.evaluate(() => {
          const getMeta = (prop) =>
            document.querySelector(`meta[property='${prop}']`)?.content || "";

          // DEBUG: zbierz wszystkie card-content teksty
          const allCardTexts = Array.from(
            document.querySelectorAll(".card-content")
          ).map((el) => el.textContent.trim().slice(0, 200));

          // DEBUG: pełny tekst body (pierwsze 2000 znaków)
          const bodySnippet = document.body.innerText.slice(0, 2000);

          // Szukaj daty w card-content
          const cards = Array.from(document.querySelectorAll(".card-content"));
          let courseDate = null;
          let courseDateRaw = null;

          for (const card of cards) {
            const text = card.textContent.trim();
            const match = text.match(/(\d{2}\/\d{2}\/\d{4})/);
            if (match) {
              courseDate = match[1];
              // Pełny string np. "24/04/2026 10:00 - 25/04/2026 17:00"
              const rawMatch = text.match(
                /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}\s*-\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/
              );
              courseDateRaw = rawMatch ? rawMatch[1].trim() : match[0];
              break;
            }
          }

          // Fallback: szukaj daty w całym body
          if (!courseDate) {
            const bodyMatch = document.body.innerText.match(
              /(\d{2}\/\d{2}\/\d{4})/
            );
            if (bodyMatch) courseDate = bodyMatch[1];
          }

          return {
            title: getMeta("og:title"),
            url: getMeta("og:url") || window.location.href,
            description: getMeta("og:description"),
            image: getMeta("og:image"),
            courseDate,
            courseDateRaw,
            debug: { allCardTexts, bodySnippet },
          };
        });

        // console.log(`\n--- DEBUG for ${url} ---`);
        // console.log("cardTexts:", JSON.stringify(data.debug.allCardTexts, null, 2));
        // console.log("bodySnippet:", data.debug.bodySnippet);
        // console.log("courseDate found:", data.courseDate);
        console.log("courseDateRaw found:", data.courseDateRaw);

        // Parsuj datę DD/MM/YYYY → Date
        let isFuture = false;
        if (data.courseDate) {
          const [day, month, year] = data.courseDate.split("/").map(Number);
          const date = new Date(year, month - 1, day);
          isFuture = date > now;
          console.log(
            `📅 ${data.title || url} → ${
              data.courseDateRaw || data.courseDate
            } → ${isFuture ? "✅ future" : "❌ past"}`
          );
        } else {
          console.log(`⚠ No date found for: ${url}`);
        }

        const { debug, ...dataWithoutDebug } = data;
        if (isFuture) {
          results.push({ url, ...dataWithoutDebug });
        }
      } catch (err) {
        console.warn(`⚠ Failed to scrape ${url}: ${err.message}`);
      } finally {
        await p.close();
      }
    }

    fs.mkdirSync("public", { recursive: true });
    fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

    console.log(
      `✅✅✅ Scraping finished, saved ${results.length} future courses`
    );
  } catch (err) {
    console.error("❌❌❌ Scraper error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
