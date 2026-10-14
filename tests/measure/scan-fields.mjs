/**
 * Kan grubu/kan tipi disi dallar: `fullName` (>=25, >=35 karakter) ve
 * `location` (>=240 / >=260 karakter) dallari hicbir test tarafindan
 * doldurulmuyor. Bu betik onlari da DOLDURUP olcer.
 *
 * Alanlara en uzun kabul edilen degerler yaziliyor; ama yine de sarma ve
 * bindirme OLCULUYORUZ, varsaymiyoruz.
 */
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  fillField,
  templateButtons,
} from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const buttons = await templateButtons(page);
const ORDER = [6, 3, 4, 5, 2, 1, 7];

// Alan sinirlari: fullName maxLength 39. Konum serbest.
const LONG_NAME = "Ahmet Mehmet Yılmaz-Karadeniz";          // 27 karakter
const VERY_LONG_NAME = "Ayşe Nur Şahinoğlu-Öztürkçe";     // 28 karakter
const HOSPITAL = "Ankara Numune Eğitim ve Araştırma Hastanesi";
const LONG_ADDRESS =
  "Atatürk Bulvarı No: 145/3, Çankaya, Ankara, Türkiye - posta kodu 06420, " +
  "kat 4, daire 12, otopark girişi arka tarafta, zil basmayınız lütfen";

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
            left: Math.round(r.left - wr.left),
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

  for (const [scenario, groupCount, typeCount, name] of [
    ["en uzun ad + en uzun adres", 2, 4, VERY_LONG_NAME],
    ["orta ad + en uzun adres", 2, 4, LONG_NAME],
    ["kisa ad + kisa adres", 2, 4, "Ali Veli"],
    ["tek grup + 4 tip + uzun ad", 1, 4, VERY_LONG_NAME],
  ]) {
    await setGroups(BLOOD_GROUPS.slice(0, groupCount));
    await setTypes(["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma"].slice(0, typeCount));
    await fillField(page, "fullName", name);
    await fillField(page, "phone", "05321234567");
    await fillField(page, "hospital", HOSPITAL);
    await fillField(page, "location", LONG_ADDRESS);
    await page.waitForTimeout(300);

    const { items, frameW, frameH } = await boxes();
    const sorted = [...items].sort((a, b) => a.top - b.top);

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (a.bottom > b.top) {
        problems.push({
          tpl: tid,
          s: scenario,
          tur: "Dikey bindirme",
          ust: `"${a.text.slice(0, 30)}" ${a.font}px ${a.top}-${a.bottom}`,
          alt: `"${b.text.slice(0, 30)}" ${b.font}px ${b.top}-${b.bottom}`,
          pay: b.top - a.bottom,
        });
      }
    }
    for (const it of items) {
      if (it.right > frameW) {
        problems.push({
          tpl: tid,
          s: scenario,
          tur: "Yatay tasma",
          ust: `"${it.text.slice(0, 30)}" ${it.font}px right=${it.right}`,
          alt: `cerceve ${frameW}`,
          pay: it.right - frameW,
        });
      }
      if (it.bottom > frameH) {
        problems.push({
          tpl: tid,
          s: scenario,
          tur: "Dikey cerceve tasmasi",
          ust: `"${it.text.slice(0, 30)}" bottom=${it.bottom}`,
          alt: `cerceve ${frameH}`,
          pay: it.bottom - frameH,
        });
      }
    }
  }
  console.log(`T${tid} tarandi`);
}

console.log(`\n===== TOPLAM ${problems.length} bulgu =====`);
for (const p of problems) {
  console.log(`\nT${p.tpl} | ${p.s} | ${p.tur}\n  ust : ${p.ust}\n  alt : ${p.alt}\n  fark: ${p.pay}px`);
}

await browser.close();