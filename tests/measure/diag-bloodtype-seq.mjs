/**
 * fillWholeForm sirasinda bloodType secimi neden kalici olarak kayboluyor?
 *
 * Onceki varsayim ("menu animasyonu") T E S T E D I L M E D I: zorunlu tik
 * kaldirildi, yine 4 denemede kayboluyor. Bu betik dogru tiklama aninda
 * sunucu durumunu okur: gercekten hangi noktaya tiklandi, o noktada ne
 * var, li secildi mi, kutular zaman icinde degisiyor mu.
 */
import { launchApp, waitForAppReady, selectValueDrawn } from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const ROUNDS = Number(process.env.ROUNDS ?? 40);

const state = (value, sel) =>
  page.evaluate(
    ({ v, selectName }) => {
      const boxes = [...document.querySelectorAll("ul[role=listbox]")];
      const li = document.querySelector(`ul[role=listbox] li[data-value="${v}"]`);
      const sEl = document.querySelector(`#mui-component-select-${selectName}`);
      const out = {
        listboxCount: boxes.length,
        listboxOwners: boxes.map((b) => b.closest("body") ? "portal" : "inline"),
        shown: JSON.stringify(sEl?.textContent),
        liFound: !!li,
      };
      if (li) {
        const r = li.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        out.box = `${Math.round(cx)},${Math.round(cy)} ${Math.round(r.width)}x${Math.round(r.height)}`;
        out.ariaSelected = li.getAttribute("aria-selected");
        out.ariaDisabled = li.getAttribute("aria-disabled");
        out.classes = li.className;
        out.checkedInputs = [...document.querySelectorAll('ul[role=listbox] input')].map(
          (i) => `${i.checked ? "[x]" : "[ ]"}${i.value}`,
        );
        out.hitTag = hit?.tagName ?? "(yok)";
        out.hitInLi = !!(hit && li.contains(hit));
        // Menu animasyonu: ayni kutu iki olcumde ayni mi?
        out.boxLater = (() => {
          const r2 = li.getBoundingClientRect();
          return `${Math.round(r2.left + r2.width / 2)},${Math.round(r2.top + r2.height / 2)} ${Math.round(r2.width)}x${Math.round(r2.height)}`;
        })();
      }
      return out;
    },
    { v: value, selectName: sel },
  );

let failures = 0;
// `round` for dongusunun `let` bloguyla sinirli oldugu icin dongu disinda
// erisilemez; ozet icin ayri sayac tutuluyor.
let completed = 0;
for (let round = 1; round <= ROUNDS; round++) {
  await page.reload({ waitUntil: "networkidle" });
  await waitForAppReady(page);

  // bloodGroup
  await page.locator("#mui-component-select-bloodGroup").click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
  await page.locator('ul[role=listbox] li[data-value="0 RH (+)"]').click();
  await selectValueDrawn(page, "bloodGroup", "0 RH (+)");
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });

  // bloodType
  const beforeOpen = await state("Kırmızı Kan", "bloodType");
  await page.locator("#mui-component-select-bloodType").click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
  const beforeClick = await state("Kırmızı Kan", "bloodType");

  let clickError = null;
  try {
    await page.locator('ul[role=listbox] li[data-value="Kırmızı Kan"]').click({ timeout: 4000 });
  } catch (e) {
    clickError = String(e).split("\n")[0];
  }

  await page.waitForTimeout(500);
  const afterClick = await state("Kırmızı Kan", "bloodType");

  const ok = (afterClick.shown ?? "").replace(/[\s-‍﻿]/g, "").includes("KırmızıKan");
  if (!ok) {
    failures++;
    console.log(`tur ${round}: KAYIP`);
    console.log("  acma ONCESI :", JSON.stringify(beforeOpen));
    console.log("  tik ONCESI  :", JSON.stringify(beforeClick));
    console.log("  tik SONRASI :", JSON.stringify(afterClick));
    console.log("  tik hatasi  :", clickError);
    if (failures >= 2) break;
  } else {
    console.log(`tur ${round}: OK`);
  }

  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 }).catch(() => {});
  completed++;
}

console.log(`\nkayip: ${failures}/${completed}`);
await browser.close();