import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
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

/** Uyari modali acilana kadar bekler. */
export async function waitForModal(page, timeout = 4000) {
  try {
    await page.locator(".swal2-popup").waitFor({ state: "visible", timeout });
  } catch {
    throw new Error(`.swal2-popup ${timeout}ms icinde acilmadi.`);
  }
}

/** Acik uyari modalinin basligi + govdesi. Ceviri farkindaysa bu yuzden metin degil ikon bakilir. */
export function modalText(page) {
  return page.evaluate(() => {
    const popup = document.querySelector(".swal2-popup");
    return {
      icon: document.querySelector(".swal2-icon")?.className ?? "",
      title: popup?.querySelector(".swal2-title")?.textContent.trim() ?? "",
      body: popup?.querySelector(".swal2-html-container")?.textContent.trim() ?? "",
    };
  });
}

/** Modali kapatir; sonraki adimlar icin temiz baslangic. */
export async function closeModal(page) {
  // Zorunlu tik yok: Swal butonu da giris animasyonuyla yer degistiriyor.
  await page.locator(".swal2-confirm, .swal2-cancel").first().click({ timeout: 4000 });
  await page.waitForSelector(".swal2-popup", { state: "detached", timeout: 5000 });
}

/**
 * Metin veya textarea alanina deger yazar ve degerin TUTUNDUGUNDAN emin olur.
 *
 * Yazdiktan sonra degeri gercekten okuyup dogruluyoruz; tutmadiysa tekrar
 * deniyoruz. Boylece eksik bir alan sessizce gecmez, testin sonunda
 * "ok gorunmedi" gibi alakasiz bir hata cikmaz.
 *
 * Karsilastirmada bosluklar yok sayilir: telefon alani MASKELI oldugu icin
 * yazdigimiz "05321234567", ekranda "0532 123 45 67" olarak durur.
 */
export async function fillField(page, name, value, attempts = 5) {
  const field = page.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
  // Maske ve fazla bosluk farkini yoksay: "05321234567" === "0532 123 45 67".
  const normalize = (s) => s.replace(/\s+/g, "");

  for (let attempt = 1; attempt <= attempts; attempt++) {
    await field.fill(value);
    await page.waitForTimeout(120);
    if (normalize(await field.inputValue()) === normalize(value)) return;
  }
  throw new Error(
    `${name} alanına "${value}" yazılamadı (${attempts} deneme). ` +
      `Sondaki değer: "${await field.inputValue()}"`,
  );
}

/**
 * Bir MenuItem'i tiklar.
 *
 * `force: true` KULLANILMAZ. Zorunlu tik, Playwright'in "eylem uygunluk"
 * kontrollerini atlar; tik o ANKI kutunun merkezine gider. MUI'nin `Menu`
 * acilirken animasyonla buyur, bu yuzden oge kutulari her karede degisir.
 * Olculmus bir kayipta `li` tiklamadan once `210,551 298x38` konumundaydi,
 * tikten sonra `210,658 360x54` konumundaydi: tik animasyon sirasinda alinmis
 * kutudan gitti, animasyon bitince o nokta baska bir secenegin ustune dustu
 * ve secim KAYBOLDU. Test sessizce yola devam ediyor, sonra "ok gorunmedi"
 * gibi alakasiz bir hata cikiyordu.
 *
 * Normal tik oynamayi bekler. Tek istisna: devre disi seceneklerin
 * `pointer-events: none` olmasi; o durumda zorunlu tik gerekiyor.
 */
export async function clickMenuItem(page, selector, timeout = 4000) {
  const option = page.locator(selector);
  await option.waitFor({ state: "visible", timeout: 5000 });
  try {
    await option.click({ timeout });
  } catch {
    await option.click({ force: true });
  }
}

/**
 * Bir Select'ten `value` degerini secer ve listeyi kapatir.
 *
 * Secim kaybolursa (zamanlama yarisi) sessizce gecmez: secimin ekrana
 * cizildigini dogrular, olmazsa yeniden dener ve nihayetinde buldugu
 * GERCEK metni yazarak hata verir. Bu sayede testin kendi zamanlamasindan
 * dogan bir sorun, urun hatasi gibi gorunmez.
 *
 * Dogrulama `data-value`'ya bakar, listelenen ETIKETE degil; `bloodType`
 * Select'i `renderValue` ile ham degerleri ciziyor. Bkz. `selectValueDrawn`.
 */
