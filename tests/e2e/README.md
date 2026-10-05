# E2E testleri

Kan grubu seçim kuralları ve poster önizlemesi için uçtan uca tarayıcı testleri.

## Çalıştırma

Testler **çalışan bir dev sunucusuna** ihtiyaç duyar. Önce proje kökünde:

```sh
npm run dev
```

Sonra başka bir terminalde:

```sh
npm test                # tüm testler
npm run test:selection  # sadece kan grubu seçim kuralları
npm run test:poster     # sadece poster önizleme
```

`APP_URL` ortam değişkeniyle farklı bir adres kullanılabilir (varsayılan `http://localhost:5173`).

## Yapı

| Dosya | Kapsam |
|---|---|
| `helpers.mjs` | Paylaşılan yardımcılar: tarayıcı açma, dropdown aç/kapa, seçim yapma, `aria-disabled` okuma, dropdown seçenek denetimi, poster satırlarını okuma, geometri ölçümü |
| `blood-group-selection.test.mjs` | Kan grubu seçim kuralları (10 test) |
| `poster-render.test.mjs` | Poster önizleme bütünlüğü (4 test) |
| `poster-geometry.test.mjs` | 7 şablonun tamamında poster satır geometrisi (92 test) |
| `template-selectors.test.mjs` | Template seçim dairelerinin kare (yuvarlak) kalması (4 test) |
| `save-hint.test.mjs` | "Galerine kaydet" yönlendirme oku (6 test) |

Test framework'ü olarak Node'un yerleşik `node:test` modülü kullanılıyor; tek
bağımlılık `playwright-core` ve o da yalnızca tarayıcıyı sürmek için.

## İlk kurulum

`playwright-core` tarayıcı **indirmez**; Playwright'in önbelleğini kullanır.
Bu makinede önbellek zaten var. Yeni bir makinede testleri çalıştırmak için:

```sh
npx playwright install chromium
```

`helpers.mjs` önbellek klasörünü tarayarak Chromium yolunu çözer, böylece
Playwright sürümü değişse bile yol elle ayarlanmaz. Farklı bir kurulum için
`CHROMIUM_EXECUTABLE` ortam değişkeniyle tam yol verilebilir.

## Test edilen kurallar

1. `Kan Grubu Fark Etmeksizin` seçiliyse hiçbir normal grup seçilemez.
2. O seçenek her zaman geri alınabilir (kilitlenmez).
3. 4 normal grup seçiliyse seçilmemiş olanlar **ve** `Fark Etmeksizin` kapanır.
4. Sınıra ulaşıldığında **seçili olan gruplar tıklanabilir kalır** — aksi halde
   menü kilitlenir, kullanıcı seçimini değiştiremez.
5. Devre dışı seçeneklere tıklamak hiçbir şeyi değiştirmez, uyarı modalı çıkmaz.
6. Posterde 4 grup 2+2 olarak iki satıra bölünür.
7. Registry'deki şablon sayısı kadar seçici bulunur ve hepsi seçimli kan
   grubuyla hatasız render olur.
8. **7 şablonun tamamında** kan grupları üst üste binmez, tek satıra sarmaz,
   `bloodType` alanıyla çakışmaz ve çerçeve dışına taşmaz.
   `bloodType` çakışması **1, 2, 3 ve 4 grubun her biri** için ayrı ölçülür:
   en kötü senaryo 4 grup değil, daha yüksek fontlu 2 gruptu — ve 1 grubun
   bandı ayrı bir formül (`top + 1.5 × font`) izlediği için atlanırsa
   gizli çakışmalar kalıyor.
9. Hiçbir dropdown seçeneği etiketini iki kez basmaz.
10. Template seçim daireleri **kare** kalır — flex satırı onları yatayda
    ezip elipse çeviremez.
11. Form tamamlandığında "Galerine kaydet" yönlendirme oku belirir, eksik alan
    kalınca kaybolur ve ok varken buton hata vermez.
