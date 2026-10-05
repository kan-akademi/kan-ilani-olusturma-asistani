import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { chromium } from "playwright-core";

export const APP_URL = process.env.APP_URL ?? "http://localhost:5173";

/** MenuItem value'larinin DOM'daki gercek degeri - her dilde ayni sabit. */
export const REGARDLESS = "Kan Grubu Fark Etmeksizin";
export const BLOOD_GROUPS = [
  "A RH (+)",
  "A RH (-)",
  "B RH (+)",
  "B RH (-)",
  "AB RH (+)",
  "AB RH (-)",
  "0 RH (+)",
  "0 RH (-)",
];

export const SELECT = "#mui-component-select-bloodGroup";
const LISTBOX = "ul[role=listbox]";

/**
 * playwright-core paketi tarayiciyi indirmez; Playwright'in tarayici
 * onbellegini kullanir. Revizyon numarisi surume gore degistigi icin
 * klasoru taramak daha saglam.
 */
function resolveChromium() {
  if (process.env.CHROMIUM_EXECUTABLE) return process.env.CHROMIUM_EXECUTABLE;

  const cache =
    process.env.PLAYWRIGHT_BROWSERS_PATH ??
    path.join(os.homedir(), "AppData", "Local", "ms-playwright");

  const candidates = [
    "chrome-win/chrome.exe",
    "chrome-win/headless_shell.exe",
    "chrome-linux/chrome",
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
  ];

  if (fs.existsSync(cache)) {
    for (const dir of fs.readdirSync(cache).filter((d) => d.startsWith("chromium")).sort()) {
      for (const rel of candidates) {
        const exe = path.join(cache, dir, ...rel.split("/"));
        if (fs.existsSync(exe)) return exe;
      }
    }
  }
  return undefined; // playwright-core kendi cozumlemeyi dener
}

export async function launchApp() {
  const browser = await chromium.launch({
    executablePath: resolveChromium(),
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 420, height: 1400 } });

  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  try {
    await page.goto(APP_URL, { waitUntil: "networkidle", timeout: 15000 });
  } catch {
    await browser.close();
    throw new Error(
      `${APP_URL} erisilebilir degil. Once proje kokunde "npm run dev" ile ` +
        `uygulamayi baslat (bu testler calisan bir dev sunucusuna ihtiyac duyar).`,
    );
  }

  return { browser, page, pageErrors };
}

/**
 * MUI coklu Select'te liste acildiktan sonra her secimden sonra acik kalsin;
 * bu yuzden secimler arasinda openDropdown() CAGIRILMAZ.
 */
export async function openDropdown(page) {
  await page.locator(SELECT).click();
  await page.waitForSelector(LISTBOX, { timeout: 5000 });
}

export async function closeDropdown(page) {
  await page.keyboard.press("Escape");
  await page.waitForSelector(LISTBOX, { state: "detached", timeout: 5000 });
}

/** Normal bir tiklamayla secim yapar; devre disi bir secenek hata firlatir. */
export async function pick(page, group) {
  await page.locator(`li[data-value="${group}"]`).click({ timeout: 5000 });
  await page.waitForTimeout(80);
}

/** Devre disi bir secenek dogrudan DOM uzerinden zorlanarak tiklanir. */
export async function forcePick(page, group) {
  await page.locator(`li[data-value="${group}"]`).click({ force: true });
  await page.waitForTimeout(200);
}

/** Select kutusunun gorunen degeri (virgulle birlestirilmis grup listesi). */
export function selectedGroups(page) {
  return page
    .locator(SELECT)
    .innerText()
    .then((t) => t.trim().replace(/\u200b/g, ""));
}

export async function isDisabled(page, group) {
  return page
    .locator(`li[data-value="${group}"]`)
    .evaluate((el) => el.getAttribute("aria-disabled") === "true");
}

/** Devre disi olan normal kan gruplarinin listesi. */
export async function disabledGroups(page) {
  const out = [];
  for (const g of BLOOD_GROUPS) if (await isDisabled(page, g)) out.push(g);
  return out;
}

export function isModalOpen(page) {
  return page.locator(".swal2-popup").count().then((c) => c > 0);
}

/** Metin veya textarea alanina deger yazar. */
export async function fillField(page, name, value) {
  await page.locator(`input[name="${name}"], textarea[name="${name}"]`).first().fill(value);
  await page.waitForTimeout(120);
}

/** Tek secimli bir Select'ten bir deger secer ve listeyi kapatir. */
export async function pickFrom(page, selectName, value) {
  await page.locator(`#mui-component-select-${selectName}`).click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
  await page.locator(`li[data-value="${value}"]`).click({ force: true });
  await page.waitForTimeout(120);
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });
  await page.waitForTimeout(120);
}

/**
 * Formun butonu hedefleyen yonlendirme oku ekranda mi?
 *
 * `save-gallery-hint` sinifini kullanir; bu sinif yalnizca okun bulundugu
 * konteynerde vardir, dolayisiyla ikon sayisi yerine dogrudan sinfi
 * hedeflemek yanlislik yakalamaz.
 */
export function isSaveHintVisible(page) {
  return page
    .locator(".save-gallery-hint")
    .count()
    .then((c) => c > 0);
}

/** Formun zorunlu alanlarini tek tek doldurur. */
export async function fillWholeForm(page) {
  await pickFrom(page, "bloodGroup", "0 RH (+)");
  await pickFrom(page, "bloodType", "Kırmızı Kan");
  await fillField(page, "fullName", "Ali Veli");
  await fillField(page, "phone", "05321234567");
  await fillField(page, "hospital", "Ankara Hastanesi");
  await fillField(page, "location", "Çankaya");
  await page.waitForTimeout(150);
}

