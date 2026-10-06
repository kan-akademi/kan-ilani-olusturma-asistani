/**
 * Template 2, TEK grup: en geniss metin olan "AB RH (+)" icin font taramasi.
 *
 * Onemli: 1 gruplu AB dalinda `coord.left` 47 yerine 20 oluyor
 * (Template2Component.tsx:59-60) ve "AB RH (+)" en genis tek grup metni.
 * Mevcut geometri testleri yalnizca `BLOOD_GROUPS[0]` yani "A RH (+)"
 * olctugu icin bu dal hic olculmedi.
 *
 * Iki kan tipi durumu da olculuyor (short: top 176 / long: top 165).
 */
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  fillLongBloodType,
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
  await page.waitForTimeout(250);
};

const probe = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const el = [...wrap.querySelectorAll(".text-item.blood-group")].find(
      (e) => e.innerText.trim().length > 0,
    );
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const lh = parseFloat(cs.lineHeight);
    const typeEl = [...wrap.querySelectorAll(".text-item")].find(
      (e) =>
        !e.classList.contains("blood-group") &&
        !e.classList.contains("multiline") &&
        e.innerText.includes("Kırmızı"),
    );
    return {
      font: parseFloat(cs.fontSize),
      left: Math.round(r.left - wr.left),
      text: el.innerText.trim(),
      top: Math.round(r.top - wr.top),
      bottom: Math.round(r.bottom - wr.top),
      right: Math.round(r.right - wr.left),
      frameW: Math.round(wr.width),
      lines: Number.isFinite(lh) ? Math.max(1, Math.round((r.height + 1) / lh)) : 1,
      typeTop: typeEl ? Math.round(typeEl.getBoundingClientRect().top - wr.top) : null,
      typeRight: typeEl ? Math.round(typeEl.getBoundingClientRect().right - wr.left) : null,
    };
  });

const clearInline = () =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll(".text-item")) el.style.removeProperty("font-size");
  });

for (const group of ["A RH (+)", "AB RH (+)", "0 RH (+)"]) {
  await setGroups([group]);

  // Uzun bloodType (en kotu): 4 kan tipi
  await fillLongBloodType(page);
  const baseLong = await probe();
  console.log(
    `\n### "${group}"  (left=${baseLong.left}, bloodType top=${baseLong.typeTop})` +
      ` -- mevcut ${baseLong.font}px -> bottom ${baseLong.bottom}, pay ${baseLong.typeTop - baseLong.bottom}`,
  );
  console.log("  font  left  bottom  pay  sag/satir  cerceve  uygun");

  for (const size of [78, 74, 72, 70, 68, 66, 65, 64, 62, 60, 58, 56]) {
    await page.evaluate((px) => {
      const el = [...document.querySelectorAll(".image-wrapper .text-item.blood-group")].find(
        (e) => e.innerText.trim().length > 0,
      );
      el.style.fontSize = `${px}px`;
    }, size);
    const r = await probe();
    const gap = r.typeTop - r.bottom;
    const ok = gap >= 2 && r.lines === 1 && r.right <= r.frameW;
    console.log(
      `${String(size).padStart(5)}  ${String(r.left).padStart(4)}  ${String(r.bottom).padStart(6)}  ${String(gap).padStart(3)}  ${String(r.right).padStart(3)}/${r.lines}  ${String(r.frameW).padStart(7)}  ${ok ? "evet" : "HAYIR"}`,
    );
  }
  await clearInline();
}

await browser.close();