12. **En geniş tek grup** (`AB RH (+)`, `left` 47→20 dalı) 7 şablonun hiçbirinde
    kan grubu bandını `bloodType`'a bindirmiyor ve çerçeveden taşmıyor. Ölçüm
    `BLOOD_GROUPS[0]` değil en genişini seçer, çünkü sablonlar tek grupta
    metni sola kaydırabiliyor.
13. **3 ve 4 kan tipi** seçiliyken `bloodType` çerçeveden taşmıyor ve
    altındaki metnin üstüne binmiyor. 3 tip ayrı bir durum: 4+ tipte 15px'e
    küçülüp yukarı çekilirken 3 tipte 17px kalıyor, yani metin en uzun halinde.
    Hiçbir test önceden 3 tip kullanmıyordu.

## Poster geometrisi neden ölçülüyor?

İki satıra bölünmüş posterlerde satırlar arası pay **3px**'e kadar
düşüyor. Bu aralıkta gözle kontrol güvenilir değil; 5px'lik bir hata
posterde fark edilmeden geçer. `poster-geometry.test.mjs` bu yüzden
`getBoundingClientRect()` okuyup şu dördünü doğruluyor:

- ardışık satırlar üst üste binmiyor (`lines[i].bottom <= lines[i+1].top`)
- kan grubu metni **tek satıra** sığıyor (`wrappedLines === 1`)
- metin `bloodType` alanına girmiyor
- metin `.image-wrapper` sınırları içinde kalıyor

### Kutu mu, gerçek metin mi? (ölçüm disiplini)

Kan grubu satırları için kutu ölçümü doğru çalışıyor, çünkü `top` ve
`bottom` gerçekten kullanılıyor. Ama **çerçeve taşması** ve **`bloodType`
altındaki metne binme** kontrolleri kutuyla yapılırsa yanlış sonuç verir:

- Yatayda kutu `right`'ı **anlamsızdır** — `.text-item` shrink-to-fit olup
  containing block'a kırpıldığı için daima çerçeve genişliğine eşit çıkar.
- Dikeyde kutu boşluğu **görsel boşluğun üstündedir** — `line-height: 1.5`
  her satıra %25 leading ekliyor.

Bu yüzden 12. ve 13. kurallar `measureBloodTypeBox()` ile
`Range.getClientRects()` üzerinden **gerçek metin kutusunu** kullanır.
Ayrıntı ve ölçülen sayılar için "Kutu ölçümü yanıltıcıdır" bölümüne bak.

Kan grubu metninin render yüksekliği font boyutunun ~1.5 katı
(League Spartan satır yüksekliği), dolayısıyla piksel değerleri
değiştirilirken bu ilişkiyi korumak gerekiyor. `tests/e2e/`
içindeki test, `regularGroupCount` dallarındaki değerlerden biri
bozulursa yakalar.

Düzeltilmiş iki kusur bu testle yakalandı:

- **Template 3**: 2/3/4 grupta satırlar 5px üst üste biniyordu.
- **Template 4**: `bloodGroup2` config'te `{top: 170, size: 78}`
  değerlerinde kalıyordu; 4 grupta ikinci satır 78px'de 2 satıra
  sarıp çerçevenin sağ kenarına dayanıyordu, 2/3 grupta satır
  boyutları asimetrikti (39px ↔ 78px).

## Bilinen, henüz düzeltilmemiş durumlar

**Yok.** Kan grubu ↔ `bloodType` çakışmalarının tamamı kapandı ve 7 şablonun
tamamı tarandı: 7 şablon × {1, 2 grup} × {0-5 kan tipi} ile dikey bindirme,
yatay taşma ve kan grubu sarması için **0 bulgu**; 4 senaryoda tüm alanlar
(uzun ad + 160 karakterlik adres) doldurulup tarandı, yine **0 bulgu**.

### Kutu ölçümü yanıltıcıdır — ink ölçümü gerekir

Bu oturumda iki "bulgu" aslında ölçüm hatasıydı ve ikisi de düzeltildi.
Kayda geçiriyorum çünkü aynı tuzak tekrar tekrar düşülebilir:

