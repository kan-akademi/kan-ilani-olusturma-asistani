import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  REGARDLESS,
  measurePosterBloodGroups,
  fillLongBloodType,
  templateButtons,
} from "./helpers.mjs";

/**
 * Kan grubu metni birden fazla grup secildiginde posterde iki satira
 * bolunuyor. Bu test, satirlarin ust uste binmedigini ve cerceve disina
 * tasmadigini OLCEYerek dogrular. Gozle bakmak bu kadar yakin degerlerde
 * (birbirine 3px pay kalan yerler var) yetersiz kalir.
 *
 * Template 3 bu seriden calistigi icin asagidaki 3 grup senaryosu, daha
 * once 5px us uste binen durumu yakalardi.
 */

const ALL = BLOOD_GROUPS.slice(0, 4);

let browser;
let page;
let pageErrors;
let buttons;

before(async () => {
  ({ browser, page, pageErrors } = await launchApp());
  buttons = await templateButtons(page);
});

after(async () => {
  await browser?.close();
  assert.deepEqual(pageErrors, [], "Sayfada yakalanmamis hata olmamali.");
});

/** Secim listesini tamamen bosaltip verilen gruplari secer. */
async function setGroups(groups) {
  await openDropdown(page);
  for (let i = 0; i < 8; i++) {
    const checked = page.locator("li[data-value]:has(input:checked)");
    if ((await checked.count()) === 0) break;
    await checked.first().click();
    await page.waitForTimeout(60);
  }
  for (const g of groups) await pick(page, g);
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached" });
  await page.waitForTimeout(150);
}

describe("Template 3 kan grubu poster geometrisi", () => {
  for (const [label, groups] of [
    ["1 grup", ALL.slice(0, 1)],
    ["2 grup", ALL.slice(0, 2)],
    ["3 grup", ALL.slice(0, 3)],
    ["4 grup", ALL],
  ]) {
    test(`${label} secildiginde satirlar ust uste binmez`, async () => {
      await buttons[1].click(); // registry sirasi: [T6, T3, T4, T5, T2, T1]
      await page.waitForTimeout(150);
      await setGroups(groups);

      const { lines } = await measurePosterBloodGroups(page);
      assert.ok(lines.length > 0, "Posterde kan grubu metni olmali.");

      for (let i = 0; i < lines.length - 1; i++) {
        assert.ok(
          lines[i].bottom <= lines[i + 1].top,
          `Satir ${i + 1} (${lines[i].bottom}px) ve satir ${i + 2} (${lines[i + 1].top}px) ` +
            `ust uste biniyor: ${lines[i].text} / ${lines[i + 1].text}`,
        );
      }
    });
  }

  test("4 grup secildiginde iki satira bolunur", async () => {
    await buttons[1].click();
    await page.waitForTimeout(150);
    await setGroups(ALL);

    const { lines } = await measurePosterBloodGroups(page);
    assert.equal(lines.length, 2, `4 grup iki satir olmali, ${lines.length} satir bulundu.`);
    // 2 + 2 bolunus beklenir.
    assert.equal(lines[0].text, "A RH (+), A RH (-)");
    assert.equal(lines[1].text, "B RH (+), B RH (-)");
  });

  test("uzun bloodType secildiginde kan gruplari bloodType ile cakismaz", async () => {
    await buttons[1].click();
    await page.waitForTimeout(150);
    await setGroups(ALL.slice(0, 2));
    await fillLongBloodType(page);

    const { lines } = await measurePosterBloodGroups(page);
    const lastLineBottom = Math.max(...lines.map((l) => l.bottom));

    // bloodType, 4+ secenek secildiginde en yukari konuma (172px) cekilir.
    const bloodTypeTop = await page.evaluate(() => {
      const wrap = document.querySelector(".image-wrapper");
      const wrapTop = wrap.getBoundingClientRect().top;
      const el = [...wrap.querySelectorAll(".text-item")].find(
        (e) => !e.classList.contains("blood-group") && !e.classList.contains("multiline") && e.innerText.includes("Kan"),
      );
      if (!el) return null;
      return Math.round(el.getBoundingClientRect().top - wrapTop);
    });

    if (bloodTypeTop !== null) {
      assert.ok(
        lastLineBottom <= bloodTypeTop,
        `Kan grubu (${lastLineBottom}px) bloodType'in (${bloodTypeTop}px) ustune biniyor.`,
      );
    }
  });

  test("REGARDLESS seciliyken kan grubu tek satirdir", async () => {
    await buttons[1].click();
    await page.waitForTimeout(150);
    await setGroups([REGARDLESS]);

    const { lines } = await measurePosterBloodGroups(page);
    assert.equal(lines.length, 1, `REGARDLESS tek satir olmali, ${lines.length} satir bulundu.`);
  });
});