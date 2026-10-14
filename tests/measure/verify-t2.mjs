/**
 * Template 2 tek grup: kaynak dosyadaki 64px degerinin GERCEK render
 * sonucunu olcer (inline simulasyon degil, uygulamanin kendi ciktilari).
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
  await page.waitForTimeout(300);
};

const read = () =>
  page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const bg = [...wrap.querySelectorAll(".text-item.blood-group")].find(
      (e) => e.innerText.trim().length > 0,
    );
    const bt = [...wrap.querySelectorAll(".text-item")].find(
      (e) =>
        !e.classList.contains("blood-group") &&
        !e.classList.contains("multiline") &&
        e.innerText.includes("Kırmızı"),
    );
    const r = bg.getBoundingClientRect();
    const rt = bt.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(bg).lineHeight);
    return {
      font: getComputedStyle(bg).fontSize,
      left: Math.round(r.left - wr.left),
      text: bg.innerText.trim(),
      top: Math.round(r.top - wr.top),
      bottom: Math.round(r.bottom - wr.top),
      right: Math.round(r.right - wr.left),
      frameW: Math.round(wr.width),
      lines: Number.isFinite(lh) ? Math.max(1, Math.round((r.height + 1) / lh)) : 1,
      typeFont: getComputedStyle(bt).fontSize,
      typeTop: Math.round(rt.top - wr.top),
      typeBottom: Math.round(rt.bottom - wr.top),
    };
  });

console.log("grup            font  left  top  bottom  right  sat  | bloodType  pay");
for (const g of BLOOD_GROUPS.slice(0, 4).concat(["AB RH (+)", "AB RH (-)", "0 RH (+)"])) {
  await setGroups([g]);
  await fillLongBloodType(page); // en kotu: 4+ kan tipi, bloodType 165px
  const r = await read();
  console.log(
    `${r.text.padEnd(14)} ${r.font.padStart(4)}  ${String(r.left).padStart(4)}  ${String(r.top).padStart(3)}  ${String(r.bottom).padStart(6)}  ${String(r.right).padStart(5)}  ${String(r.lines).padStart(3)}  | ${r.typeFont.padStart(6)} ${String(r.typeTop).padStart(3)}  ${String(r.typeTop - r.bottom).padStart(3)}`,
  );
}

// Kisa bloodType hali (1-3 kan tipi) icin en kotu grup.
await setGroups(["AB RH (+)"]);
await page.locator("#mui-component-select-bloodType").click();
await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
for (let i = 0; i < 6; i++) {
  const checked = page.locator("ul[role=listbox] li[data-value]:has(input:checked)");
  if ((await checked.count()) === 0) break;
  await checked.first().click();
  await page.waitForTimeout(60);
}
for (const t of ["Kırmızı Kan", "Trombosit", "Granülosit"]) {
  await page.locator(`ul[role=listbox] li[data-value="${t}"]`).click();
  await page.waitForTimeout(80);
}
await page.keyboard.press("Escape");
await page.waitForSelector("ul[role=listbox]", { state: "detached" });
await page.waitForTimeout(300);
const short = await read();
console.log(
  `\nkisa bloodType (3 tip): bloodType ${short.typeFont} top ${short.typeTop} bottom ${short.typeBottom}; ` +
    `kanGrubu bottom ${short.bottom} -> pay ${short.typeTop - short.bottom}px`,
);

await browser.close();