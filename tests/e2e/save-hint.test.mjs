/**
 * "Galerine kaydet" yonlendirme oku.
 *
 * Form tamamlaninca indirme butonunun ustunde kirmizi bir ok belirir.
 * Olcut `validate()` ile ayni: yani butona basildiginda hata verilmeyecegi
 * an. Test bunu ayrica dogrular - ok varken butona basilip uyari modali
 * cikmadigi teyit edilir. Aksi halde ok gorunup buton hata verir, yani
 * yonlendirme yalan soyler.
 *
 * Calistirma: proje kokunde "npm run dev" acik olmali.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";

import {
  launchApp,
  isSaveHintVisible,
  waitForSaveHint,
  waitForAppReady,
  fillField,
  fillWholeForm,
  isModalOpen,
  waitForModal,
  modalText,
  closeModal,
} from "./helpers.mjs";

let browser;
let page;
let pageErrors = [];

before(async () => {
  ({ browser, page, pageErrors } = await launchApp());
});

after(async () => {
  await browser?.close();
  assert.deepEqual(pageErrors, [], "sayfada yari calismamis kod olmamali");
});

// `reload` + `networkidle` tek basina yetmiyor: aglar durdu ama React'in
// ilk render'i bitmemis olabilir ve hemen yapilan `fill()` cagrilari
// kayboluyor. Indirme butonu ancak handler'lar baglandiktan sonra DOM'a
// girdigi icin onu bekliyoruz.
const reset = async () => {
  await page.reload({ waitUntil: "networkidle" });
  await waitForAppReady(page);
};

describe("galeriye kaydet yonlendirmesi", () => {
  test("bos formda ok yoktur", async () => {
    await reset();
    assert.equal(await isSaveHintVisible(page), false);
  });

  test("eksik alan varken ok cikmaz", async () => {
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);

    // Son alani bosalt: ok kaybolmali.
    await fillField(page, "location", "");
    await waitForSaveHint(page, false);

    // Konumu geri doldurunca ok geri gelmeli.
    await fillField(page, "location", "Çankaya");
    await waitForSaveHint(page, true);
  });

  test("kisa telefon oku gostermez", async () => {
    // Indirme yolu 11 karakterden kisa telefonu REDDEDIYOR; ok da ayni kurali
    // kullanmali. Once iki ayri kural vardi: ok yalnizca "alanlar dolu mu"
    // diye bakiyordu. Sonuc: 6 haneli telefon yazan kullanici oku goruyor,
    // butona basinca "gecersiz telefon" uyarisi aliyordu - ok yalan soyluyordu.
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);

    await fillField(page, "phone", "0532123");
    await waitForSaveHint(page, false);

    // Bunu gizlemek yanlis olurdu: buton gercekten engelliyor mu? Yoksa oku
    // kaldirmak yerine indirme kuralini gevsetmemiz gerekirdi.
    await page.locator(".download-image-button").click();
    await waitForModal(page);
    const modal = await modalText(page);

    assert.match(modal.icon, /warning/, "kisa telefon uyarisi vermeli");
    assert.ok(
      modal.body.length > 0,
      "kisa telefon icin gerekce dolu bir uyari govdesi olmali; " +
        `icon="${modal.icon}" title="${modal.title}" body="${modal.body}"`,
    );
    await closeModal(page);
  });

  test("tum alanlar dolunca ok gorunur", async () => {
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);
  });

  test("ok varken buton hata vermez", async () => {
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);

    await page.locator(".download-image-button").click();
    await page.waitForTimeout(400);

    assert.equal(await isModalOpen(page), false, "ok varken uyari modali cikmamali");
  });

  test("ok indirme butonunun ustunde durur", async () => {
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);

    const { hintBottom, buttonTop } = await page.evaluate(() => {
      const hint = document.querySelector(".save-gallery-hint");
      const button = document.querySelector(".download-image-button");
      return {
        hintBottom: hint.getBoundingClientRect().bottom,
        buttonTop: button.getBoundingClientRect().top,
      };
    });

    assert.ok(
      hintBottom <= buttonTop,
      `ok butonun ustunde olmali: ok alt kenar ${Math.round(hintBottom)}, ` +
        `buton ust kenar ${Math.round(buttonTop)}.`,
    );
  });

  test("ok aşağıyı gösterir", async () => {
    await reset();
    await fillWholeForm(page);
    await waitForSaveHint(page, true);

    // Okun gövdesi yukarıda, başı aşağıda olmalı: başın alt ucu gövdenin
    // alt ucundan büyükse aşağı bakıyor demektir.
    const [shaft, head] = await page.locator(".save-gallery-hint svg path").all();
    const shaftBottom = await shaft.evaluate((el) => el.getBBox().y + el.getBBox().height);
    const headBottom = await head.evaluate((el) => el.getBBox().y + el.getBBox().height);

    assert.ok(
      headBottom > shaftBottom,
      `ok aşağı bakmalı: gövde alt ucu ${shaftBottom}, baş alt ucu ${headBottom}`,
    );
  });
});