| Tuzak | Gerçek |
|---|---|
| **Kutu `right`'ı** | `.text-item` `position: absolute` ve genişliği yok → shrink-to-fit, ama **containing block'a kırpılır**. Bu yüzden kutu `right`'ı daima `left + (360 − left)` = **360**'tır. Yedi şablonun hepsinde 360 çıktı ve T2'ye özgü bir kusur sanıldı. Gerçek metin 4+ tipte 313–340px'te bitiyor, yani **20–47px** pay var. Kutu `right`'ı hiçbir zaman taşma ölçümü olarak kullanılamaz. |
| **Kutu dikey boşluğu** | `.text-item` `line-height: 1.5` kullanıyor → her satırın üstünde ve altında (1.5−1)/2 = **%25 leading** var. 4+ kan tipinde `bloodType` iki satıra sarıyor ve kutu boşluğu T7'de **0px**, T2/T3/T4'te **1px** çıkıyor — bu "kırılgan" görünüyordu. Gerçek metin boşluğu ise T7'de **4px**, T2/T3/T4'te **5px**: **görünür çakışma yok**. |

Doğru ölçüm `Range.getClientRects()` ile satır başına gerçek metin kutusudur
(line-height değil, fontun ascent/descent'i). `measureBloodTypeBox()` bunu
yapıyor ve çerçeve taşması / görünür çakışma kontrolleri onu kullanıyor.

Bu, daha önceki "T2'de `bloodType` çerçeve kenarına oturuyor, 1px boşluk
kırılgan, kararınız gerekiyor" tespitinin **tamamının yanlış** olduğu anlamına
geliyor. Boşluk gerçek, ama 4–5px görünür ve T2'ye özgü değil.

### Hiç test edilmeyen 3 kan tipi bandı

Kan tipi sayısı ya **boş** (0) ya **4+** (`fillLongBloodType`) olarak
kullanılıyordu. **3 tip** hiç denenmemişti ve ayrı bir durum: 4+ tipte
`bloodType` 15px'e küçülüp yukarı çekilirken 3 tipte çoğu şablonda 17px
kalıyor ve konumu **değişmiyor** — yani metin en uzun halinde.

Ölçülen en dar yatay pay burada: **T4'te 1px** (metin 359px / çerçeve 360px,
17px font). Taşma yok ama diğer şablonlarda aynı anda 17–23px. Yeni test
(her şablon için 3 ve 4 tip) bu bandı `ink` ölçümüyle kapsıyor.

## Bu turda düzeltilenler (hepsi ölçülmüş değerler)

En kötü `bloodType` konumu: **T1 → 203**, T2 → 165, T3 → 200, T4 → 207,
T5 → 205, T6 → 197, T7 → 225. Bant formülü: 2+ grupta `top + 3 × font`,
1 grupta `top + 1.5 × font`.

### Template 2, tek grup (son açık konu)

78px font → bant **182px**; `bloodType` 176px (1-3 kan tipi) ve 165px
(4+) → sırasıyla **6px** ve **17px** bindirme.

Çözüm fontu küçültmek, çünkü konumlar sabit kalmalı (arka plan
sanatıyla hizası bozulmasın). Bant `65 + 1.5 × font`; 4+ kan tipinde
`bloodType` 165px olduğu için `65 + 1.5 × font ≤ 163` → **64px**
(−%18). Ölçülen sonuç:

| | Değer |
|---|---|
| Bant (64px) | **161px** |
| Pay (4+ kan tipi, `bloodType` 165px) | **4px** |
| Pay (1-3 kan tipi, `bloodType` 176px) | **15px** |
| "AB RH (+)" sağ kenarı (`left` 20) | **282px** / çerçeve 360px, tek satır |
| "A RH (+)" / "0 RH (+)" sağ kenarı (`left` 47) | 274px / 270px |

4px pay, aynı şablonun 2+ grup dalıyla aynı (bant 162 / 165 = 3px).

### Ölçülmeden görünmeyen ikinci bir boşluk: `AB` dalı

