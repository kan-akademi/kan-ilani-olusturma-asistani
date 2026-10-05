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
| `poster-geometry.test.mjs` | Template 3 ve 4 poster satır geometrisi (15 test) |

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
7. Altı şablonun tamamı seçimli kan grubuyla hatasız render olur.
8. Template 3 ve 4'te iki satırlı kan grupları üst üste binmez, tek
   satıra sarmaz, `bloodType` alanıyla çakışmaz ve çerçeve dışına taşmaz.
9. Hiçbir dropdown seçeneği etiketini iki kez basmaz.

## Poster geometrisi neden ölçülüyor?

İki satıra bölünmüş posterlerde satırlar arası pay **3px**'e kadar
düşüyor. Bu aralıkta gözle kontrol güvenilir değil; 5px'lik bir hata
posterde fark edilmeden geçer. `poster-geometry.test.mjs` bu yüzden
`getBoundingClientRect()` okuyup şu dördünü doğruluyor:

- ardışık satırlar üst üste binmiyor (`lines[i].bottom <= lines[i+1].top`)
- kan grubu metni **tek satıra** sığıyor (`wrappedLines === 1`)
- metin `bloodType` alanına girmiyor
- metin `.image-wrapper` sınırları içinde kalıyor

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

Geometri testleri şu an yalnız **Template 3 ve 4**'ü kapsıyor. Ölçülmüş
olarak tespit edilmiş, henüz dokunulmamış durumlar:

| Şablon | Durum |
|---|---|
| Template 3 | 2 grupta satırlar **24px**, 3 ve 4 grupta **2px** üst üste biniyor. 2 gruplu font 60px iken iki satır 180px istiyor, ama `bloodType` 200px'de kalıyor. |
| Template 6 | 2 grupta satırlar **20px** üst üste biniyor (`bloodType` ile de çakışıyor). |
| Template 2, 5 | 2 ve 3 grupta satırlar üst üste biniyor; 4 grupta temiz. |

Template 1 ve 4, `bloodGroup2` config'i `top: 170` olduğu için bu
sorundan kurtulmuştu; Template 3 ve 4 artık iki satırı açıkça
konumlandırıyor.

Bu tabloyu `tests/e2e/` dışındaki geçici ölçüm betiğiyle ürettim;
kalıcı test kapsamı genişletildiğinde buradaki satırlar silinmelidir.

## Dikkat: MUI'nin açık kalma davranışı

MUI çoklu `Select` bileşeninde liste, her seçimden sonra **açık kalır**. Bu
nedenle seçimler arasında `openDropdown()` çağrılmaz — çağrılırsa modal perdesi
tıklamayı engeller ve Playwright zaman aşımına düşer. Testler bu yüzden tek
açılışta art arda seçim yapar.

Devre dışı seçenekleri sınamak için normal tıklamayı değil `forcePick()`
kullanır; normal tıklama Playwright tarafından reddedilir (`element is not
enabled`), ki bu da davranışın doğru olduğunun bağımsız bir teyididir.

## Yeni test eklerken

- Domain sabitlerini (`REGARDLESS`, `BLOOD_GROUPS`) `helpers.mjs`'ten import et.
- `page.on("pageerror")` ile yakalanan hatalar `launchApp()` içinde toplanır ve
  `after()` bloğunda `assert.deepEqual(pageErrors, [])` ile doğrulanır.
- Testler birbirinden bağımsız olmalı; `page.reload()` ile başlayarak.