/**
 * Poster onizleme bütunlugu - kan grubu metni overlay'e dogru yaziliyor mu?
 *
 * handleBloodGroupChange, secilen gruplari iki satira boler (bloodGroup1 /
 * bloodGroup2). Bu testler o bolunmenin ve sablonlarin etkilenmedigini dogrular.
 *
 * Calistirma: proje kokunde "npm run dev" acik olmali.
 */
import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";

import {
  BLOOD_GROUPS,
  REGARDLESS,
  launchApp,
  openDropdown,
  closeDropdown,
  pick,
  selectedGroups,
  posterBloodGroupLines,
} from "./helpers.mjs";

let browser;
let page;
let pageErrors = [];

before(async () => {
  ({ browser, page, pageErrors } = await launchApp());
});

after(async () => {
  await browser?.close();
  assert.deepEqual(pageErrors, [], "sayfada yakalanmamis hata olmamali");
});

describe("poster onizleme", () => {
  test("4 grup posterde 2+2 olarak iki satira bolunur", async () => {
    await page.reload({ waitUntil: "networkidle" });
    await openDropdown(page);
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);

    assert.deepEqual(await posterBloodGroupLines(page), [
      "A RH (+), A RH (-)",
      "B RH (+), B RH (-)",
    ]);
  });

  test("tek grup tek satira yazilir", async () => {
    await page.reload({ waitUntil: "networkidle" });
    await openDropdown(page);
    await pick(page, "0 RH (+)");

    assert.deepEqual(await posterBloodGroupLines(page), ["0 RH (+)"]);
  });

  test("REGARDLESS tek satira yazilir", async () => {
    await page.reload({ waitUntil: "networkidle" });
    await openDropdown(page);
    await pick(page, REGARDLESS);

    assert.deepEqual(await posterBloodGroupLines(page), [REGARDLESS]);
  });

  test("tum sablonlar kan grubu secimiyle hatasiz render olur", async () => {
    await page.reload({ waitUntil: "networkidle" });
    await openDropdown(page);
    await pick(page, "A RH (+)");
    await pick(page, "AB RH (-)");
    await closeDropdown(page);

    const selectors = await page.locator('[title^="Template "]').all();
    assert.equal(selectors.length, 6, "6 sablon secici bekleniyor");

    for (let i = 0; i < selectors.length; i++) {
      await selectors[i].click();
      await page.waitForTimeout(150);

      const lines = await posterBloodGroupLines(page);
      assert.deepEqual(
        lines,
        ["A RH (+)", "AB RH (-)"],
        `sablon ${i + 1} kan grubu satirini dogru gostermeli`,
      );
      assert.equal(await selectedGroups(page), "A RH (+), AB RH (-)");
    }
  });
});