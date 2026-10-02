/**
 * Kan grubu secim kurallari - "Kan Grubu Fark Etmeksizin" ve 4 grup siniri.
 *
 * Kurallar:
 *  1) REGARDLESS seciliyse hicbir normal grup secilemez, REGARDLESS geri alinabilir.
 *  2) 4 normal grup seciliyse secilmemis olanlar ve REGARDLESS devre disi kalir.
 *  3) Sinirda dahi secili gruplar tiklanabilir kalir (degistirilebilsin).
 *  4) Devre disi seceneklere tiklamak hicbir seyi degistirmez.
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
  forcePick,
  selectedGroups,
  isDisabled,
  disabledGroups,
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
  assert.deepEqual(pageErrors, [], "sayfada yakalanmamis hata olmamali");
});

/** Her testten sonra secimi sifirlar. */
async function reset() {
  await closeDropdown(page);
  await page.reload({ waitUntil: "networkidle" });
  await openDropdown(page);
}

describe("kan grubu secim kurallari", () => {
  test("hicbir secim yokken tum secenekler aciktir", async () => {
    await reset();
    assert.deepEqual(await disabledGroups(page), []);
    assert.equal(await isDisabled(page, REGARDLESS), false);
  });

  test("REGARDLESS secilince normal gruplar kapanir", async () => {
    await reset();
    await pick(page, REGARDLESS);
    assert.equal(await selectedGroups(page), REGARDLESS);
    assert.equal((await disabledGroups(page)).length, BLOOD_GROUPS.length);
  });

  test("REGARDLESS seciliyken geri alinabilir", async () => {
    await reset();
    await pick(page, REGARDLESS);
    assert.equal((await disabledGroups(page)).length, BLOOD_GROUPS.length);
    assert.equal(await isDisabled(page, REGARDLESS), false, "geri almak icin tiklanabilir olmali");

    await pick(page, REGARDLESS); // geri al
    assert.equal(await selectedGroups(page), "");
    assert.deepEqual(await disabledGroups(page), []);
  });

  test("4 grup secilince kalanlar ve REGARDLESS kapanir", async () => {
    await reset();
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);
    assert.equal(await selectedGroups(page), BLOOD_GROUPS.slice(0, 4).join(", "));

    assert.deepEqual(await disabledGroups(page), BLOOD_GROUPS.slice(4));
    assert.equal(await isDisabled(page, REGARDLESS), true);
  });

  test("sinirda dahi secili gruplar tiklanabilir kalir", async () => {
    await reset();
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);

    // 4 secili grup devre disi OLAMAZ, aksi halde menue kilitlenir
    for (const g of BLOOD_GROUPS.slice(0, 4)) {
      assert.equal(await isDisabled(page, g), false, `${g} kaldirilabilir olmali`);
    }
  });

  test("devre disi seceneklere zorla tiklamak bir sey degistirmez", async () => {
    await reset();
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);
    const before = await selectedGroups(page);

    await forcePick(page, "AB RH (+)");
    assert.equal(await selectedGroups(page), before, "5. grup eklenmemeli");
    assert.equal(await isModalOpen(page), false, "uyari modali cikmamali");

    await forcePick(page, REGARDLESS);
    assert.equal(await selectedGroups(page), before, "4 secim silinmemeli");
  });

  test("sinirda grup degistirilebilir", async () => {
    await reset();
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);

    await pick(page, "B RH (-)"); // kaldir -> 3 kaldi
    assert.deepEqual(await disabledGroups(page), [], "3 grupta hepsi tekrar acilmali");
    assert.equal(await isDisabled(page, REGARDLESS), false);

    await pick(page, "0 RH (+)"); // baska bir grup ekle
    assert.equal(await selectedGroups(page), "A RH (+), A RH (-), B RH (+), 0 RH (+)");
  });

  test("4 grup doluyken REGARDLESS alinamaz, 3 gruptayken alinabilir", async () => {
    await reset();
    for (const g of BLOOD_GROUPS.slice(0, 4)) await pick(page, g);
    await forcePick(page, REGARDLESS);
    assert.notEqual(await selectedGroups(page), REGARDLESS);

    await pick(page, "A RH (-)"); // 3'e dus
    assert.equal(await isDisabled(page, REGARDLESS), false);
    await pick(page, REGARDLESS);
    assert.equal(await selectedGroups(page), REGARDLESS);
    assert.equal((await disabledGroups(page)).length, BLOOD_GROUPS.length);
  });
});