export async function pickFrom(page, selectName, value, attempts = 4) {
  const selector = `ul[role=listbox] li[data-value="${value}"]`;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    // Onceki denemeden acik kalmis olabilecek listeyi kapat.
    if ((await page.locator("ul[role=listbox]").count()) > 0) {
      await page.keyboard.press("Escape");
      await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });
    }

    await page.locator(`#mui-component-select-${selectName}`).click();
    await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });

    await clickMenuItem(page, selector);

    // Ilk denemede kisa bekle: cogu secim aninda cizilir, bekleyerek
    // her turu yavaslatmayalim. Son denemede uzun bekle.
    const drew = await selectValueDrawn(page, selectName, value, attempt === attempts ? 5000 : 1500);

    await page.keyboard.press("Escape");
    await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });

    if (drew) {
      await page.waitForTimeout(120);
      return;
    }
  }

  throw new Error(
    `${selectName} Select'ine "${value}" ${attempts} denemede kaydedilemedi. ` +
      `Bulgulanan metin: ${JSON.stringify(
        await page.locator(`#mui-component-select-${selectName}`).textContent(),
      )}`,
  );
}

/**
 * Select'in `value` degerini cizdigini (secimin kaydedildigini) bekler.
 * `true`/`false` doner; hata atmaz, cagirisi tekrar deneyebilsin.
 *
 * DİKKAT 1 - "metin bos degil" kontrolü YETMEZ. Secim yokken MUI deger
 * yerine SIFIR GENİŞLİKLİ BOŞLUK (U+200B) cizer; `trim()` onu bos sayar
 * ama `length > 0` kontrolü takılır. Testler bu yuzden kaybolmus secimi
 * "dolu" saniyordu.
 *
 * DİKKAT 2 - Beklenen deger, `data-value` (ham deger) OLMALI; listedeki
 * ETIKET degil. `bloodType` Select'i `renderValue` ile ham degerleri
 * birlestirir ("Kırmızı Kan"), ceviri etiketlerini degil
 * (Ingilizce arayuzde etiket "Red Blood"). Etiketi bekleyen kontrol
 * Turkce olmayan arayuzde ASLA tutmuyor; tekrar denemeler de secimi
 * acip kapatip sonunda bos birakiyordu. Ham deger her iki durumda da
 * Select'in cizecegi metin oldugu icin kontrol dil bagimsizdir.
 */
export async function selectValueDrawn(page, selectName, value, timeout = 1500) {
  try {
    await page.waitForFunction(
      ({ sel, expected }) => {
        const el = document.querySelector(`#mui-component-select-${sel}`);
        if (!el) return false;
        const strip = (s) => s.replace(/[\s-‍﻿]/g, "");
        return strip(expected).length > 0 && strip(el.textContent).includes(strip(expected));
      },
      { sel: selectName, expected: value },
      { timeout },
    );
    return true;
  } catch {
    return false;
  }
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

/**
 * Okun `expected` durumuna gelmesini bekler.
 *
 * Tek seferlik `isSaveHintVisible` çağrısı KAYAN testler yazıyordu: ok
 * `validate()` sürdüğü için React state'ine bağlı, son `fill()` çağrısından
 * sonra yeniden render gerekiyor. Sabit beklemeyle "ok görünüyor"
 * doğrulaması bazen render gelmeden çalışıyor ve test keyfî düşüyordu.
 *
 * Bekleme hem var olan hem de olmayan durumda kullanılır; "olmamalı"
 * doğrulamaları da böylece anlamlı kalır — ok gerçekten kaybolana kadar
 * bekler, hâlâ duruyorsa hata verir.
 */
export async function waitForSaveHint(page, expected, timeout = 4000) {
  const deadline = Date.now() + timeout;
  for (;;) {
    if ((await isSaveHintVisible(page)) === expected) return;
    if (Date.now() > deadline) {
      throw new Error(
        `save-gallery-hint ${expected ? "gorunmedi" : "kaybolmadi"} ` +
          `(${timeout}ms bekledi). Form gercekten dolu mu?`,
      );
    }
    await page.waitForTimeout(80);
  }
}

/**
 * Sayfanın React tarafında bağlandığından emin olmak için bekleme.
 *
 * `reload` + `networkidle` tek başına yetmiyor: ağlar durdu ama React ilk
 * render'ı bitirmemiş olabilir, o zaman hemen yapılan `fill()` çağrıları
 * kaybolur. İndirme butonu ancak handler'lar bağlandıktan sonra DOM'a girer.
 */
