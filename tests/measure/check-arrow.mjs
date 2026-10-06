/**
 * Form tamamlaninca "Galerine kaydet" yonlendirme oku belirmeli.
 *
 * Ok yalnizca validate() dogru dondugunde gorunur. validate() butona
 * basinca hata verip vermeyecegini soyleyen ayni kural; bu yuzden test
 * butonu gercekten basip hata modali cikiyor mu diye de kontrol eder.
 * Aksi halde ok gorunup buton hata verir, yani ipucu yalan soyler.
 *
 * Bu dosya ONCEDEN kendi Chromium cozumlemesini yaziyordu ve `force: true`
 * ile tiklama yapiyordu - `force` actionability kontrolunu atladigi icin
 * menu acilma animasyonunun ortasindaki kutuya tiklaniyor ve secim
 * kayboluyordu. Artik `helpers.mjs`i kullaniyor.
 */
import { launchApp, fillField, pickFrom, isSaveHintVisible } from "../e2e/helpers.mjs";

const { browser, page, pageErrors } = await launchApp();

const arrow = () => isSaveHintVisible(page);

console.log("adim | ok gorunur");
console.log("-----------------");

const steps = [
  ["basi", async () => {}],
  ["kan grubu", async () => pickFrom(page, "bloodGroup", "0 RH (+)")],
  ["kan tipi", async () => pickFrom(page, "bloodType", "Kırmızı Kan")],
  ["hasta adi", async () => fillField(page, "fullName", "Ali Veli")],
  ["telefon", async () => fillField(page, "phone", "05321234567")],
  ["hastane", async () => fillField(page, "hospital", "Ankara Hastanesi")],
  ["konum", async () => fillField(page, "location", "Çankaya")],
];

for (const [label, act] of steps) {
  await act();
  console.log(`${label.padEnd(11)} | ${(await arrow()) ? "evet" : "hayir"}`);
}

// Tarih alani muhtemelen date input; ayrica doldur.
const dateInput = page.locator('input[name="date"]').first();
if ((await dateInput.count()) > 0) {
  await dateInput.fill("2026-10-05");
  await page.waitForTimeout(200);
  console.log(`${"tarih".padEnd(11)} | ${(await arrow()) ? "evet" : "hayir"}`);
}

const done = await arrow();
console.log(`\n-> tum alanlar dolunca ok = ${done ? "gorunur" : "GORUNMUYOR"}`);

// Dogrulama: ok varken buton gercekten hata vermemeli.
await page.locator(".download-image-button").click();
await page.waitForTimeout(400);
const modal = await page.locator(".swal2-popup").count();
const errors = await page.locator("p.Mui-error, .Mui-error").count();
console.log(`-> butona basildi: uyari modali=${modal > 0 ? "var" : "yok"}, hata alani=${errors}`);

if (done && (modal > 0 || errors > 0)) {
  console.log("   !! SORUN: ok gorunuyor ama form yine eksik sayiliyor.");
} else if (done) {
  console.log("   -> tutarli: ok gorunuyor ve form butona basilinca gecerli.");
}

// Oku geri almak: bir alani bosalt.
await fillField(page, "location", "");
console.log(`\nkonum bosaltildi -> ok = ${(await arrow()) ? "hâlâ gorunuyor (HATA)" : "kayboldu (dogru)"}`);

console.log(`\nsayfa hatalari: ${pageErrors.length === 0 ? "yok" : JSON.stringify(pageErrors)}`);
await browser.close();