/**
 * Acik listbox'taki her secenegin DOM yapisi.
 *
 * `bareText` alani, MenuItem'in dogrudan cocuklari arasindaki bosluk disi
 * metin dugumlerini dondurur. Etiket ListItemText tarafindan cizilmeli;
 * ek bir metin dugumu varsa etiket iki kez basilmis olur. Bu kontrol
 * dil bagimsizdir, bu yuzden etiketin hangi dile cevrildiginin onemi yoktur.
 */
export function dropdownOptions(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('ul[role=listbox] li[data-value]')].map((li) => ({
      value: li.getAttribute("data-value"),
      label: li.querySelector(".MuiListItemText-primary")?.innerText.trim() ?? "",
      bareText: [...li.childNodes]
        .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0)
        .map((n) => n.textContent.trim()),
    })),
  );
}

/** BaseTemplateComponent'in poster uzerine yerlestirdigi kan grubu satirlari. */
export function posterBloodGroupLines(page) {
  return page.locator(".image-wrapper .text-item.blood-group").allInnerTexts();
}

/**
 * Posterin kan grubu satirlarini, arka plan kutusuna gore olculmus
 * sekilde dondurur. Iki satira bolunmus posterlerde satirlarin ust uste
 * binip binmedigi ancak olcumle dogrulanabilir; gozle bakmak yetersiz.
 *
 * @returns {{width:number, height:number, lines:Array<{text:string,top:number,bottom:number,left:number,right:number,fontSize:number,wrappedLines:number}>}}
 */
export function measurePosterBloodGroups(page) {
  return page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    if (!wrap) throw new Error(".image-wrapper bulunamadi; poster render edilmemis.");
    const wrapRect = wrap.getBoundingClientRect();

    const lines = [...wrap.querySelectorAll(".text-item.blood-group")]
      .filter((el) => el.innerText.trim().length > 0)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        return {
          text: el.innerText.trim(),
          top: Math.round(r.top - wrapRect.top),
          bottom: Math.round(r.bottom - wrapRect.top),
          left: Math.round(r.left - wrapRect.left),
          right: Math.round(r.right - wrapRect.left),
          fontSize: parseFloat(getComputedStyle(el).fontSize),
          // Metin kac satira sarildi? Kan grubu metni tek satira sigmali;
          // sarmak hem tasma hem de beklenmedik yerlestirme demektir.
          wrappedLines: Number.isFinite(lineHeight)
            ? Math.max(1, Math.round((r.height + 1) / lineHeight))
            : 1,
        };
      });

    return {
      width: Math.round(wrapRect.width),
      height: Math.round(wrapRect.height),
      lines,
    };
  });
}

/** bloodType alanindaki gercek MenuItem degerleri. */
export const BLOOD_TYPES = ["Kırmızı Kan", "Trombosit", "Granülosit", "Plazma", "Kök Hücre"];

const BLOOD_TYPE_SELECT = "#mui-component-select-bloodType";

/**
 * bloodType'a 4+ secenek yazar. Templates bu durumda kan grubu metnini
 * asagi iter, yani iki satira bolunmus posterler icin en kotu dikey senaryo.
 */
export async function fillLongBloodType(page) {
  const select = page.locator(BLOOD_TYPE_SELECT);
  await select.click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });
  for (const t of BLOOD_TYPES.slice(0, 4)) {
    await page.locator(`li[data-value="${t}"]`).click({ force: true });
    await page.waitForTimeout(60);
  }
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });
  await page.waitForTimeout(150);
}

/** Sablon degistirici butonlari, DOM sirasinda. */
export async function templateButtons(page) {
  return page.locator('[title^="Template "]').all();
}

const REPO_ROOT = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

/**
 * Registry'de kayitli sablon sayisi.
 *
 * `getTemplateCount()` TypeScript oldugu icin .mjs testlerinden import
 * edilemez; bu yuzden `templates` dizisinin govdesinden sayilir. Sablon
 * eklemek registry'ye import + diziye eklemekten ibaret oldugu icin, test
 * sayiyi elle yazmak yerine buradan turetir - boyce yeni sablon eklendiginde
 * test kirilmaz, ama secici DOM'dan kaybolursa yine kirilir.
 */
export function expectedTemplateCount() {
  const src = fs.readFileSync(path.join(REPO_ROOT, "src", "templates", "index.ts"), "utf8");
  const body = src.match(/export const templates[^=]*=\s*\[([\s\S]*?)\];/);
  if (!body) throw new Error("src/templates/index.ts icinde `templates` dizisi bulunamadi.");
  const entries = body[1].split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  return entries.length;
}

/**
 * Template secim satiri: her butonun olculmus kutusu.
 *
 * Kritik alan `isSquare`. flex satiri bir butonu yalnizca YATAYDA
 * kucultebilir (yukseklik sabittir), boylece daire sessizce elipse
 * donusur. Genisligin kendisi degismedigi icin ancak olcerek yakalanir.
 */
export function templateSelectorBoxes(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('[title^="Template "]')];
    const parent = els[0]?.parentElement ?? null;
    return {
      containerWidth: parent ? Math.round(parent.getBoundingClientRect().width) : 0,
      gap: parent ? getComputedStyle(parent).gap : "normal",
      boxes: els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return {
          title: el.getAttribute("title"),
          width: Math.round(r.width * 100) / 100,
          height: Math.round(r.height * 100) / 100,
          top: Math.round(r.top),
          flexShrink: cs.flexShrink,
          isSquare: Math.abs(r.width - r.height) < 0.5,
        };
      }),
    };
  });
}