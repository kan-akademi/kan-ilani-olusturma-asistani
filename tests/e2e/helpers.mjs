import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { chromium } from "playwright-core";

export const APP_URL = process.env.APP_URL ?? "http://localhost:5173";

/** MenuItem value'larinin DOM'daki gercek degeri - her dilde ayni sabit. */
export const REGARDLESS = "Kan Grubu Fark Etmeksizin";
export const BLOOD_GROUPS = [
  "A RH (+)",
  "A RH (-)",
  "B RH (+)",
  "B RH (-)",
  "AB RH (+)",
  "AB RH (-)",
  "0 RH (+)",
  "0 RH (-)",
];

export const SELECT = "#mui-component-select-bloodGroup";
const LISTBOX = "ul[role=listbox]";

/**
 * playwright-core paketi tarayiciyi indirmez; Playwright'in tarayici
 * onbellegini kullanir. Revizyon numarisi surume gore degistigi icin
 * klasoru taramak daha saglam.
 */
function resolveChromium() {
  if (process.env.CHROMIUM_EXECUTABLE) return process.env.CHROMIUM_EXECUTABLE;

  const cache =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    path.join(os.homedir(), "AppData", "Local", "ms-playwright");

  const candidates = [
    "chrome-win/chrome.exe",
    "chrome-win/headless_shell.exe",
    "chrome-linux/chrome",
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
  ];

  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache).filter((d) => d.startsWith("chromium")).sort()) {
      for (const rel of candidates) {
        const exe = path.join(cache, dir, ...rel.split("/"));
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  return undefined; // playwright-core kendi cozumlemeyi dener
}

export async function launchApp() {
  const browser = await chromium.launch({
    executablePath: resolveChromium(),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 420, height: 1400 } });

  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  try {
    await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    await browser.close();
    throw new Error(
      `${APP_URL} erisilebilir degil. Once proje kokunde "npm run dev" ile ` +
        `uygulamayi baslat (bu testler calisan bir dev sunucusuna ihtiyac duyar).`,
    );
  }

  return { browser, page, pageErrors };
}

/**
 * MUI coklu Select'te liste acildiktan sonra her secimden sonra acik kalsin;
 * bu yuzden secimler arasinda openDropdown() CAGIRILMAZ.
 */
export async function openDropdown(page) {
  await page.locator(SELECT).click();
  await page.waitForSelector(LISTBOX, { timeout: 5000 });
}

export async function closeDropdown(page) {
  await page.keyboard.press("Escape");
  await page.waitForSelector(LISTBOX, { state: "detached", timeout: 5000 });
}

/** Normal bir tiklamayla secim yapar; devre disi bir secenek hata firlatir. */
export async function pick(page, group) {
  await page.locator(`li[data-value="${group}"]`).click({ timeout: 5000 });
  await page.waitForTimeout(80);
}

/** Devre disi bir secenek dogrudan DOM uzerinden zorlanarak tiklanir. */
export async function forcePick(page, group) {
  await page.locator(`li[data-value="${group}"]`).click({ force: true });
  await page.waitForTimeout(200);
}

/** Select kutusunun gorunen degeri (virgulle birlestirilmis grup listesi). */
export function selectedGroups(page) {
  return page
    .locator(SELECT)
    .innerText()
    .then((t) => t.trim().replace(/\u200b/g, ""));
}

export async function isDisabled(page, group) {
  return page
    .locator(`li[data-value="${group}"]`)
    .evaluate((el) => el.getAttribute("aria-disabled") === "true");
}

/** Devre disi olan normal kan gruplarinin listesi. */
export async function disabledGroups(page) {
  const out = [];
  for (const g of BLOOD_GROUPS) if (await isDisabled(page, g)) out.push(g);
  return out;
}

export function isModalOpen(page) {
  return page.locator(".swal2-popup").count().then((c) => c > 0);
}

/** BaseTemplateComponent'in poster uzerine yerlestirdigi kan grubu satirlari. */
export function posterBloodGroupLines(page) {
  return page.locator(".image-wrapper .text-item.blood-group").allInnerTexts();
}