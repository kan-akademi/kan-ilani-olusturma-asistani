/**
 * Template 2, TEK kan grubu: en buyuk guvenli font boyutunu OLCE buluyor.
 *
 * Kaynak dosyayi her denemede degistirmek yerine ogenin font-size'ini
 * sayfada gecici olarak uyguluyoruz. Boylece (a) gercekten ne oldugunu
 * goruyoruz, (b) 78px'e kadar her adayi tek koşuda deneyebiliyoruz.
 *
 * Iki bloodType durumu olculuyor:
 *   - 1-3 kan tipi  -> bloodType top 176
 *   - 4+  kan tipi  -> bloodType top 165 (en kotu senaryo)
 */
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  fillLongBloodType,
  templateButtons,
  measurePosterBloodGroups,
} from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const buttons = await templateButtons(page);

// Template 2 registry'de 4. sira (index 4)
await buttons[4].click();
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

const readOne = async (label) => {
  const info = await page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wrapRect = wrap.getBoundingClientRect();
    const el = [...wrap.querySelectorAll(".text-item.blood-group")].find((e) =>
      e.innerText.trim().length > 0,
    );
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const find = (cls) => {
      const t = [...wrap.querySelectorAll(".text-item")].find((e) => e.classList.contains(cls));
      return t ? Math.round(t.getBoundingClientRect().top - wrapRect.top) : null;
    };
    const bloodTypeEl = [...wrap.querySelectorAll(".text-item")].find(
      (e) =>
        !e.classList.contains("blood-group") &&
        !e.classList.contains("multiline") &&
        e.innerText.includes("Kan"),
    );
    return {
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
      text: el.innerText.trim(),
      top: Math.round(r.top - wrapRect.top),
      bottom: Math.round(r.bottom - wrapRect.top),
      right: Math.round(r.right - wrapRect.left),
      frameW: Math.round(wrapRect.width),
      frameH: Math.round(wrapRect.height),
      bloodTypeTop: bloodTypeEl ? Math.round(bloodTypeEl.getBoundingClientRect().top - wrapRect.top) : null,
      dateTop: find("date"),
      phoneTop: find("phone"),
    };
  });
  console.log(`  [${label}] ${JSON.stringify(info)}`);
  return info;
};

// --- Mevcut hali (78px), iki bloodType durumu ---
await setGroups(BLOOD_GROUPS.slice(0, 1));
console.log("=== mevcut: 1 grup, kisa bloodType (<=3) ===");
const curShort = await readOne("kisa");

await fillLongBloodType(page);
console.log("=== mevcut: 1 grup, uzun bloodType (4+) ===");
const curLong = await readOne("uzun");

// --- Font adaylarini sayfada uygula ---
console.log("\n=== font adayi taramasi (uzun bloodType 165px taban) ===");
console.log("font  bottom  pay  sar  right/cerceve");
const rows = [];
for (const size of [78, 74, 72, 70, 68, 67, 66, 65, 64, 62, 60]) {
  const r = await page.evaluate((px) => {
    const wrap = document.querySelector(".image-wrapper");
    const wrapRect = wrap.getBoundingClientRect();
    const el = [...wrap.querySelectorAll(".text-item.blood-group")].find(
      (e) => e.innerText.trim().length > 0,
    );
    el.style.fontSize = `${px}px`;
    const rect = el.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(el).lineHeight);
    return {
      fontSize: getComputedStyle(el).fontSize,
      lineHeight: getComputedStyle(el).lineHeight,
      top: Math.round(rect.top - wrapRect.top),
      bottom: Math.round(rect.bottom - wrapRect.top),
      right: Math.round(rect.right - wrapRect.left),
      frameW: Math.round(wrapRect.width),
      wrapped: Number.isFinite(lh) ? Math.max(1, Math.round((rect.height + 1) / lh)) : 1,
    };
  }, size);
  const gap = curLong.bloodTypeTop - r.bottom;
  const fits = r.wrapped === 1 && r.right <= r.frameW;
  rows.push({ size, ...r, gap, fits });
  console.log(
    `${String(size).padStart(4)}  ${String(r.bottom).padStart(6)}  ${String(gap).padStart(4)}  ${String(r.wrapped).padStart(3)}  ${r.right}/${r.frameW}  ${fits ? "" : "<<< SARMADI/TASDI"}`,
  );
}

const safe = rows.filter((r) => r.gap >= 2 && r.fits).sort((a, b) => b.size - a.size)[0];
console.log(`\nen buyuk guvenli font (>=2px pay, tek satir, cerceve ici): ${safe ? safe.size + "px -> bottom " + safe.bottom + "px, pay " + safe.gap + "px" : "YOK"}`);

await browser.close();