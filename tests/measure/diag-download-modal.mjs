/**
 * Save-hint testindeki titizligin gercek nedenini tespit eder:
 * "ok varken buton hata vermez" arada sira duser. Diyelim ki indirme
 * butonuna basinca .swal2-popup gorunuyor. HANGI modal oldugunu (uyari
 * mi, export hatasi mi) ve konsol/hata ciktisini yazdirir.
 *
 * Bu dosya ONCEDEN kendi Chromium cozumlemesini yaziyordu ve `force: true`
 * ile tiklama yapiyordu. `force`, Playwright'in actionability kontrolunu
 * atladigi icin tiklama menu acilma animasyonunun ortasindaki kutuya duser
 * ve secim KAYBOLUR - kayan `save-hint` testlerinin kok nedeni buydu. Artik
 * `helpers.mjs`i kullaniyor: `pickFrom` secimin cizildigini dogrulayip
 * tekrar dener, `fillField` yazilan degerin yapistigini dogrular.
 */
import {
  APP_URL,
  launchApp,
  fillField,
  pickFrom,
  waitForSaveHint,
  isSaveHintVisible,
} from "../e2e/helpers.mjs";

const ROUNDS = Number(process.env.ROUNDS ?? 8);

const { browser } = await launchApp();
const counts = {};

for (let round = 1; round <= ROUNDS; round++) {
  const page = await browser.newPage({ viewport: { width: 420, height: 1400 } });
  const logs = [];
  page.on("console", (m) => {
    if (m.type() === "error") logs.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));

  await page.goto(APP_URL, { waitUntil: "networkidle" });
  await page.locator(".download-image-button").waitFor({ state: "visible", timeout: 15000 });

  // Formu doldur
  await pickFrom(page, "bloodGroup", "0 RH (+)");
  await pickFrom(page, "bloodType", "Kırmızı Kan");
  await fillField(page, "fullName", "Ali Veli");
  await fillField(page, "phone", "05321234567");
  await fillField(page, "hospital", "Ankara Hastanesi");
  await fillField(page, "location", "Çankaya");

  // Ok gorunene kadar bekle. `waitForSaveHint` dogru duruma gelmezse
  // HATA FIRLATIR ve deger dondurmez; bu yuzden `arrow` ayrica
  // `isSaveHintVisible` ile okunur.
  await waitForSaveHint(page, true);
  const arrow = await isSaveHintVisible(page);

  // Telefonun gercek degerini ve uzunlugunu kaydet: ikinci dogrulama
  // yolu 11 karakterden kisa telefonu reddediyor.
  const phoneValue = await page.locator('input[name="phone"]').inputValue();

  await page.locator(".download-image-button").click();
  await page.waitForTimeout(1500);

  const modal = await page.evaluate(() => {
    const popup = document.querySelector(".swal2-popup");
    if (!popup) return null;
    return {
      classes: [...popup.classList].filter((c) => c.startsWith("swal2-icon-")),
      html: popup.querySelector(".swal2-html-container")?.innerText?.trim() ?? "",
    };
  });

  const key = modal
    ? `MODAL ${modal.classes.join(",") || "(sinifsiz)"} :: ${modal.html.slice(0, 45)}`
    : "modal yok";
  counts[key] = (counts[key] ?? 0) + 1;

  console.log(
    `tur ${round}: ok=${arrow}  telefon="${phoneValue}" (${phoneValue.length} karakter)  ${key}` +
      (logs.length ? `\n         ${logs.join("\n         ")}` : ""),
  );
  await page.close();
}

console.log("\n===== ozet =====");
for (const [k, v] of Object.entries(counts)) console.log(`  ${v} x  ${k}`);

await browser.close();