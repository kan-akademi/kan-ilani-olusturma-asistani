/**
 * bloodType secimi neden kayboluyor? Tiklamanin GERCEKTEN `li` uzerine
 * dusup dusmedigini olcuyoruz.
 *
 * `force: true` Playwright'in "eylem uygunluk" kontrollerini atlar: gorunurluk,
 * kararlilik (animasyon bitmis mi) ve "olay alan bu ogemi mi?" kontrolu.
 * Atlandiginda tik, ogenin O ANKI kutusundaki merkezine gider. Menu
 * animasyonla girerken oge yerinden oynuyorsa tik yanlis yere duser ve
 * secim kaybolur. Her denemede ayni seye dusmesi bu hipotezi test eder.
 */
import { launchApp, waitForAppReady, isSaveHintVisible } from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const ROUNDS = Number(process.env.ROUNDS ?? 15);

for (let round = 1; round <= ROUNDS; round++) {
  await page.reload({ waitUntil: "networkidle" });
  await waitForAppReady(page);

  await page.locator("#mui-component-select-bloodType").click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });

  const before = await page.evaluate(() => {
    const li = document.querySelector('ul[role=listbox] li[data-value="Kırmızı Kan"]');
    if (!li) return { error: "li bulunamadi" };
    const r = li.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(cx, cy);
    const cs = getComputedStyle(li);
    return {
      listboxes: document.querySelectorAll("ul[role=listbox]").length,
      box: { x: Math.round(cx), y: Math.round(cy), w: Math.round(r.width), h: Math.round(r.height) },
      pointerEvents: cs.pointerEvents,
      ariaDisabled: li.getAttribute("aria-disabled"),
      hasInput: !!li.querySelector("input"),
      hitTag: hit?.tagName ?? "(yok)",
      hitDataValue: hit?.closest("li")?.getAttribute("data-value") ?? "(li degil)",
      isDescendant: !!(hit && li.contains(hit)),
      label: li.textContent.trim(),
    };
  });

  await page.locator('ul[role=listbox] li[data-value="Kırmızı Kan"]').click({ force: true });
  await page.waitForTimeout(500);

  const after = await page.evaluate(() => ({
    listboxes: document.querySelectorAll("ul[role=listbox]").length,
    shown: JSON.stringify(document.querySelector("#mui-component-select-bloodType").textContent),
    checked: [...document.querySelectorAll('ul[role=listbox] li[data-value] input:checked')].map((i) =>
      i.closest("li").getAttribute("data-value"),
    ),
  }));

  const selected = after.checked.includes("Kırmızı Kan");
  const line = `tur ${String(round).padStart(2)}: ${selected ? "SECILDI" : "KAYBOLDU"} | shown=${after.shown} checked=[${after.checked}]`;
  console.log(line);

  if (!selected) {
    console.log("   tik ONCESI:", JSON.stringify(before));
    console.log("   tik SONRASI:", JSON.stringify(after));
  }

  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 }).catch(() => {});
}

console.log(`\nkayip sayisi: ${(await isSaveHintVisible(page)) ? "?" : "?"}`);
await browser.close();