Tek grupta `Template2Component` metni sola kaydırıyor (`left` 47 → 20) ve
`AB RH (+)` en geniş tek grup metni. Testler yalnızca `BLOOD_GROUPS[0]`
yani `"A RH (+)"` ölçtüğü için **bu dal hiç ölçülmemişti**. Yeni test
`WIDEST_SINGLE_GROUP = BLOOD_GROUPS.reduce(...)` ile en genişini ölçüyor
(her şablon için 1 test, 71 → 78).

### Düzeltilen yerelleştirme kırılganlığı

`bloodType`'ı bulan test kodu `innerText.includes("Kan")` arıyordu. Bu
**çeviri metni**; İngilizce arayüzde `bloodTypeTop` `null` olur ve test
ürün hatası sanılan bir hatayla düşerdi. Artık ham değeri (`Kırmızı`)
arıyor — `bloodType` Select'i `renderValue` ile ham değerleri birleştirdiği
için bu metin her dilde aynı.

- **Template 1** (yeni kapsam): 2 grupta bant 208px, `bloodType` 203px →
  **5px çakışma**; 2/3/4 grupta satır payı **0px**'di. Font 46 → 42px
  (bant 196px), ikinci satır 139 → 135px ve 130 → 132px.
- **Template 2**: 2/3/4 grupta satırlar **14px** (2 grup) ve **5px** (3/4 grup)
  üst üste biniyordu, bant `65 + 3×46 = 203px` gerektiriyordu, oysa
  `bloodType` 165px. Font 46/40 → **32px** (bant 161px).
- **Template 3**: 2 grupta satırlar **24px**, 3 ve 4 grupta **2px** üst üste
  biniyordu. 2 gruplu font 60px iken bant `70 + 3×60 = 250px` istiyordu.
  Font **42px**'e indirildi (bant 196px), ikinci satır 125 → 130px.
- **Template 4**: `bloodType` config'te 218px görünüyor ama 4+ kan tipinde
  **207px**'ye çekiliyor. 2 gruplu bant 208px olduğu için **1px** çakışıyordu;
  font 46 → 44px (bant 202px). 3/4 gruplu ikinci satır 130 → 132px.
- **Template 5**: 2 grupta **5px** üst üste binme vardı, bant 213px gerekiyordu,
  `bloodType` 205px. Font 46 → 42px (bant 201px). 3/4 gruplu ikinci satır
  130 → 137px.
- **Template 6**: 2 grupta satırlar **20px** üst üste biniyor ve bant 240px
  ile `bloodType`'ın 43px üstüne biniyordu. Font 60 → 44px (bant 192px).
  3/4 gruplu ikinci satır 130 → 132px.
- **Template 7**: çakışma **yok** — bant 208px, `bloodType` 225px, **17px pay**.
  Burada önce "5px çakışma" var sanılmıştı; ölçüm çürüttü, Template 3'ün
  `bloodType` değeri (200) yanlışlıkla T7 ile karşılaştırılmıştı. Ancak
  3 ve 4 gruplu ikinci satırın payı **0px**'di, 132px'e çekildi.

### Satır payı neden önemli

Bazı şablonlarda iki satırın arasındaki pay tam **0px**'di: satırlar
üst üste *biniyor* değil ama tamamen yapışık. Yuvarlama bir piksel kayarsa
çakışmaya döner. T1, T4, T6 ve T7'de bu durum vardı; hepsi 2px'e çekildi.

Bu, **aynı kutu içinde iki ayrı satır arasındaki** pay için geçerli ve
kutunun kendi sınırı olduğu için ink ölçümü gerekmez. `bloodType` ile
`date` arasındaki 0px kutu boşluğu ise farklı bir durum — orada leading
zaten 4–5px görünür pay üretiyor. İkisini karıştırmamak için yukarıdaki
"Kutu ölçümü yanıltıcıdır" bölümüne bak.

## Ölçüm disiplini

