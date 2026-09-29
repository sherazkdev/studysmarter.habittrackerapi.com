/**
 * Builds .requirements/study-smarter-api-endpoints.pdf from api-reference.html
 * Usage: npm run docs:pdf
 */
import puppeteer from "puppeteer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = path.join(root, ".requirements", "api-reference.html");
const pdfPath = path.join(root, ".requirements", "study-smarter-api-endpoints.pdf");
const htmlUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;

const browser = await puppeteer.launch({
  headless: true,
  channel: "chrome",
});
try {
  const page = await browser.newPage();
  await page.goto(htmlUrl, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "12mm", right: "10mm", bottom: "14mm", left: "10mm" },
  });
  console.log("Wrote", pdfPath);
} finally {
  await browser.close();
}
