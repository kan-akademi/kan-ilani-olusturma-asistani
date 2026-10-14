/**
 * `fillWholeForm` neden bazen oku getirmiyor? Hangi alan bos kaliyor?
 *
 * Her turda formu doldurup DOM'dan GERCEK degerleri okuyoruz: iki Select'in
 * cizdigi metin ve dort text input'unun degeri. Sonra okun gorunup
 * gorunmedigini not ediyoruz. Tahmin etmek yerine olcum.
 */
import {
  launchApp,
  fillWholeForm,
  isSaveHintVisible,
  waitForAppReady,
  pickFrom,
  fillField,
} from "../e2e/helpers.mjs";

const { browser, page, pageErrors } = await launchApp();
const ROUNDS = Number(process.env.ROUNDS ?? 12);

const readState = () =>
  page.evaluate(() => {
    const val = (sel) => document.querySelector(sel)?.value ?? "(yok)";
    const txt = (sel) => document.querySelector(sel)?.textContent?.trim() ?? "(yok)";
    return {
      bloodGroup: JSON.stringify(txt("#mui-component-select-bloodGroup")),
      bloodType: JSON.stringify(txt("#mui-component-select-bloodType")),
      fullName: val('input[name="fullName"]'),
      phone: val('input[name="phone"]'),
      hospital: val('input[name="hospital"], textarea[name="hospital"]'),
      location: val('textarea[name="location"], input[name="location"]'),
    };
  });

const problems = {};

for (let round = 1; round <= ROUNDS; round++) {
  await page.reload({ waitUntil: "networkidle" });
  await waitForAppReady(page);
  await fillWholeForm(page);
  await page.waitForTimeout(400);

  const arrow = await isSaveHintVisible(page);
  const s = await readState();

  const empty = Object.entries(s)
    .filter(([, v]) => v === "" || v === "(yok)")
    .map(([k]) => k);

  const label = arrow ? "ok" : `OK YOK${empty.length ? ` (bos: ${empty.join(", ")})` : " (bos alan yok!)"}`;
  const key = `${label} | bg="${s.bloodGroup}" bt="${s.bloodType}" ad="${s.fullName}" tel="${s.phone}" has="${s.hospital}" kon="${s.location}"`;
  problems[key] = (problems[key] ?? 0) + 1;

  console.log(`tur ${String(round).padStart(2)}: ${label}`);
}

console.log("\n===== benzersiz durumlar =====");
for (const [k, v] of Object.entries(problems).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${v} x  ${k}`);
}

console.log(`\nsayfa hatalari: ${pageErrors.length}`);
await browser.close();