/**
 * fillWholeForm'daki SIRAYLA iki secimi (once bloodGroup, sonra bloodType)
 * olcuyoruz. bloodType tek basina 15/15 basariliydi; yani sorun ikincinin
 * secilmesinde. Her adimda sunucu durumunu (listbox sayisi, tiklanan
 * ogemin uzerinde ne var, aria-disabled, pointer-events) yaziyoruz.
 */
import { launchApp, waitForAppReady, pickFrom } from "../e2e/helpers.mjs";

const { browser, page } = await launchApp();
const ROUNDS = Number(process.env.ROUNDS ?? 25);

const probe = (value) =>
  page.evaluate((v) => {
    const boxes = [...document.querySelectorAll("ul[role=listbox]")];
    const li = document.querySelector(`ul[role=listbox] li[data-value="${v}"]`);
    const selectEl = document.querySelector(`#mui-component-select-${v === "0 RH (+)" ? "bloodGroup" : "bloodType"}`);
    const sel = document.querySelector("#mui-component-select-bloodGroup");
    const selT = document.querySelector("#mui-component-select-bloodType");
    const out = {
      listboxCount: boxes.length,
      liFound: !!li,
      bg: JSON.stringify(sel?.textContent),
      bt: JSON.stringify(selT?.textContent),
    };
    if (li) {
      const r = li.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      out.liBox = `${Math.round(cx)},${Math.round(cy)} ${Math.round(r.width)}x${Math.round(r.height)}`;
      out.pointerEvents = getComputedStyle(li).pointerEvents;
      out.opacity = getComputedStyle(li).opacity;
      out.ariaDisabled = li.getAttribute("aria-disabled");
      out.hit = hit ? `${hit.tagName}.${hit.className?.toString().slice(0, 40)}` : "(yok)";
      out.hitInLi = !!(hit && li.contains(hit));
    }
    if (selectEl) {
      const r = selectEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      out.selBox = `${Math.round(cx)},${Math.round(cy)}`;
      out.selHitInSel = !!(hit && selectEl.contains(hit));
      out.selHit = hit ? `${hit.tagName}.${hit.className?.toString().slice(0, 40)}` : "(yok)";
    }
    return out;
  }, value);

const pick = async (selectName, value) => {
  await pickFrom(page, selectName, value);
  return { before: null, after: await probe(value) };
};

for (let round = 1; round <= ROUNDS; round++) {
  await page.reload({ waitUntil: "networkidle" });
  await waitForAppReady(page);

  const bg = await pick("bloodGroup", "0 RH (+)");
  const bt = await pick("bloodType", "Kırmızı Kan");

  const bgOk = JSON.parse(bg.after.bg).includes("0 RH");
  const btOk = JSON.parse(bt.after.bt).includes("Kırmızı");
  console.log(
    `tur ${String(round).padStart(2)}: bloodGroup=${bgOk ? "OK" : "KAYIP"} bloodType=${btOk ? "OK" : "KAYIP"}`,
  );

  if (!bgOk || !btOk) {
    console.log("  bloodGroup tik ONCESI:", JSON.stringify(bg.before));
    console.log("  bloodGroup tik SONRASI:", JSON.stringify(bg.after));
    console.log("  bloodType   tik ONCESI:", JSON.stringify(bt.before));
    console.log("  bloodType   tik SONRASI:", JSON.stringify(bt.after));
    break;
  }
}

await browser.close();