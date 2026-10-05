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
  fillField,
  fillWholeForm,
  isModalOpen,
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

const reset = async () => {
  await page.reload({ waitUntil: "networkidle" });
};

describe("galeriye kaydet yonlendirmesi", () => {
  test("bos formda ok yoktur", async () => {
    await reset();
    assert.equal(await isSaveHintVisible(page), false);
  });

  test("eksik alan varken ok cikmaz", async () => {
    await reset();
    await fillWholeForm(page);
    assert.equal(await isSaveHintVisible(page), true);

    // Son alani bosalt: ok kaybolmali.
    await fillField(page, "location", "");
    assert.equal(await isSaveHintVisible(page), false, "eksik alan varken ok cikmamali");

    // Kan grubu bosaltmak da ayni sonucu vermeli.
    await fillField(page, "location", "Çankaya");
    assert.equal(await isSaveHintVisible(page), true);
  });

  test("tum alanlar dolunca ok gorunur", async () => {
    await reset();
    await fillWholeForm(page);
    assert.equal(await isSaveHintVisible(page), true);
  });

  test("ok varken buton hata vermez", async () => {
    await reset();
    await fillWholeForm(page);
    assert.equal(await isSaveHintVisible(page), true, "once okun gorunmesi gerekir");

    await page.locator(".download-image-button").click();
    await page.waitForTimeout(400);

    assert.equal(await isModalOpen(page), false, "ok varken uyari modali cikmamali");
  });

  test("ok indirme butonunun ustunde durur", async () => {
    await reset();
    await fillWholeForm(page);

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