Tabloyu `tests/e2e/` dışındaki geçici ölçüm betiğiyle ürettim; kalıcı test
kapsamı genişletildiğinde buradaki satırlar silinmelidir. Bu belgedeki
**her sayı ölçülmüştür**, tahmin değil. İki kez yanlış çıkmasının sebebi
bir şablonun bandını başka bir şablonun `bloodType` değeriyle
karşılaştırmaktı — karşılaştırma her zaman aynı şablon içinde yapılmalı.

## Select ile etkileşirken üç tuzak

Bunların üçü de `save-hint` testlerini kayandırdı ve üçü de gözle
görünmüyor; yalnızca ölçümle anlaşıldı.

### 1. `force: true` açılış animasyonunu atlar

MUI'nin `Menu` bileşeni açılırken öğeleri animasyonla büyütür, yani
`li`'nin kutusu her karede değişir. `force: true`, Playwright'in "eylem
uygunluk" kontrollerini (görünürlük, **kararlılık**, olayın bu öğeye
düşmesi) atlar ve tıklamayı o anki kutunun merkezine gönderir. Animasyon
bitince o koordinat başka yere düşer, seçim kaybolur.

Ölçülen bir kayıp: tıklamadan hemen önce `li` kutusu `210,551 298x38`,
tıklamadan hemen sonra `210,658 360x54` — yani tık, animasyon sırasında
alınmış kutudan gitti ve hiçbir seçeneğe denk gelmedi.

Bu yüzden `clickMenuItem()` önce **normal** tıklar. Tek istisna devre dışı
seçenekler: `pointer-events: none` oldukları için normal tık reddedilir,
o durumda zorunlu tıklama denenir (sadece `forcePick()` ve bu geri düşüş
yolu için).

### 2. Select'in ekrana çizdiği metin, listenin etiketi değil

`bloodType` `Select`'i `renderValue` kullanıyor ve **ham değerleri**
birleştiriyor (`BloodDonationFormInputs.tsx`):

```tsx
renderValue={(selected) => Array.isArray(selected) ? selected.join(", ") : String(selected)}
```

Yani listedeki etiket Türkçe `t("redBlood")` ile çevriliyor ama ekrana
çizilen metin ham değer `Kırmızı Kan`. İngilizce arayüzde etiket
`"Red Blood"`, ekranda `"Kırmızı Kan"` oluyor.

Doğrulamayı etikete göre yazmak Türkçe olmayan arayüzde **asla**
tutmuyor. Üstelik `pickFrom`'un yeniden deneme döngüsü her denemede
tıkladığı için seçimi açıp kapatıyor ve sonunda `bloodType`'ı **boş**
bırakıyor — yani aslında var olan seçimi yok ediyordu.

Bu yüzden doğrulama `data-value`'ya (ham değere) bakar. Ham değer her iki
durumda da ekrana çizilen metin olduğu için kontrol dil bağımsız kalır.

### 3. Boş seçim sıfır genişlikli boşluk çizer

Seçim yokken MUI, `Select` içine `\u200b` (zero-width space) yazar.
`trim()` onu boş sayar, ama "metin boş değil" diye soran bir kontrol
takılır — test kaybolmuş bir seçimi "dolu" sanar. `selectValueDrawn()`
beklenen değeri ve ekrandaki metni `[\s\u200b-\u200d\ufeff]` ile sadeleştirip
karşılaştırır.

## Seçim kaybı hiçbir zaman sessiz geçmemeli

`fillField()` yazdığı değerin **tutunduğunu doğrular**, `pickFrom()` seçimin
**ekrana çizildiğini** doğrular; ikisi de tutmuyorsa yeniden dener ve
nihayetinde, bulduğu gerçek metni yazarak hata verir.

Bu, testin kendi zamanlamasından gelen bir hatanın ürün hatası gibi
görünmesini engelliyordu: aslında seçim kaybolmuştu, ama test "ok
görünmedi" deyip geçiyordu — sanki `validate()` bozukmuş gibi.

## Dikkat: MUI'nin açık kalma davranışı

