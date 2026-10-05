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
  fillBloodTypes,
  measureBloodTypeBox,
  templateButtons,
} from "./helpers.mjs";

/**
 * Kan grubu metni birden fazla grup secildiginde posterde iki satira
 * bolunuyor. Bu test, satirlarin ust uste binmedigini, cerceve disina
 * tasmadigini ve tek satira sigmadigini OLCEYerek dogrular.
 *
 * Gozle kontrol bu araliklarda yetersiz. Sablonlarin kan grubu bandi
 * top + 3 * font kadar ve bloodType 4+ kan tipi secildiginde en yukari
 * konuma cekiliyor; o yuzden en kotu senaryo her zaman 4 grup degil,
 * DAHA YUKSEK font kullanan 2 grup halidir. Olcum iki satiri, kan
 * tipi sayisini ve cerceve tasmasini ayri ayi kontrol eder.
 */

const ALL = BLOOD_GROUPS.slice(0, 4);

// En genis tek grup metni. Sablonlar tek grup secildiginde bunu sola
// kaydirabiliyor (Template 2 `left` 47 -> 20), ve `BLOOD_GROUPS[0]`
// ("A RH (+)") daha dar oldugu icin o dal normal testlerde olculmuyor.
const WIDEST_SINGLE_GROUP = BLOOD_GROUPS.reduce((a, b) => (b.length > a.length ? b : a));

// Sablon butonlarinin DOM sirasi registry sirasiyla ayni: [T6,T3,T4,T5,T2,T1,T7]
// Yeni sablon registry'nin SONUNA ekleniyor; buradaki indeksler kaymaz.
const TEMPLATE_INDEX = { 1: 5, 2: 4, 3: 1, 4: 2, 5: 3, 6: 0, 7: 6 };

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

