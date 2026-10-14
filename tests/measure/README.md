# Ölçüm betikleri

`tests/e2e/` **testlerdir**: geçer/kırılır, `npm test` onları koşar ve bir
regresyonu yakalar.

Buradaki dosyalar **ölçüm betikleridir**: konsola tablo basarlar, "geçti"
demezler. Geometriyi gözle değil sayılarla görmek ve bir şüpheyi ölçerek
doğrulamak için yazıldılar. `npm test` bunları **koşmaz** — adları
`*.test.mjs` değildir.

## Çalıştırma

Hepsi bir dev sunucusuna ihtiyaç duyar:

```sh
npm run dev          # ayrı bir terminalde, 5173 portunda açık olmalı
npm run measure:all
```

`APP_URL` farklıysa: `APP_URL=http://localhost:5174 npm run measure:all`

| Komut | Betik | Ne ölçer |
|---|---|---|
| `npm run measure:all` | `scan-all.mjs` | 7 şablon × {1,2 grup} × {0-5 kan tipi}: herhangi iki metin kutusunun dikey bindirmesi, yatay taşma, kan grubu sarması |
| `npm run measure:fields` | `scan-fields.mjs` | Aynı tarama ama `fullName`/`phone`/`hospital`/`location` **doldurulmuş** halde |
| `npm run measure:ink` | `measure-ink-gap.mjs` | `bloodType` ile altındaki metin arasındaki **gerçek metin** boşluğu |
| `npm run measure:arrow` | `check-arrow.mjs` | Form adım adım dolarken yönlendirme okunun görünür/görünmez olması |

Geri kalanlar tek konulu tanı betikleri:

| Betik | Konu |
|---|---|
| `diag-bloodtype-click.mjs` | **Kök neden.** `force: true` yüzünden tıklama animasyondaki kutuya düşüyor ve `bloodType` seçimi kayboluyor. Ölçülen: tıklamadan önce/sonra `li` kutusunun konumu |
| `diag-bloodtype-seq.mjs` | Aynı kayıp, seçim sırasına bağlı mı diye |
| `diag-sequence.mjs` | `bloodGroup` seçim sırasının sonucu etkileyip etkilemediği |
| `diag-fill-form.mjs` | `fillWholeForm` 40 turda aynı duruma geliyor mu |
| `diag-download-modal.mjs` | Ok varken butona basınca hangi modal çıkıyor (8 tur, özet tablo) |
| `diag-t2-1group.mjs` | Template 2 tek grup: en büyük güvenli fontu sayfada inline uygulayarak tarar |
| `diag-t2-ab.mjs` | Aynı tarama, en geniş metin `AB RH (+)` için |
| `diag-t2-all-items.mjs` | Template 2'de tüm metin kutularının dökümü |
| `diag-t2-bloodtype.mjs` | Template 2'de `bloodType` kutusu, 1-4 kan tipi |
| `verify-t2.mjs` | Template 2 tek grup düzeltmesinin gerçek render sonucu (7 grubun hepsi) |
| `scan-3types.mjs` | **3 kan tipi bandı** — hiç test etmeyen aralık |
| `measure-ink.mjs` | `bloodType` kutusu vs gerçek metin genişliği (`right` tuzağını gösterir) |
| `prove-fields.mjs` | Alan taramasının **boş çalışmadığını** kanıtlar (kutu sayısını ve metinleri basar) |

## İki ölçüm tuzağı

Bu betiklerde sayıları iki kez yanlış okuduğum için burada yazılı.

**1. Kutu `right`'ı taşma ölçümü olamaz.** `.text-item` `position: absolute`
ve genişliği yok → shrink-to-fit, ama containing block'a **kırpılır**. Bu
yüzden kutu `right`'ı daima `left + (360 − left)` = 360'tır; yedi şablonun
hepsinde 360 çıkar ve "T2'ye özgü kusur" gibi görünür. Gerçek metin 4+ kan
tipinde 313–340px'te bitiyor, yani **20–47px** pay var. `measure-ink.mjs`
ikisini yan yana basar.

**2. Kutu boşluğu görsel boşluğun üstündedir.** `.text-item` `line-height: 1.5`
kullanıyor → her satırın üstünde/altında %25 leading var. 4+ kan tipinde
`bloodType` iki satıra sarıyor ve kutu boşluğu T7'de **0px**, T2/T3/T4'te
**1px** çıkıyor; gerçek metin boşluğu ise **4–5px**, yani görünür çakışma
yok. Bu yüzden çerçeve taşması ve bindirme kontrolleri
`Range.getClientRects()` üzerinden **gerçek metin** kutusunu kullanmalı —
`measure-ink-gap.mjs` bunu yapar, `measureBloodTypeBox()` (helpers) de aynısını
yapar ve kalıcı testler onu kullanır.

## Ölçüm disiplini

- **Hiçbir zaman şablonlar arası karşılaştırma.** Bir şablonun bandı başka
  bir şablonun `bloodType` değeriyle karşılaştırılırsa sonuç yanlış olur;
  karşılaştırma her zaman aynı şablon içinde yapılır.
- **"0 bulgu" ancak dolu sayfa varsa anlamlı.** `scan-fields.mjs` "0 bulgu"
  dedi ama 160 karakterlik adresle çalışmıştı; `location` dalları 240/260'ta
  tetiklendiği için o bölge hiç ölçülmemişti. `prove-fields.mjs` kutu
  sayısını basarak boş çalışmayı engeller.
- **Yeni test boş çalışmamalı.** Kural eklendiğinde önce kasten bozulmalı,
  gerçek sayılarla düştüğü görülmeli, sonra geri alınmalı.

### Öğeleri isimlendirme: indis değil, içerik

`diag-t2-all-items.mjs` bir süre **yanlış etiket** basıyordu. `.text-item`
elemanlarına `NAMES[i]` ile isim veriyordu, ama `bloodGroup2` **koşullu**:
tek grup seçildiğinde hiç çizilmiyor, liste kayıyor ve `bloodType`
"bloodGroup2", `date` ise "phone" diye görünüyordu. Bu etiketleme oturumda
yanlış bir sonuca yol açtı.

Öğeleri **içerikleriyle** bulun: kan grubu satırlarını
`.text-item.blood-group` sınıfıyla, `bloodType`'ı ham değeriyle
(`"Kırmızı"`), `multiline` olanları sınıfıyla. `BaseTemplateComponent`
koşullu öğeler çizdiği için sıra sabit **değildir**.

`measureBloodTypeBox()` (helpers) ve `scan-3types.mjs` bu yöntemi kullanır.

### Betikler de kırılabilir

`diag-bloodtype-seq.mjs` işini doğru yapıyor, son satırda çöküyordu:
`for (let round = ...)` içindeki `round` `let` blok kapsamlı olduğu için
döngü dışında erişilemiyordu. `node --check` bunu yakalamaz — sözdizimi
geçerlidir. Bu yüzden betikler **çalıştırılarak** doğrulanmalı.
