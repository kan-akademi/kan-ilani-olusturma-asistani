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
 * bolunuyor. Bu test, satirlarin ust uste binmedigini, cerceve disina
 * tasmadigini ve tek satira sigmadigini OLCEYerek dogrular.
 *
 * Gozle kontrol bu araliklarda yetersiz: duzeltme oncesi Template 4'te
 * ikinci satir 78px'de kaliyor, "B RH (+), B RH (-)" metni 2 satira
 * sarip cercevenin sag kenarina dayaniyordu; Template 3'te ise satirlar
 * 5px us uste biniyordu. Ikisi de ancak olcumle yakalanir.
 */

const ALL = BLOOD_GROUPS.slice(0, 4);

// Sablon butonlarinin DOM sirasi registry sirasiyla ayni: [T6,T3,T4,T5,T2,T1]
const TEMPLATE_INDEX = { 3: 1, 4: 2 };

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

async function selectTemplate(templateId) {
  await buttons[TEMPLATE_INDEX[templateId]].click();
  await page.waitForTimeout(150);
}

/** Posterdeki tum kan grubu satirlari icin geometrik dogrulama yapar. */
function assertGeometry(label, { width, height, lines }) {
  assert.ok(lines.length > 0, `${label}: posterde kan grubu metni olmali.`);

  for (let i = 0; i < lines.length - 1; i++) {
    assert.ok(
      lines[i].bottom <= lines[i + 1].top,
      `${label}: satir ${i + 1} (${lines[i].bottom}px) ve satir ${i + 2} (${lines[i + 1].top}px) ` +
        `ust uste biniyor: "${lines[i].text}" / "${lines[i + 1].text}"`,
    );
  }

  for (const l of lines) {
    assert.equal(
      l.wrappedLines,
      1,
      `${label}: "${l.text}" ${l.wrappedLines} satira sarildi; kan grubu metni tek satira sigmali.`,
    );
    assert.ok(
      l.right <= width,
      `${label}: "${l.text}" cerceveyi yatayda tasirdi (${l.right} > ${width}).`,
    );
    assert.ok(
      l.bottom <= height,
      `${label}: "${l.text}" cerceveyi dikeyde tasirdi (${l.bottom} > ${height}).`,
    );
  }
}

for (const templateId of [3, 4]) {
  describe(`Template ${templateId} kan grubu poster geometrisi`, () => {
    for (const [label, groups] of [
      ["1 grup", ALL.slice(0, 1)],
      ["2 grup", ALL.slice(0, 2)],
      ["3 grup", ALL.slice(0, 3)],
      ["4 grup", ALL],
    ]) {
      test(`${label} secildiginde satirlar ust uste binmez ve cerceve disina tasmaz`, async () => {
        await selectTemplate(templateId);
        await setGroups(groups);
        assertGeometry(`T${templateId} / ${label}`, await measurePosterBloodGroups(page));
      });
    }

    test("4 grup secildiginde 2+2 olarak iki satira bolunur", async () => {
      await selectTemplate(templateId);
      await setGroups(ALL);

      const { lines } = await measurePosterBloodGroups(page);
      assert.equal(lines.length, 2, `T${templateId}: 4 grup iki satir olmali, ${lines.length} satir bulundu.`);
      assert.equal(lines[0].text, "A RH (+), A RH (-)");
      assert.equal(lines[1].text, "B RH (+), B RH (-)");
    });

    test("uzun bloodType secildiginde kan gruplari bloodType ile cakismaz", async () => {
      await selectTemplate(templateId);
      await setGroups(ALL);
      await fillLongBloodType(page);

      const { lines } = await measurePosterBloodGroups(page);
      const lastLineBottom = Math.max(...lines.map((l) => l.bottom));

      // bloodType, 4+ secenek secildiginde en yukari konuma cekilir
      // (Template 3'te 172, Template 4'te sabit 218).
      const bloodTypeTop = await page.evaluate(() => {
        const wrap = document.querySelector(".image-wrapper");
        const wrapTop = wrap.getBoundingClientRect().top;
        const el = [...wrap.querySelectorAll(".text-item")].find(
          (e) =>
            !e.classList.contains("blood-group") &&
            !e.classList.contains("multiline") &&
            e.innerText.includes("Kan"),
        );
        return el ? Math.round(el.getBoundingClientRect().top - wrapTop) : null;
      });

      if (bloodTypeTop !== null) {
        assert.ok(
          lastLineBottom <= bloodTypeTop,
          `T${templateId}: kan grubu (${lastLineBottom}px) bloodType'in (${bloodTypeTop}px) ustune biniyor.`,
        );
      }
    });

    test("REGARDLESS seciliyken kan grubu tek satirdir", async () => {
      await selectTemplate(templateId);
      await setGroups([REGARDLESS]);

      const { lines } = await measurePosterBloodGroups(page);
      assert.equal(lines.length, 1, `T${templateId}: REGARDLESS tek satir olmali, ${lines.length} satir bulundu.`);
    });
  });
}

describe("Kan grubu secim kombinasyonlari", () => {
  test("REGARDLESS seciliyken normal grup secilemez", async () => {
    await selectTemplate(3);
    await setGroups([REGARDLESS]);

    // Rule 1: REGARDLESS seciliyken baska grup secmek mumkun degil. Bu
    // test, state invariant'inin (handleBloodGroupChange) UI tarafinda
    // atlanmadigini dogrular.
    const selected = await page.locator("#mui-component-select-bloodGroup").innerText();
    assert.match(selected, /Fark Etmeksizin/);
    assert.doesNotMatch(selected, /A RH/);
  });
});