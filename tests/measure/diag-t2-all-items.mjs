/**
 * Template 2'de TUM metin kutularini olcuyoruz: 4 kan tipi secildiginde
 * `bloodType` SATIRA SARIYOR mu? Sariyorsa alt kenarı 165px'ten cok asagi
 * iner ve kan grubu bandini yalnizca yukari itmek yetmez.
 *
 * ONCEDEN BU DOSYA YANLIS ETIKETLIYORDU. Ogelere `.text-item` sirasindan
 * `NAMES[i]` ile isim veriyordu, ama `bloodGroup2` KOSULLU: tek grup
 * secildiginde hic cizilmiyor, dolayisiyla liste kayiyor ve `bloodType`
 * "bloodGroup2", `date` ise "phone" diye etiketleniyordu. Bu etiketleme
 * oturumda yanlis bir sonuca yol acti.
 *
 * Duzeltme: ogeler artik ICERIKLERIYLE bulunuyor, indisle degil.
 *   - `.text-item.blood-group`  -> kan grubu satirlari
 *   - `multiline`               -> hospital / location
 *   - duz `.text-item`           -> bloodType / fullName / phone / date;
 *     `bloodType` ham degeriyle ("Kırmızı"), `date` ise tarih metniyle
 *     taninir.
 */
import {
  launchApp,
  openDropdown,
  pick,
  BLOOD_GROUPS,
  fillLongBloodType,
  templateButtons,
} from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const buttons = await templateButtons(page);
await buttons[4].click(); // Template 2
await page.waitForTimeout(200);

const setGroups = async (groups) => {
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
  await page.waitForTimeout(250);
};

const dump = async (label) => {
  const frameH = await page.evaluate(
    () => Math.round(document.querySelector(".image-wrapper").getBoundingClientRect().height),
  );
  const rows = await page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wr = wrap.getBoundingClientRect();
    const measure = (el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const lh = parseFloat(cs.lineHeight);
      return {
        text: el.innerText.trim().slice(0, 42),
        font: cs.fontSize,
        top: Math.round(r.top - wr.top),
        bottom: Math.round(r.bottom - wr.top),
        right: Math.round(r.right - wr.left),
        lines: Number.isFinite(lh) ? Math.max(1, Math.round((r.height + 1) / lh)) : 1,
      };
    };

    // Kan grubu satirlari: sinif adi belli.
    const groupEls = [...wrap.querySelectorAll(".text-item.blood-group")].map(measure);

    // Duz ogeler: sinif adi blood-group/multiline olmayanlar.
    const plainEls = [...wrap.querySelectorAll(".text-item")].filter(
      (e) => !e.classList.contains("blood-group") && !e.classList.contains("multiline"),
    );
    const plain = plainEls.map(measure);

    const name = (m) => {
      if (m.text.includes("Kırmızı")) return "bloodType";
      // `date` "5 Ekim 2026" gibi; yil veya nokta iceren tek duz kutu.
      if (/\b\d{4}\b/.test(m.text)) return "date";
      if (/^\d[\d\s-]{9,}$/.test(m.text)) return "phone";
      return "diger";
    };

    return {
      groups: groupEls,
      plain: plain.map((m) => ({ ...m, ad: name(m) })),
      multi: [...wrap.querySelectorAll(".text-item.multiline")].map(measure),
    };
  });

  const all = [
    ...rows.groups.map((r) => ({ ...r, ad: "bloodGroup" })),
    ...rows.plain,
    ...rows.multi.map((r) => ({ ...r, ad: "coklu" })),
  ].filter((r) => r.text.length > 0);

  console.log(`\n--- ${label} (cerceve 360x${frameH}) ---`);
  console.log("ad           font    top  bottom  right  satir  metin");
  for (const r of all) {
    console.log(
      `${r.ad.padEnd(12)} ${r.font.padStart(5)}  ${String(r.top).padStart(4)}  ${String(r.bottom).padStart(5)}  ${String(r.right).padStart(5)}  ${String(r.lines).padStart(5)}  ${r.text}`,
    );
  }
  return all;
};

await setGroups(BLOOD_GROUPS.slice(0, 1));
await dump("1 grup, bloodType secili degil");

await fillLongBloodType(page);
await dump("1 grup, 4 kan tipi (EN KOTU)");

// Kan grubu bandini 64px fonta indirip sonucu olc (sayfada gecici, kaynak degismez).
await page.evaluate(() => {
  const el = [...document.querySelectorAll(".image-wrapper .text-item.blood-group")].find(
    (e) => e.innerText.trim().length > 0,
  );
  el.style.fontSize = "64px";
});
await page.waitForTimeout(150);
const fixed = await dump("1 grup + 64px font simule");

const bg = fixed.find((r) => r.ad === "bloodGroup");
const bt = fixed.find((r) => r.ad === "bloodType");
const dt = fixed.find((r) => r.ad === "date");

if (!bg || !bt) {
  console.log(`\n!! beklenen ogeler bulunamadi (bloodGroup=${!!bg} bloodType=${!!bt})`);
} else {
  console.log(
    `\n64px sonrasi: kanGrubu bottom=${bg.bottom} | bloodType top=${bt.top} bottom=${bt.bottom} ` +
      `satir=${bt.lines}` +
      (dt ? ` | date top=${dt.top}` : " | date yok"),
  );
  console.log(
    `paylar: kanGrubu->bloodType = ${bt.top - bg.bottom}px` +
      (dt ? `, bloodType->date (KUTU) = ${dt.top - bt.bottom}px` : ""),
  );
}

await browser.close();