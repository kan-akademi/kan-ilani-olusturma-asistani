/**
 * scan-fields.mjs'in BOS olmadigini kanitlar: ayni senaryoda kutularin
 * gercekten dolu oldugunu ve degerlerin sayfaya yazildigini gosterir.
 * "0 bulgu" ancak dolu kutular olctugunde anlamli.
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

const VERY_LONG_NAME = "Ayşe Nur Şahinoğlu-Öztürkçe";
const LONG_ADDRESS =
  "Atatürk Bulvarı No: 145/3, Çankaya, Ankara, Türkiye - posta kodu 06420, " +
  "kat 4, daire 12, otopark girişi arka tarafta, zil basmayınız lütfen";

for (const tid of ORDER) {
  await buttons[ORDER.indexOf(tid)].click();
  await page.waitForTimeout(200);

  await openDropdown(page);
  for (let i = 0; i < 8; i++) {
    const c = page.locator("li[data-value]:has(input:checked)");
    if ((await c.count()) === 0) break;
    await c.first().click();
    await page.waitForTimeout(60);
  }
  for (const g of BLOOD_GROUPS.slice(0, 2)) await pick(page, g);
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });

  await page.locator("#mui-component-select-bloodType").click();
  await page.waitForSelector("ul[role=listbox]");
  for (let i = 0; i < 6; i++) {
    const c = page.locator("ul[role=listbox] li[data-value]:has(input:checked)");
    if ((await c.count()) === 0) break;
    await c.first().click();
    await page.waitForTimeout(60);
  }
  for (const t of ["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma"]) {
    await page.locator(`ul[role=listbox] li[data-value="${t}"]`).click();
    await page.waitForTimeout(70);
  }
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });

  await fillField(page, "fullName", VERY_LONG_NAME);
  await fillField(page, "phone", "05321234567");
  await fillField(page, "hospital", "Ankara Numune Eğitim ve Araştırma Hastanesi");
  await fillField(page, "location", LONG_ADDRESS);
  await page.waitForTimeout(300);

  const dump = await page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const items = [...wrap.querySelectorAll(".text-item")]
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          text: el.innerText.trim(),
          top: Math.round(r.top - wr.top),
          bottom: Math.round(r.bottom - wr.top),
          right: Math.round(r.right - wr.left),
          w: Math.round(r.width),
        };
      })
      .filter((b) => b.text.length > 0);
    return { count: items.length, frameW: Math.round(wr.width), frameH: Math.round(wr.height), items };
  });

  const overlap = dump.items
    .slice()
    .sort((a, b) => a.top - b.top)
    .filter((b, i, arr) => i > 0 && b.top < arr[i - 1].bottom).length;

  console.log(`\nT${tid}: cerceve ${dump.frameW}x${dump.frameH}, ${dump.count} dolu kutu, cakisma ${overlap}`);
  for (const it of dump.items) {
    console.log(`   ${String(it.top).padStart(4)}-${String(it.bottom).padStart(4)}  sag ${String(it.right).padStart(4)}  "${it.text.slice(0, 52)}"`);
  }
  if (dump.count < 6) console.log("   !!! YETERSIZ KUTU - tarama bos olabilir");
}

await browser.close();
