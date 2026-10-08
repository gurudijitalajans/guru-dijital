# Guru Panel'i canlıya alma

Kod hazır ve yerelde bir test Postgres veritabanıyla uçtan uca denendi.
Canlıya geçiş için üç Guru hesabı ve birkaç ortam değişkeni gerekiyor.

**Hesap kuralı:** Bu işin hiçbir parçası bigkeep'e ait GitHub, Vercel ya da
Supabase hesabında olmaz. Aşağıdaki her şey Vercel'deki Guru takımında
(gurudijitalajans) ve gurudijitalajans@gmail.com ile açılan hesaplarda yapılır.

## 1. Sizin yapacaklarınız

### a) Veritabanı: Neon Postgres (Vercel üzerinden)

1. Vercel'de Guru takımı > **guru-dijital** projesi > **Storage** > **Create Database**.
2. **Neon** (Serverless Postgres) seçin. Bölge: **Frankfurt (eu-central-1)**. Plan: **Free**.
3. Projeye bağlarken ortam olarak **yalnız Production** işaretli kalsın
   (Preview ve Development işaretini kaldırın). Ortam değişkeni ön eki boş kalsın;
   böylece `DATABASE_URL` adıyla eklenir.

### b) Görsel deposu: Vercel Blob

1. Aynı projede **Storage** > **Create** > **Blob**. Ad: `guru-medya`, bölge: Frankfurt.
2. Projeye bağlarken yine **yalnız Production**. `BLOB_READ_WRITE_TOKEN` kendiliğinden eklenir.

### c) E-posta bildirimi: Resend

1. resend.com'da **gurudijitalajans@gmail.com** ile hesap açın.
2. **API Keys** > **Create API Key** (izin: Sending access).
3. gurudijital.com.tr alan adı kayıtlı olmadığı için şimdilik bildirimler yalnız
   bu Gmail adresine gönderilebilir (Resend'in doğrulanmamış hesap kuralı).
   Alan adı alınıp Resend'de doğrulanınca `EMAIL_FROM` eklenir, istenen her adrese gider.

### d) Vercel ortam değişkenleri

Vercel > guru-dijital > **Settings** > **Environment Variables**, ortam: **Production**.

| Ad | Değer |
|---|---|
| `NEXT_PUBLIC_SERVER_URL` | `https://guru-dijital-pied.vercel.app` (alan adı bağlanınca `https://www.gurudijital.com.tr`) |
| `RESEND_API_KEY` | Resend'de oluşturduğunuz anahtar |
| `BILDIRIM_EPOSTA` | `gurudijitalajans@gmail.com` |
| `UMAMI_API_URL` | `https://api.umami.is/v1` |
| `UMAMI_API_KEY` | Umami > Settings > API keys'te oluşturduğunuz anahtar |

`DATABASE_URL` ve `BLOB_READ_WRITE_TOKEN` a ve b adımlarında kendiliğinden eklenir.
`PAYLOAD_SECRET` isteğe bağlı: girilmezse panel anahtarını gizli veritabanı
adresinden türetir.

### e) Taşıma için yerel dosya

`guru-dijital/.env.canli` dosyasını açın (içinde yönerge var). Vercel > Storage >
Neon veritabanı > **.env.local** sekmesi > **Copy Snippet** ile kopyalayıp
dosyaya yapıştırın; aynısını Blob deposu için yapın ve kaydedin. Bu dosyayı
site ve panel okumaz, git'e girmez; yerel panel SQLite'ta kalır. Bitince
Claude'a "hazır" deyin.

## 2. Claude'un yapacakları

1. `npm run panel:tasi`: canlı veritabanında şemayı kurar; yerel paneldeki tüm
   kayıtları (hizmetler, ürünler, blog, ekip, referanslar, vakalar, yorumlar,
   ayarlar, kullanıcılar, talepler) kimlikleri koruyarak aktarır ve `/media`
   klasöründeki görselleri Blob'a yükler. Tek işlemde çalışır: hata olursa hedef
   hiç değişmez. Hedefte veri varsa durur (`--uzerine-yaz` olmadan üzerine yazmaz).
2. `admin-panel` dalını `main`'e birleştirip gönderir. Vercel derlemesi
   (`scripts/vercel-build.mjs`) önce `payload migrate`, sonra `next build` çalıştırır.
3. Canlıda denetler: tüm sayfalar, `/admin` girişi, talep ve randevu formu
   (bildirim e-postası geliyor mu), görsel yükleme.
4. Sonra siz: canlı panele ilk girişte parolanızı değiştirin ve `.env.canli`
   dosyasını silin.

## 3. Yayından önce netleşmesi gerekenler

- **KVKK:** Formlar kişisel veriyi artık veritabanına kaydedecek (Neon, Frankfurt;
  Vercel ve Resend, ABD). Aydınlatma metni ve yurt dışına aktarım bilgisi Guru'dan
  ya da hukuk danışmanından gelmeli; metin gelince form altına bağlantısı eklenir.
- **Vercel planı:** Hobby planı ticari kullanım için değil; ajans sitesi için Pro önerilir.
- **Ücretsiz katmanlar:** Neon, Blob ve Resend'in ücretsiz katmanları bu sitenin
  bugünkü boyutuna yeter; güncel sınırları kayıt sırasında kontrol edin.

## 4. Teknik notlar (geliştirici için)

- Adaptör `DATABASE_URL`'e göre seçilir (`src/payload.config.ts`): `postgres://` ise
  Postgres (şema yalnız `src/migrations` ile değişir, `push: false`), değilse SQLite
  (yerel, şema kendiliğinden güncellenir).
- **Şema değiştiğinde** (yeni alan, koleksiyon) canlıya göndermeden önce geçiş
  dosyası üretilmeli. Geçici bir yerel Postgres ile:

  ```
  docker run -d --name guru-pg-gecis -e POSTGRES_PASSWORD=yerel -e POSTGRES_DB=guru -p 127.0.0.1:55432:5432 postgres:17-alpine
  DATABASE_URL=postgres://postgres:yerel@127.0.0.1:55432/guru npx payload migrate
  DATABASE_URL=postgres://postgres:yerel@127.0.0.1:55432/guru npx payload migrate:create <kisa-ad>
  docker rm -f guru-pg-gecis
  ```

- Blob eklentisi `alwaysInsertFields: true` ile her ortamda aynı şemayı üretir.
  `npm run generate:importmap` eklentinin istemci yükleyicisini haritaya katmak için
  sahte bir anahtarla çalışır; komutu her zaman npm betiğiyle çalıştırın.
- Önizleme derlemeleri canlı şemaya dokunmaz; yalnız `VERCEL_ENV=production`
  derlemesi geçiş uygular.
- Bildirim e-postaları `src/payload/notify.ts`; alıcı `BILDIRIM_EPOSTA`, yoksa
  Site Ayarları > İletişim e-postası. Resend anahtarı yoksa ileti yalnız sunucu
  günlüğüne yazılır; form her durumda çalışır.