for (const templateId of [1, 2, 3, 4, 5, 6, 7]) {
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

    // bloodType, 4+ secenek secildiginde en yukari konuma cekilir. Bu
    // kontrol ONCEDEN sadece 4 grubu ve 2/3/4 gruplu satirlari olcuyordu.
    // 1 grup HICBIR ZAMAN olculmemisti; Template 2'de tek grup 78px
    // fontla 182px'e iniyor, bloodType ise 165px'te: 17px cakisma var
    // ve kimse fark etmiyordu. Artik 1 grup da olculuyor ve 64px'e
    // cekildi (bant 161px, 4px pay).
    //
    // 1 grup icin bant tek satirdir: top + 1.5 * font.
    // 2+ grup icin bant top + 3 * font.
    for (const [label, groups] of [
      ["1 grup", ALL.slice(0, 1)],
      ["2 grup", ALL.slice(0, 2)],
      ["3 grup", ALL.slice(0, 3)],
      ["4 grup", ALL],
    ]) {
      test(`uzun bloodType secildiginde ${label} kan gruplari bloodType ile cakismaz`, async () => {
        await selectTemplate(templateId);
        await setGroups(groups);
        await fillLongBloodType(page);

        const { lines } = await measurePosterBloodGroups(page);
        const lastLineBottom = Math.max(...lines.map((l) => l.bottom));

        const bloodTypeTop = await page.evaluate(() => {
          const wrap = document.querySelector(".image-wrapper");
          const wrapTop = wrap.getBoundingClientRect().top;
          const el = [...wrap.querySelectorAll(".text-item")].find(
            (e) =>
              !e.classList.contains("blood-group") &&
              !e.classList.contains("multiline") &&
              // Ham deger, ceviri metni DEGIL: `bloodType` Select'i
              // `renderValue` ile ham degerleri birlestirir, bu yuzden
              // ekranda her zaman "Kırmızı Kan" yazar. Ceviri metni
              // ("Kan") aramak Turkce olmayan arayuzde bloodType'i
              // bulamaz ve testi yerelestiren bir hataya cevirir.
              e.innerText.includes("Kırmızı"),
          );
          return el ? Math.round(el.getBoundingClientRect().top - wrapTop) : null;
        });

        assert.ok(bloodTypeTop !== null, `T${templateId}: bloodType bulunamadi.`);
        assert.ok(
          lastLineBottom <= bloodTypeTop,
          `T${templateId} / ${label}: kan grubu (${lastLineBottom}px) bloodType'in ` +
            `(${bloodTypeTop}px) ustune biniyor.`,
        );
      });
    }

    // Hicbir test 3 kan tipi secmiyordu: kan tipi sayisi ya bos (0) ya da
    // `fillLongBloodType` ile 4+ idi. 3 tip ayri bir durum - 4+ tipte
    // `bloodType` 15px'e kuculup yukselirken 3 tipte cogu sablonda 17px
    // kalir ve konumu DEGISMEDigi icin metin en uzun halinde oluyor.
    //
    // Bu bant `INK` olcumuyle kontrol ediliyor, kutuyla degil: `.text-item`
    // `line-height: 1.5` kullandigi icin kutu boslugu gorsel bosluk
    // degildir (4+ tipte kutu boslugu 0-1px cikiyor, gercek metin boslugu
    // 4-5px). Yatayda da kutu `right`i anlamsiz: shrink-to-fit oldugu icin
    // containing block'a kirpilip daima cerceve genisligine esit cikiyor.
    for (const typeCount of [3, 4]) {
      test(`${typeCount} kan tipi secildiginde bloodType cerceveyi tasirmaz ve altindaki metne binmez`, async () => {
        await selectTemplate(templateId);
        await setGroups(ALL.slice(0, 2));
        await fillBloodTypes(page, typeCount);

        const measured = await measureBloodTypeBox(page);
        assert.ok(measured !== null, `T${templateId}: bloodType bulunamadi.`);

        const { bloodType, below, frameWidth } = measured;

        // Yatay: GERCEK metin cerceve icinde kalmali.
        assert.ok(
          bloodType.inkRight <= frameWidth,
          `T${templateId} / ${typeCount} tip: bloodType metni cerceveyi tasiyor ` +
            `(metin ${bloodType.inkRight}px, cerceve ${frameWidth}px).`,
        );

        // Dikey: GERCEK metin, altindaki elemanin gercek metninin ustunde
        // kalmali. Kutu boslugu 0-1px olsa bile burasi gorsel bosluğu olcer.
        if (below !== null) {
          const inkGap = below.inkTop - bloodType.inkBottom;
          assert.ok(
            inkGap >= 0,
            `T${templateId} / ${typeCount} tip: bloodType metni ` +
              `("${below.text.slice(0, 20)}") ustune biniyor. ` +
              `bloodType ink alt ${bloodType.inkBottom}px, altindaki ink ust ${below.inkTop}px, ` +
              `fark ${inkGap}px.`,
          );
        }
      });
    }

    // Tek grup seceneklerinin hepsi ayni degildir: en genis metin "AB RH (+)"
    // ve sablonlar tek grupta bu metni sola kaydirabiliyor (Template 2
    // `left` 47 -> 20). Yukaridaki testler yalnizca `BLOOD_GROUPS[0]`
    // yani "A RH (+)" olctugu icin o dal HICBIR ZAMAN olculmedi.
    // Bu test en genis tek grubu olcer.
    test("en genis tek grup bloodType ile cakismaz ve cerceveyi tasirmaz", async () => {
      await selectTemplate(templateId);
      await setGroups([WIDEST_SINGLE_GROUP]);
      await fillLongBloodType(page);

      const measured = await measurePosterBloodGroups(page);
      assertGeometry(`T${templateId} / en genis tek grup`, measured);

      const { lines } = measured;
      assert.equal(
        lines[0].text,
        WIDEST_SINGLE_GROUP,
        `T${templateId}: "${WIDEST_SINGLE_GROUP}" secili olmaliydi, "${lines[0].text}" cizildi.`,
      );

      const bloodTypeTop = await page.evaluate(() => {
        const wrap = document.querySelector(".image-wrapper");
        const wrapTop = wrap.getBoundingClientRect().top;
        const el = [...wrap.querySelectorAll(".text-item")].find(
          (e) =>
            !e.classList.contains("blood-group") &&
            !e.classList.contains("multiline") &&
            e.innerText.includes("Kırmızı"),
        );
        return el ? Math.round(el.getBoundingClientRect().top - wrapTop) : null;
      });

      assert.ok(bloodTypeTop !== null, `T${templateId}: bloodType bulunamadi.`);
      const lastLineBottom = Math.max(...lines.map((l) => l.bottom));
      assert.ok(
        lastLineBottom <= bloodTypeTop,
        `T${templateId} / en genis tek grup: kan grubu (${lastLineBottom}px) ` +
          `bloodType'in (${bloodTypeTop}px) ustune biniyor.`,
      );
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