MUI çoklu `Select` bileşeninde liste, her seçimden sonra **açık kalır**. Bu
nedenle seçimler arasında `openDropdown()` çağrılmaz — çağrılırsa modal perdesi
tıklamayı engeller ve Playwright zaman aşımına düşer. Testler bu yüzden tek
açılışta art arda seçim yapar.

Devre dışı seçenekleri sınamak için normal tıklamayı değil `forcePick()`
kullanır; normal tıklama Playwright tarafından reddedilir (`element is not
enabled`), ki bu da davranışın doğru olduğunun bağımsız bir teyididir.

## Kayan `save-hint` testleri: ne ölçüldü

`save-hint.test.mjs` 5 koşudan 3'ünde düşüyordu ve **her seferinde farklı
bir testte**. Bu, zamanlama yarışının imzasıydı.

Ölçülen kök neden ve düzeltme:

| Kayıp | Ölçüm | Düzeltme |
|---|---|---|
| Kan grubu seçimi kayboluyor | 32 turda 2 kayıp (~%6) | `clickMenuItem()` zorunlu tıklamayı kaldırdı |
| `fillWholeForm` sessizce eksik formla dönüyor | o kayıplarda `ok` hiç görünmüyordu | `fillField()` ve `pickFrom()` artık doğrular |

Doğrulama sonrası: **`fillWholeForm` 40/40**, her turda birebir aynı form
durumu; **`save-hint.test.mjs` 5/5 koşu**, her birinde 7 geçer 0 kırık.

Bu arada bulunan **ürün hatası**: ok (`BloodDonationFormInputs`) yalnızca
"alanlar dolu mu" diye bakarken indirme yolu ayrıca telefonun en az 11
karakter olmasını istiyordu. 6 haneli telefon yazan kullanıcı "hazır,
indir" okunu görüyor, butona basınca "geçersiz telefon" uyarısı alıyordu.

Kural artık tek yerde: `src/entities/DonationInfo.ts` içindeki
`isDonationInfoComplete()`. Ok da, indirme de onu kullanıyor; indirme
yolunun ihtiyaç duyduğu alan adlarını çevirmek için
`missingRequiredFields()` ayrıca dışa açık.

**Kullanıcı onayı: onaylandı.** Bu görünür bir davranış değişikliğidir —
11 karakterden kısa telefon yazılırken indirme oku artık görünmez. Kasıtlı
karardır; `save-hint.test.mjs` içindeki `kisa telefon oku gostermez` testi
bunun hem gizlendiğini hem de butonun gerçekten engellediğini kilitler.

## Yeni test eklerken

- Domain sabitlerini (`REGARDLESS`, `BLOOD_GROUPS`) `helpers.mjs`'ten import et.
- `page.on("pageerror")` ile yakalanan hatalar `launchApp()` içinde toplanır ve
  `after()` bloğunda `assert.deepEqual(pageErrors, [])` ile doğrulanır.
- Testler birbirinden bağımsız olmalı; `page.reload()` ile başlayarak.
- `reload()` sonrası `waitForAppReady(page)` çağır. `networkidle` tek başına
  yetmez: ağlar durmuş olabilir ama React'in ilk render'ı bitmemiştir, ve
  hemen yapılan `fill()` çağrıları kaybolur.
- React state'ine bağlı bir görünürlüğü doğrularken sabit `waitForTimeout`
  kullanma, `waitFor*` ile durumu bekle. `save-hint` testleri böyle
  kayanlaşıyordu: `validate()` yeniden render olmadan oku göstermiyor,
  doğrulama bazen render gelmeden çalışıyordu. Arka arkaya 5 `fill()`
  çağrısının state'i batch'lemesi bu yarışı üretiyor.

### Asıl uygulama kodunda hangi beklemelere ihtiyaç yok

Bu beklemeler **test altyapısı** içindir. `save-gallery-hint` oku React'te
koşullu render ediliyor; DOM'a anında girmesi beklenmez ve
`waitForSaveHint` bunu yok sayarak yazıldı. Ürün kodunda
`setTimeout`/`flushSync` gibi bir şey **eklenmedi** — testin zamanlamayı
kabul etmesi, uygulamanın hızlanması değildir.