/**
 * Template 2'de bloodType'in GERCEK kutusu: 1-4 kan tipi icin.
 *
 * Soru: `bloodType` ne zaman satira sariyor ve alt kenari `date`'in
 * ustune biniyor mu? Kan grubu sayisindan bagimsiz mi?
 *
 * Ogelere indisle degil, ICERIKLERIYLE buluyoruz (indislemek yaniltici:
 * `bloodGroup2` kosullu oldugu icin liste kayiyor).
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
await buttons[4].click(); // Template 2
await page.waitForTimeout(200);

const setGroups = async (groups) => {
  await openDropdown(page);
  for (let i = 0; i < 8; i++) {
    const checked = page.locator("li[data-value]:has(input:checked)");
    if ((await checked.count()) === 0) break;
    await checked.first().click();
    await page.waitForTimeout(60);
  }
  for (const g of groups) await pick(page, g);
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });
  await page.waitForTimeout(200);
};

const setTypes = async (types) => {
  await page.locator("#mui-component-select-bloodType").click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
  for (let i = 0; i < 6; i++) {
    const checked = page.locator("ul[role=listbox] li[data-value]:has(input:checked)");
    if ((await checked.count()) === 0) break;
    await checked.first().click();
    await page.waitForTimeout(60);
  }
  for (const t of types) {
    await page.locator(`ul[role=listbox] li[data-value="${t}"]`).click();
    await page.waitForTimeout(80);
  }
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });
  await page.waitForTimeout(250);
};

const TYPES = ["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma"];

/** Tum olcum: kanGrubu satirlari, bloodType kutusu, date kutusu. */
const measure = (typeMarker) =>
  page.evaluate((marker) => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const all = [...wrap.querySelectorAll(".text-item")].map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const lh = parseFloat(cs.lineHeight);
      return {
        cls: el.className,
        text: el.innerText.trim(),
        font: parseFloat(cs.fontSize),
        top: Math.round(r.top - wr.top),
        bottom: Math.round(r.bottom - wr.top),
        right: Math.round(r.right - wr.left),
        lines: Number.isFinite(lh) ? Math.max(1, Math.round((r.height + 1) / lh)) : 1,
      };
    });

    const isType = (t) => t.cls.includes("blood-group") === false &&
      t.cls.includes("multiline") === false &&
      t.text.includes(marker);
    const groups = all.filter((t) => t.cls.includes("blood-group"));
    const typeEl = all.find(isType);
    // duz `.text-item` ki bloodType'tan sonra gelir.
    const plain = all.filter((t) => !t.cls.includes("blood-group") && !t.cls.includes("multiline"));
    const dateEl = plain.find((t) => t !== typeEl && t.text.length > 0 && t.top > (typeEl?.top ?? 0));

    return {
      frameW: Math.round(wr.width),
      frameH: Math.round(wr.height),
      groups: groups.map((g) => ({ text: g.text, font: g.font, top: g.top, bottom: g.bottom, lines: g.lines })),
      type: typeEl ? { font: typeEl.font, top: typeEl.top, bottom: typeEl.bottom, right: typeEl.right, lines: typeEl.lines, text: typeEl.text } : null,
      date: dateEl ? { top: dateEl.top, bottom: dateEl.bottom, text: dateEl.text } : null,
    };
  }, typeMarker);

const report = (label, m) => {
  const band = Math.max(...m.groups.map((g) => g.bottom));
  const t = m.type;
  const d = m.date;
  console.log(`\n### ${label}`);
  console.log(`  kanGrubu : ${m.groups.map((g) => `"${g.text}" ${g.font}px ${g.top}-${g.bottom} (${g.lines} satir)`).join(" | ")}`);
  console.log(`  band     : ${band}`);
  if (t) {
    console.log(`  bloodType: ${t.font}px ${t.top}-${t.bottom} (${t.lines} satir, right ${t.right}/${m.frameW})`);
    console.log(`  pay      : kanGrubu->bloodType = ${t.top - band}px ${t.top - band < 0 ? "  <<< CAKISMA" : ""}`);
    if (d) console.log(`  date     : ${d.top}-${d.bottom} ("${d.text}") -> bloodType pay = ${d.top - t.bottom}px ${d.top - t.bottom < 0 ? "  <<< CAKISMA" : ""}`);
  }
  return { band, type: t, date: d };
};

for (const groupCount of [1, 2, 4]) {
  await setGroups(BLOOD_GROUPS.slice(0, groupCount));
  for (const typeCount of [1, 2, 3, 4]) {
    await setTypes(TYPES.slice(0, typeCount));
    report(`${groupCount} grup / ${typeCount} kan tipi`, await measure("Kırmızı Kan"));
  }
}

await browser.close();