export async function waitForAppReady(page) {
  await page.locator(".download-image-button").waitFor({ state: "visible", timeout: 15000 });
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
 *
 * Once mevcut secimleri temizler. Bu adim olmadan yardimci ikinci kez
 * cagrildiginda ayni 4 ogeye tiklamak secimleri KALDIRIR ve bloodType
 * bos kalir; testler siraya bagimli hale gelir. Tekrarlanabilir olmasi
 * icin her cagri ayni duruma gelmeli.
 */
export async function fillLongBloodType(page) {
  return fillBloodTypes(page, 4);
}

/**
 * bloodType alanina tam olarak `count` secenek yazar.
 *
 * Once mevcut secimleri temizler. Bu adim olmadan yardimci ikinci kez
 * cagrildiginda ayni ogeye tiklamak secimi KALDIRIR ve bloodType bos kalir;
 * testler siraya bagimli hale gelir. Tekrarlanabilir olmasi icin her cagri
 * ayni duruma gelmeli.
 *
 * 3 kan tipi ayri bir durum: 4+ tipte `bloodType` 15px'e kuculup konumu
 * yukselirken 3 tipte cogu sablonda 17px kalir ve konum degismez - yani
 * hicbir testin dokunmadigi bir bant.
 */
export async function fillBloodTypes(page, count) {
  assert.ok(
    count >= 1 && count <= BLOOD_TYPES.length,
    `fillBloodTypes: count 1..${BLOOD_TYPES.length} olmali, ${count} geldi.`,
  );

  const select = page.locator(BLOOD_TYPE_SELECT);
  await select.click();
  await page.waitForSelector("ul[role=listbox]", { timeout: 5000 });

  // Mevcut secimleri kaldir.
  for (let i = 0; i < BLOOD_TYPES.length; i++) {
    const checked = page.locator("ul[role=listbox] li[data-value]:has(input:checked)");
    if ((await checked.count()) === 0) break;
    await clickMenuItem(page, "ul[role=listbox] li[data-value]:has(input:checked) >> nth=0");
    await page.waitForTimeout(60);
  }

  for (const t of BLOOD_TYPES.slice(0, count)) {
    await clickMenuItem(page, `ul[role=listbox] li[data-value="${t}"]`);
    await page.waitForTimeout(60);
  }
  await page.keyboard.press("Escape");
  await page.waitForSelector("ul[role=listbox]", { state: "detached", timeout: 5000 });
  await page.waitForTimeout(150);
}

/**
 * bloodType kutusunu hem KUTU hem GERCEK METIN olarak olcer ve altindaki
 * ilk baska `.text-item` ile arasindaki boslugu dondurur.
 *
 * Neden ikisi birden olculuyor - `.text-item` `position: absolute` ve
 * genisligi yok (shrink-to-fit), ama containing block'a KIRPILIR. Bu yuzden
 * kutu `right`i daima `left + (cerceve - left)` = cerceve olur ve metnin
 * nereye kadar ulastigini ANLATMAZ. Template 2'de 4 tipte kutu `right` 360px
 * cikiyordu; gercek metin ise 313px'te bitiyordu.
 *
 * Dikeyde de ayni tuzak var: `.text-item` `line-height: 1.5` kullaniyor, yani
 * her satirin ustunde ve altinda (1.5-1)/2 = %25 leading var. 4+ kan tipinde
 * `bloodType` iki satira sarigi icin kutu bosluklari T2/T3/T4'te 1px, T7'de
 * 0px'e dustugu halde gercek metin boslugu 4-5px cikiyor - yani hicbir
 * sablonda gorunur cakisma yok.
 *
 * Cerceve tasmasi ve gorunur cakisma kontrolleri bu yuzden GERCEK METIN
 * kutusunu kullanmali.
 */
export async function measureBloodTypeBox(page) {
  return page.evaluate(() => {
    const wrap = document.querySelector(".image-wrapper");
    const wrapRect = wrap.getBoundingClientRect();
    const range = document.createRange();

    const plain = [...wrap.querySelectorAll(".text-item")].filter(
      (e) => !e.classList.contains("blood-group") && !e.classList.contains("multiline"),
    );
    // Ham degerle araniyor: `bloodType` Select'i `renderValue` ile ham
    // degerleri birlestirdigi icin ekranda her dilde "Kırmızı Kan" yazar.
    const typeEl = plain.find((e) => e.innerText.includes("Kırmızı"));
    if (!typeEl) return null;

    const typeRect = typeEl.getBoundingClientRect();
    const nextEl = plain.find(
      (e) =>
        e !== typeEl &&
        e.innerText.trim().length > 0 &&
        e.getBoundingClientRect().top > typeRect.top,
    );

    const info = (el) => {
      const box = el.getBoundingClientRect();
      range.selectNodeContents(el);
      const rects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
      return {
        text: el.innerText.trim(),
        font: parseFloat(getComputedStyle(el).fontSize),
        boxTop: Math.round(box.top - wrapRect.top),
        boxBottom: Math.round(box.bottom - wrapRect.top),
        boxRight: Math.round(box.right - wrapRect.left),
        inkTop: rects.length ? Math.round(Math.min(...rects.map((r) => r.top)) - wrapRect.top) : null,
        inkBottom: rects.length
          ? Math.round(Math.max(...rects.map((r) => r.bottom)) - wrapRect.top)
          : null,
        inkRight: rects.length
          ? Math.round(Math.max(...rects.map((r) => r.right)) - wrapRect.left)
          : null,
        lines: rects.length,
      };
    };

    return {
      frameWidth: Math.round(wrapRect.width),
      bloodType: info(typeEl),
      below: nextEl ? info(nextEl) : null,
    };
  });
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