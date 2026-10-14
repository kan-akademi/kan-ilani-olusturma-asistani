/**
 * Template secim daireleri - flexbox onlari yatayda ezmemeli.
 *
 * Kırılan degismez: `display: flex` satiri, sigmasi icin gereken genislik
 * bulunmadiginda cocuklari YALNIZCA yatayda kucultur (yukseklik sabittir).
 * Sonuc sessizce bir elips olur: 46x46 yazmakla 37.7x46 cizilir.
 *
 * 7 sablon 46px + 16px pay ile 418px gerektiriyordu, `.form` ise 360px.
 * Cozum: 36px daire (7*36 + 6*16 = 348px) + `flexShrink: 0`.
 * `flexShrink: 0` tek basina yetmez: tasma yaratirdi. Bu yuzden konteyner
 * `flexWrap: "wrap"` ile birlikte verildi - dar ekranda alt satira gecer,
 * daire daire kalir.
 *
 * Genislik, yukseklikle esitlenmedigi icin gozle fark edilmiyor; olcum
 * gerekiyor. Calistirma: proje kokunde "npm run dev" acik olmali.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";

import { launchApp, templateSelectorBoxes, expectedTemplateCount } from "./helpers.mjs";

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

describe("template secim daireleri", () => {
  test("her secici kare - yani daire, elips degil", async () => {
    const { boxes } = await templateSelectorBoxes(page);
    assert.equal(boxes.length, expectedTemplateCount());

    for (const b of boxes) {
      assert.ok(
        b.isSquare,
        `${b.title} elips olmus: ${b.width} x ${b.height} ` +
          `(fark ${Math.round((b.height - b.width) * 100) / 100}px). ` +
          `Flex satiri yatayda kucultuyor demektir; flexShrink: 0 gerekir.`,
      );
    }
  });

  test("hicbir secici esitlenmeden kucultulmus degil", async () => {
    const { boxes } = await templateSelectorBoxes(page);
    // flexShrink: 0 yoksa butunlar ayni oranda ezilir; sifir olmadiginin
    // kaniti computed styl'dan gelir.
    for (const b of boxes) {
      assert.equal(b.flexShrink, "0", `${b.title} flexShrink: 0 olmali`);
    }
  });

  test("form genisligi daraldiginda daireler daire kalir", async () => {
    // Sarmalı sayesinde dar ekranda alt satira gecmesi beklenir; kriter
    // "tek satirda kalması" degil, "elipse olmamasi".
    for (const width of [360, 320, 280, 240]) {
      await page.setViewportSize({ width, height: 1400 });
      await page.waitForTimeout(120);

      const { boxes } = await templateSelectorBoxes(page);
      assert.equal(boxes.length, expectedTemplateCount(), `${width}px'te butonlar kaybolmamali`);

      for (const b of boxes) {
        assert.ok(
          b.isSquare,
          `${width}px genişlikte ${b.title} elips oldu: ${b.width} x ${b.height}`,
        );
      }
    }
  });

  test("butunlar tek satirda sigiyor (form 360px)", async () => {
    await page.setViewportSize({ width: 420, height: 1400 });
    await page.waitForTimeout(120);

    const { boxes, containerWidth } = await templateSelectorBoxes(page);
    const needed = boxes[0].width * boxes.length + 16 * (boxes.length - 1);

    assert.ok(
      needed <= containerWidth,
      `tek satira sigmali: ${needed}px gerekir, konteyner ${containerWidth}px. ` +
        `Daire kucultulmeli ya da gap azaltilmalidi (sarmalı olsaydi gecerdi).`,
    );
  });
});