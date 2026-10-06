/**
 * `right = 360` gercekte ne? `.text-item` abspos + genislik yok ->
 * shrink-to-fit, ama containing block'a kirpilir: left + (360 - left) = 360.
 * Yani 360 degeri metnin degil KUTUNUN kenara yapisindan geliyor.
 *
 * Gercek metin genisligi Range ile olculur: her metin dugumu icin
 * getClientRects() -> satirlarin gercek ink kutusu.
 */
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  templateButtons,
} from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const buttons = await templateButtons(page);
const ORDER = [6, 3, 4, 5, 2, 1, 7];

const setGroups = async (groups) => {
  await openDropdown(page);
  for (let i = 0; i < 8; i++) {
    const c = page.locator("li[data-value]:has(input:checked)");
    if ((await c.count()) === 0) break;
    await c.first().click();
    await page.waitForTimeout(60);
  }
  for (const g of groups) await pick(page, g);
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });
};

const setTypes = async (types) => {
  await page.locator("#mui-component-select-bloodType").click();
  await page.waitForSelector("ul[role=listbox]");
  for (let i = 0; i < 6; i++) {
    const c = page.locator("ul[role=listbox] li[data-value]:has(input:checked)");
    if ((await c.count()) === 0) break;
    await c.first().click();
    await page.waitForTimeout(60);
  }
  for (const t of types) {
    await page.locator(`ul[role=listbox] li[data-value="${t}"]`).click();
    await page.waitForTimeout(70);
  }
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });
  await page.waitForTimeout(200);
};

/** Kutunun `right`ini VE gercek metnin `right`ini birlikte verir. */
const ink = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const el = [...wrap.querySelectorAll(".text-item")].find(
      (e) =>
        !e.classList.contains("blood-group") &&
        !e.classList.contains("multiline") &&
        e.innerText.includes("Kırmızı"),
    );
    const box = el.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    return {
      text: el.innerText.trim(),
      font: parseFloat(getComputedStyle(el).fontSize),
      left: Math.round(parseFloat(getComputedStyle(el).left)),
      kutuSag: Math.round(box.right - wr.left),
      kutuGenislik: Math.round(box.width),
      metinSag: rects.length ? Math.round(Math.max(...rects.map((r) => r.right)) - wr.left) : null,
      metinSol: rects.length ? Math.round(Math.min(...rects.map((r) => r.left)) - wr.left) : null,
      satirSayisi: rects.length,
      cerceve: Math.round(wr.width),
    };
  });

console.log("T   tip  font  left  kutuGen  kutuSag  metinSol  metinSag  cerceve  bosluk");
for (const tid of ORDER) {
  await buttons[ORDER.indexOf(tid)].click();
  await page.waitForTimeout(200);
  await setGroups(BLOOD_GROUPS.slice(0, 2));
  for (const n of [2, 3, 4, 5]) {
    await setTypes(["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma", "Kök Hücre"].slice(0, n));
    const r = await ink();
    console.log(
      `${tid}  ${String(n).padStart(2)}  ${String(r.font).padStart(4)}  ${String(r.left).padStart(4)}  ` +
        `${String(r.kutuGenislik).padStart(6)}  ${String(r.kutuSag).padStart(7)}  ${String(r.metinSol).padStart(8)}  ` +
        `${String(r.metinSag).padStart(8)}  ${String(r.cerceve).padStart(7)}  ${String(r.cerceve - r.metinSag).padStart(6)}`,
    );
  }
}

await browser.close();