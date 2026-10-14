/**
 * Hicbir test 3 kan tipi secmiyor (testler ya bos ya 4+ kullaniyor).
 * 3 tip, 2 ve 4 arasindaki "orta bant": font cogunlukla 17px kaliyor
 * (4+ tipte 15px'e iner) ama metin en uzun halinde.
 *
 * Bu tarama 3 tip icin kan grubu bandi -> bloodType -> sonraki eleman
 * zincirini olcer ve dikey bosluklari her sablon icin raporlar.
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
    if (await c.count() === 0) break;
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

const scan = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const range = document.createRange();
    return {
      cerceve: Math.round(wr.width),
      items: [...wrap.querySelectorAll(".text-item")]
        .map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight);
          range.selectNodeContents(el);
          const rects = [...range.getClientRects()].filter((x) => x.width > 0);
          return {
            tip: el.className.includes("blood-group")
              ? "grup"
              : el.className.includes("multiline")
                ? "coklu"
                : "duz",
            text: el.innerText.trim(),
            font: parseFloat(cs.fontSize),
            top: Math.round(r.top - wr.top),
            bottom: Math.round(r.bottom - wr.top),
            metinSag: rects.length
              ? Math.round(Math.max(...rects.map((x) => x.right)) - wr.left)
              : Math.round(r.right - wr.left),
          };
        })
        .filter((b) => b.text.length > 0)
        .sort((a, b) => a.top - b.top),
    };
  });

const TYPES = ["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma", "Kök Hücre"];

for (const tid of ORDER) {
  await buttons[ORDER.indexOf(tid)].click();
  await page.waitForTimeout(200);
  await setGroups(BLOOD_GROUPS.slice(0, 2));

  console.log(`\n===== T${tid} =====`);
  console.log("tip  font  kanGrubu->bloodType   bloodType kendi kutusu   sonraki eleman   yatay pay");
  for (const n of [1, 2, 3, 4, 5]) {
    await setTypes(TYPES.slice(0, n));
    const { items, cerceve } = await scan();
    const grup = items.filter((i) => i.tip === "grup");
    const tipEl = items.find((i) => i.tip === "duz" && i.text.includes("Kırmızı"));
    const band = Math.max(...grup.map((g) => g.bottom));
    const after = items.find((i) => tipEl && i.top > tipEl.top);
    const yatay = cerceve - tipEl.metinSag;
    const ustPay = tipEl.top - band;
    const altPay = after ? after.top - tipEl.bottom : null;
    const bayrak = (x) => (x !== null && x < 2 ? " <<< 0-1px" : x !== null && x < 4 ? " <- 2-3px" : "");
    console.log(
      `${String(n).padStart(3)}  ${String(tipEl.font).padStart(4)}  ` +
        `${String(band).padStart(4)} -> ${String(tipEl.top).padStart(4)} = ${String(ustPay).padStart(4)}${bayrak(ustPay)}  ` +
        `${String(tipEl.top).padStart(4)}-${String(tipEl.bottom).padStart(4)}  ` +
        `${after ? String(after.top).padStart(4) + " (" + after.text.slice(0, 14) + ")" : "-"} = ${String(altPay).padStart(4)}${bayrak(altPay)}  ` +
        `${String(yatay).padStart(4)}${bayrak(yatay)}`,
    );
  }
}

await browser.close();