/**
 * `bloodType` -> `date` arasindaki KUTU bosluğu 0-1px olan sablonlarda
 * (T2/T3/T4 1px, T7 0px) gercekten GORSEL cakisma var mi?
 *
 * Kutu bosluğu gorunur degildir: `.text-item` line-height 1.5 kullaniyor,
 * yani her satirin ustunde ve altinda (1.5-1)/2 = %25'lik bosluk var.
 * 0px kutu bosluugu ~0.25*15 + 0.25*17 ~= 8px gercek murekkep payi
 * demek olabilir.
 *
 * Olcum: Range.getClientRects() -> satir basina GERCEK metin kutusu
 * (line-height degil, fontun ascent/descent'i). bloodType'in son satirinin
 * murekkep altindan `date`'in ilk satirinin murekkep ustune fark alinir.
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
  await page.waitForTimeout(150);
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

/** bloodType ve date icin KUTU + GERCEK MUREKKEP kutu ve satirlari. */
const inkPair = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const range = document.createRange();
    const all = [...wrap.querySelectorAll(".text-item")];

    const tipEl = all.find(
      (e) =>
        !e.classList.contains("blood-group") &&
        !e.classList.contains("multiline") &&
        e.innerText.includes("Kırmızı"),
    );
    const allPlain = all.filter(
      (e) => !e.classList.contains("blood-group") && !e.classList.contains("multiline"),
    );
    const dateEl = allPlain.find(
      (e) => e !== tipEl && e.innerText.trim().length > 0 && e.getBoundingClientRect().top > tipEl.getBoundingClientRect().top,
    );

    const info = (el) => {
      if (!el) return null;
      const box = el.getBoundingClientRect();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      return {
        font: parseFloat(getComputedStyle(el).fontSize),
        boxTop: Math.round(box.top - wr.top),
        boxBottom: Math.round(box.bottom - wr.top),
        inkTop: rects.length ? Math.round(Math.min(...rects.map((r) => r.top)) - wr.top) : null,
        inkBottom: rects.length ? Math.round(Math.max(...rects.map((r) => r.bottom)) - wr.top) : null,
        lines: rects.length,
      };
    };

    return { tip: info(tipEl), date: info(dateEl) };
  });

console.log("T   tip  | bloodType kutu  mu-rek-kep  satir | date kutu  mu-rek-kep | KUTU pay  MU- REKKEP pay");
for (const tid of ORDER) {
  await buttons[ORDER.indexOf(tid)].click();
  await page.waitForTimeout(200);
  await setGroups(BLOOD_GROUPS.slice(0, 2));
  for (const n of [3, 4, 5]) {
    await setTypes(["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma", "Kök Hücre"].slice(0, n));
    const { tip, date } = await inkPair();
    if (!tip || !date) {
      console.log(`T${tid} ${n} tip: olcum basarisiz (tip=${!!tip} date=${!!date})`);
      continue;
    }
    const kutuPay = date.boxTop - tip.boxBottom;
    const inkPay = date.inkTop - tip.inkBottom;
    const bayrak = (x) => (x < 0 ? "  <<< CAKISMA" : x < 2 ? "  <<< 0-1px" : x < 4 ? "  <- 2-3px" : "");
    console.log(
      `${tid}  ${String(n).padStart(2)}  | ${String(tip.font).padStart(4)} ${String(tip.boxTop).padStart(4)}-${String(tip.boxBottom).padStart(4)}  ${String(tip.inkTop).padStart(4)}-${String(tip.inkBottom).padStart(4)}  ${String(tip.lines).padStart(3)} | ` +
        `${String(date.boxTop).padStart(4)}-${String(date.boxBottom).padStart(4)}  ${String(date.inkTop).padStart(4)}-${String(date.inkBottom).padStart(4)} | ` +
        `${String(kutuPay).padStart(6)}${bayrak(kutuPay)}  ${String(inkPay).padStart(6)}${bayrak(inkPay)}`,
    );
  }
}

await browser.close();