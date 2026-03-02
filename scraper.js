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

    // ✅ realistyczny user-agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    console.log("➡️ Opening sales page...");

    await page.goto("https://ortodoncjaprzyparku.e-lea.com/sales", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // ✅ czekamy aż pojawi się sekcja "Wszystkie kursy"
    await page.waitForFunction(
      () =>
        [...document.querySelectorAll(".span-content")].some((el) =>
          el.textContent.toLowerCase().includes("wszystkie kursy")
        ),
      { timeout: 60000 }
    );

    console.log("➡️ Collecting course links...");

    // ==============================
    // GET LINKS FROM "Wszystkie kursy"
    // ==============================
    const links = await page.evaluate(() => {
      const span = [...document.querySelectorAll(".span-content")].find((el) =>
        el.textContent.toLowerCase().includes("wszystkie kursy")
      );
      if (!span) return [];

      let parent = span.parentElement;
      while (
        parent &&
        !parent.querySelector(".columns.is-centered.has-text-centered")
      ) {
        parent = parent.parentElement;
      }

      const container = parent?.querySelector(
        ".columns.is-centered.has-text-centered"
      );
      if (!container) return [];

      return [...container.querySelectorAll("a")]
        .map((a) => a.href)
        .filter(Boolean);
    });

    console.log(`✅ Found ${links.length} course links`);

    const results = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ używamy jednej strony do scrapowania kursów
    const coursePage = await browser.newPage();
    await coursePage.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // ==============================
    // VISIT EACH COURSE
    // ==============================
    for (const url of links) {
      console.log("➡️ Scraping:", url);

      try {
        await coursePage.goto(url, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });

        const data = await coursePage.evaluate(() => {
          const getMeta = (prop) =>
            document
              .querySelector(`meta[property='${prop}']`)
              ?.getAttribute("content") || "";

          const cards = [...document.querySelectorAll(".card-content")];
          let dateRange = null;

          for (const card of cards) {
            const label = card.querySelector("p");
            if (
              label &&
              label.textContent.includes("Kurs odbywa się w dniach")
            ) {
              const textNode = [...card.childNodes].find(
                (node) =>
                  node.nodeType === Node.TEXT_NODE &&
                  node.textContent.trim().length > 0
              );
              if (textNode) {
                dateRange = textNode.textContent.trim();
                break;
              }
            }
          }

          return {
            title: getMeta("og:title"),
            url: getMeta("og:url") || window.location.href,
            description: getMeta("og:description"),
            image: getMeta("og:image"),
            dateRange,
          };
        });

        if (!data.dateRange) {
          console.log("⚠️ No date found — skipping");
          continue;
        }

        // ==============================
        // PARSE DATE RANGE
        // ==============================
        const parts = data.dateRange.split("-");
        if (parts.length < 2) {
          console.log("⚠️ Invalid date format");
          continue;
        }

        const endDateText = parts[1].trim().split(" ")[0]; // np. 25/04/2026
        const [day, month, year] = endDateText.split("/");

        const courseEndDate = new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );
        courseEndDate.setHours(0, 0, 0, 0);

        if (courseEndDate < today) {
          console.log(`⛔ Course finished (${endDateText}) — skipped`);
          continue;
        }

        console.log(`✅ Future/active course (${endDateText})`);

        results.push({
          ...data,
          courseEndDate: endDateText,
          sourceUrl: url,
        });
      } catch (err) {
        console.log(`❌ Error scraping ${url}:`, err);
        await coursePage.screenshot({
          path: "debug.png",
          fullPage: true,
        });
      }
    }

    await coursePage.close();

    // ==============================
    // SAVE FILE
    // ==============================
    fs.mkdirSync("public", { recursive: true });
    fs.writeFileSync("public/data.json", JSON.stringify({ results }, null, 2));

    console.log("--------------");
    console.log("results:", results);
    console.log("--------------");

    console.log("✅✅✅ Scraping finished");
  } catch (err) {
    console.error("❌❌❌ Scraper error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
