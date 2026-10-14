/**
 * HICBIR sey varsaymayan tarama: 7 sablon x 0-5 kan tipi icin TUM
 * `.text-item` kutularini olcer ve Dikeyde ust uste binen her cifti
 * raporlar.
 *
 * Neden: testler kan tipi sayisini yalnizca 0 (bos) ve 4+ (fillLongBloodType)
 * olarak deniyor. Template 5'te ise tam 3 tip icin ayri bir dal var
 * (`bloodType.length > 2`: top config'de kalir, font 15 olur) ve hicbir
 * test o dala girmiyor.
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

// Registry sirasi: [T6, T3, T4, T5, T2, T1, T7]
const ORDER = [6, 3, 4, 5, 2, 1, 7];
const TYPES = ["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma", "Kök Hücre"];

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
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
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

const boxes = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    return {
      frameW: Math.round(wr.width),
      frameH: Math.round(wr.height),
      items: [...wrap.querySelectorAll(".text-item")]
        .map((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          const lh = parseFloat(cs.lineHeight);
          return {
            kind: el.className.includes("blood-group")
              ? "grup"
              : el.className.includes("multiline")
                ? "coklu"
                : "duz",
            text: el.innerText.trim(),
            font: parseFloat(cs.fontSize),
            top: Math.round(r.top - wr.top),
            bottom: Math.round(r.bottom - wr.top),
            right: Math.round(r.right - wr.left),
            lines: Number.isFinite(lh) ? Math.max(1, Math.round((r.height + 1) / lh)) : 1,
          };
        })
        .filter((b) => b.text.length > 0),
    };
  });

const problems = [];

for (const tid of ORDER) {
  await buttons[ORDER.indexOf(tid)].click();
  await page.waitForTimeout(200);

  for (const groupCount of [1, 2]) {
    await setGroups(BLOOD_GROUPS.slice(0, groupCount));
    for (let n = 0; n <= TYPES.length; n++) {
      await setTypes(TYPES.slice(0, n));
      const { items, frameW } = await boxes();
      const sorted = [...items].sort((a, b) => a.top - b.top);

      // 1) Dikey bindirme
      for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        if (a.bottom > b.top) {
          problems.push({
            tpl: tid,
            senaryo: `${groupCount} grup / ${n} tip`,
            tur: "Dikey bindirme",
            a: `"${a.text.slice(0, 26)}" ${a.font}px ${a.top}-${a.bottom}`,
            b: `"${b.text.slice(0, 26)}" ${b.font}px ${b.top}-${b.bottom}`,
            pay: b.top - a.bottom,
          });
        }
      }
      // 2) Cerceve disi tasma
      for (const it of items) {
        if (it.right > frameW) {
          problems.push({
            tpl: tid,
            senaryo: `${groupCount} grup / ${n} tip`,
            tur: "Yatay tasma",
            a: `"${it.text.slice(0, 26)}" ${it.font}px right=${it.right}`,
            b: `cerceve ${frameW}`,
            pay: it.right - frameW,
          });
        }
      }
      // 3) Satira sarma (kan grubu metni hicbir zaman sarilmamali)
      for (const it of items) {
        if (it.kind === "grup" && it.lines > 1) {
          problems.push({
            tpl: tid,
            senaryo: `${groupCount} grup / ${n} tip`,
            tur: "Kan grubu sarmasi",
            a: `"${it.text.slice(0, 26)}" ${it.font}px ${it.lines} satir`,
            b: "",
            pay: 0,
          });
        }
      }
    }
  }
  console.log(`T${tid} tarandi`);
}

console.log(`\n===== TOPLAM ${problems.length} bulgu =====`);
for (const p of problems) {
  console.log(
    `\nT${p.tpl} | ${p.senaryo} | ${p.tur}\n  ust : ${p.a}\n  alt : ${p.b}\n  fark: ${p.pay}px`,
  );
}

await browser.close();