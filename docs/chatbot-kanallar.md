# Guru Asistan: web sitesi, WhatsApp ve Instagram

Guru Dijital'in sohbet asistanı tek bir beyinle üç kanalda çalışacak şekilde
hazırlandı. Site sekmesi bugün çalışıyor. WhatsApp ve Instagram için kod hazır.
Meta tarafındaki hesaplar ve anahtarlar tanımlanınca açılır; o zamana kadar uç
kapalıdır (`/api/conversations/meta` 404 döner).

## Nasıl çalışır

| Adım | Ne olur |
|---|---|
| Müşteri yazar | Meta mesajı imzalı olarak `POST /api/conversations/meta` adresine iletir (`src/payload/channels/meta.ts`). İmza `META_APP_SECRET` ile doğrulanır. |
| Sohbet bulunur | Aynı numara ya da Instagram hesabı için açık sohbet varsa ona, yoksa yeni sohbet açılır (`channel`: whatsapp / instagram, `externalId`: numara ya da hesap kimliği). |
| Asistan yanıtlar | Site sohbetiyle aynı motor (`botReply`): bilgi tabanı, konu etiketi, ekibe aktarma, randevu araçları. |
| Yanıt gider | Asistanın ya da ekibin yazdığı her mesaj, `chat-messages` kaydındaki kancayla müşterinin kanalına geri gönderilir. |
| Ekip devralır | Panelde Gelen kutusu > Sohbetler'de kanal adı görünür; ekip panelden yazar, mesaj WhatsApp'a ya da Instagram'a gider. |

## Kurulum adımları (bir kez)

1. **Meta Business hesabı** (business.facebook.com): Guru Dijital işletmesi, doğrulanmış.
2. **Meta for Developers** uygulaması: türü "Business"; ürün olarak **WhatsApp** ve **Instagram** eklenir.
3. **WhatsApp Business Platform (Cloud API)**:
   - 0850 308 34 57 numarası WhatsApp Business hesabına bağlanır (numara başka bir WhatsApp uygulamasında kayıtlıysa önce oradan kaldırılmalı; doğrulama sesli arama ya da SMS ile yapılır).
   - Kalıcı erişim anahtarı (System User token, `whatsapp_business_messaging` izni) → `WHATSAPP_TOKEN`.
   - Telefon numarası kimliği (Phone number ID) → `WHATSAPP_PHONE_ID`.
4. **Instagram**: @gurudijital profesyonel hesabı bir Facebook sayfasına bağlanır; uygulamada `instagram_manage_messages` izni ve sayfa erişim anahtarı → `INSTAGRAM_TOKEN`. Instagram ayarlarında "Mesaj araçlarına bağlı uygulamalara izin ver" açılır.
5. **Webhook**: Uygulamanın WhatsApp ve Instagram webhook ayarlarında
   - Geri çağırma adresi: `https://<alan adı>/api/conversations/meta`
   - Doğrulama anahtarı: kendimiz belirlediğimiz uzun bir metin → `META_VERIFY_TOKEN`
   - Abonelik: WhatsApp için `messages`, Instagram için `messages`.
6. **Vercel ortam değişkenleri** (Production): `META_APP_SECRET`, `META_VERIFY_TOKEN`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID`, `INSTAGRAM_TOKEN`, isteğe bağlı `META_TENANT` (varsayılan `guru`). Kaydedip yeniden dağıtın.
7. **Meta uygulama incelemesi**: Canlı kullanım için izinler (`whatsapp_business_messaging`, `instagram_manage_messages`) Meta incelemesinden geçmeli; incelemede gizlilik politikası adresi olarak `/yasal/gizlilik-politikasi` verilir.

## Bilinmesi gerekenler

- **24 saat kuralı (WhatsApp):** Müşterinin son mesajından sonraki 24 saat içinde serbest metinle yanıt verilir. Daha sonra mesaj göndermek için Meta'da onaylı şablon gerekir (bu sürümde yok; ekip yanıtları 24 saat içinde verilmeli).
- **Ücret:** WhatsApp Cloud API konuşma başına Meta tarafından ücretlendirilir; müşterinin başlattığı ve 24 saat içinde yanıtlanan hizmet sohbetleri büyük ölçüde ücretsizdir (güncel tarife Meta'nın fiyat sayfasında).
- **Medya:** Resim, ses ve konum mesajları şimdilik sohbete "[görsel gönderildi]" gibi bir notla düşer; ekip görmek için müşteriden metin isteyebilir. Medya indirme sonraki aşama.
- **KVKK:** Yurt dışına aktarım (Meta, Anthropic) aydınlatma metninde yazılı; standart sözleşme bildirimleri yapılmalı.
- **Müşteri işletmeleri:** Şu an köprü yalnız bir işletmeye (`META_TENANT`) bağlı. Müşterilere satılacak çok işletmeli sürümde her işletmenin numarası ve anahtarı panelde Site bağlantısı ayarlarına taşınacak.
