import type { FaqItem } from "@/components/site/FaqGrid";

/**
 * Hizmet detay sayfalarındaki SSS (her hizmet için 6 soru).
 * Kural: uydurma rakam, süre ya da sonuç vaadi yok; kapsam teklif aşamasında netleşir.
 */
export const serviceFaq: Record<string, FaqItem[]> = {
  "sosyal-medya-yonetimi": [
    {
      q: "Hangi platformlarda hesap yönetiyorsunuz?",
      a: "Instagram, Facebook, TikTok, LinkedIn ve YouTube başta olmak üzere hedef kitlenizin bulunduğu platformlarda çalışıyoruz. Hangi platforma öncelik verileceğini markanızın hedeflerine ve kitlenizin davranışına göre birlikte belirliyoruz.",
    },
    {
      q: "İçerik planı nasıl hazırlanıyor ve onaylanıyor?",
      a: "Stratejiye uygun bir içerik planı hazırlayıp yayından önce size sunuyoruz. Paylaşımlar sizin onayınızla yayına alınır; düzenleme talepleriniz plan aşamasında değerlendirilir.",
    },
    {
      q: "Yorum ve mesajları siz mi yanıtlıyorsunuz?",
      a: "Topluluk yönetimi kapsamında yorum ve mesajları birlikte belirlediğimiz yanıt diliyle takip ediyoruz. Teknik ya da satışa özel sorular için sizinle önceden bir yönlendirme akışı kuruyoruz.",
    },
    {
      q: "Reklam bütçesi hizmet bedeline dahil mi?",
      a: "Hayır. Reklam bütçesi platformlara doğrudan ödenen, hizmet bedelinden ayrı bir kalemdir. Bütçenin nasıl dağıtılacağını hedeflerinize göre birlikte planlıyor, harcamaları raporlarda açıkça gösteriyoruz.",
    },
    {
      q: "Raporlama nasıl yapılıyor?",
      a: "Erişim, etkileşim, takipçi gelişimi ve reklam sonuçlarını içeren düzenli raporlar paylaşıyoruz. Rapor sıklığını ve takip edilecek göstergeleri çalışmanın başında birlikte belirliyoruz.",
    },
    {
      q: "Mevcut hesaplarımızı devralabilir misiniz?",
      a: "Evet. Önce mevcut hesaplarınızı, içerik geçmişinizi ve rakiplerinizi inceliyoruz. Ardından markanızın sesini koruyarak yeni stratejiye geçişi adım adım planlıyoruz.",
    },
  ],
  "grafik-tasarim": [
    {
      q: "Logo tasarım süreci nasıl ilerliyor?",
      a: "Markanızı, sektörünüzü ve hedef kitlenizi anlamak için kısa bir keşif görüşmesiyle başlıyoruz. Ardından farklı yönlerde konsept önerileri hazırlıyor, seçtiğiniz yönü geri bildirimlerinizle birlikte netleştiriyoruz.",
    },
    {
      q: "Revizyon hakkı nasıl belirleniyor?",
      a: "Revizyon kapsamını teklif aşamasında projenin büyüklüğüne göre açıkça yazıyoruz. Böylece süreç baştan bellidir ve sonuca birlikte, planlı biçimde ulaşırız.",
    },
    {
      q: "Teslim edilen dosyalar hangi formatlarda oluyor?",
      a: "Baskı için vektörel ve yüksek çözünürlüklü dosyalar, dijital kullanım için web uyumlu formatlar teslim ediyoruz. Kurumsal kimlik çalışmalarında renk, yazı tipi ve kullanım kurallarını bir arada gösteren bir kılavuz da hazırlıyoruz.",
    },
    {
      q: "Tasarımlar baskıya hazır teslim ediliyor mu?",
      a: "Evet. Basılı işleri ölçü, renk ve taşma payı ayarları yapılmış olarak teslim ediyoruz. Matbaa ile koordinasyona ihtiyaç duyarsanız bunu teklif aşamasında birlikte planlayabiliriz.",
    },
    {
      q: "Mevcut logomuzu yenileyebilir misiniz?",
      a: "Evet. Markanızın tanınırlığını koruyarak logonuzu sadeleştirebilir ya da güncel kullanım alanlarına uygun hale getirebiliriz. Yenilemenin mi yoksa baştan tasarımın mı doğru olduğuna ilk incelemeden sonra birlikte karar veriyoruz.",
    },
    {
      q: "Ambalaj tasarımında nelere dikkat ediyorsunuz?",
      a: "Rafta fark edilmeyi, ürün bilgilerinin okunurluğunu ve marka bütünlüğünü birlikte gözetiyoruz. Ambalajın ölçü, malzeme ve üretim gereksinimlerini tasarıma başlamadan önce netleştiriyoruz.",
    },
  ],
  "icerik-uretimi": [
    {
      q: "Hangi tür içerikler üretiyorsunuz?",
      a: "Sosyal medya metinleri, web sitesi ve blog içerikleri, reklam metinleri, slogan ve kampanya konseptleri üretiyoruz. Her içeriği yayınlanacağı mecranın diline ve formatına göre kurguluyoruz.",
    },
    {
      q: "Markamızın dilini nasıl öğreniyorsunuz?",
      a: "Markanızı, hedef kitlenizi ve mevcut iletişiminizi inceleyerek başlıyoruz. Gerekirse ton, üslup ve kelime tercihlerini içeren bir marka dili rehberi hazırlıyor, tüm içeriklerde bu rehberi esas alıyoruz.",
    },
    {
      q: "SEO uyumlu içerik ne demek?",
      a: "Arama yapan kişilerin sorusuna gerçekten yanıt veren, doğru anahtar kelimelerle kurgulanmış ve kolay okunan içerik demek. Başlık yapısı, iç bağlantılar ve meta açıklamalar da bu çalışmanın parçasıdır.",
    },
    {
      q: "İçerikler yayından önce onayımıza sunuluyor mu?",
      a: "Evet. Tüm içerikler yayından önce onayınıza sunulur ve geri bildirimlerinize göre son haline getirilir.",
    },
    {
      q: "Metin ve görsel üretimi birlikte mi yürüyor?",
      a: "Evet. Metin yazarlarımız ve tasarım ekibimiz aynı süreçte çalışıyor. Böylece metin ile görsel aynı fikri anlatıyor ve içerik yayına bütün olarak hazırlanıyor.",
    },
    {
      q: "Yalnızca blog içeriği için çalışabilir miyiz?",
      a: "Evet. İhtiyacınıza göre yalnızca blog içeriği, yalnızca sosyal medya metinleri ya da kampanya bazlı işler için de çalışabiliriz. Kapsamı ilk görüşmede birlikte belirliyoruz.",
    },
  ],
  "web-tasarim": [
    {
      q: "Web sitesi projesi nasıl ilerliyor?",
      a: "Önce hedeflerinizi, içerik yapınızı ve ihtiyaç duyduğunuz sayfaları netleştiriyoruz. Ardından tasarım, geliştirme, içerik yerleşimi ve test aşamalarını tamamlayıp siteyi yayına alıyoruz.",
    },
    {
      q: "Siteyi kendimiz güncelleyebilecek miyiz?",
      a: "İhtiyacınıza göre içerikleri kendiniz güncelleyebileceğiniz bir yönetim paneli kuruyoruz. Yayından sonra panelin kullanımını ekibinize anlatıyoruz.",
    },
    {
      q: "Site mobil cihazlarda da düzgün görünecek mi?",
      a: "Evet. Sitelerimizi telefon, tablet ve masaüstünde düzgün çalışacak şekilde tasarlıyor, yayından önce farklı ekran boyutlarında test ediyoruz.",
    },
    {
      q: "SEO için neler yapıyorsunuz?",
      a: "Hızlı açılan sayfalar, düzgün başlık yapısı, meta açıklamalar, site haritası ve arama motorlarının sayfaları doğru okumasını sağlayan teknik ayarları kurulumun parçası olarak ele alıyoruz.",
    },
    {
      q: "E-ticaret sitesi de yapıyor musunuz?",
      a: "Evet. Ürün kataloğu, sepet ve ödeme adımlarını içeren e-ticaret altyapıları kuruyoruz. Hangi altyapının işinize uygun olduğunu ürün yapınıza ve operasyonunuza göre birlikte seçiyoruz.",
    },
    {
      q: "Yayından sonra destek veriyor musunuz?",
      a: "Evet. Bakım, güncelleme ve teknik destek hizmetlerimizin bir parçası. Destek kapsamını teklif aşamasında birlikte belirliyoruz.",
    },
  ],
  "dijital-pazarlama": [
    {
      q: "Hangi platformlarda kampanya yönetiyorsunuz?",
      a: "Google ve Meta başta olmak üzere TikTok, LinkedIn ve hedef kitlenize uygun diğer platformlarda kampanya yönetiyoruz. Mecra seçimini hedeflerinize ve bütçenize göre yapıyoruz.",
    },
    {
      q: "ROAS nedir, neden önemsiyorsunuz?",
      a: "ROAS, reklama harcanan her liranın ne kadar gelir getirdiğini gösteren orandır. Kampanyaları yalnızca tıklama ya da gösterimle değil, işinize kattığı gelirle değerlendirmek için bu göstergeyi takip ediyoruz.",
    },
    {
      q: "Reklam bütçesini kim belirliyor?",
      a: "Bütçeyi hedeflerinizi, sektörünüzü ve mevcut verilerinizi birlikte değerlendirerek belirliyoruz. Kampanya ilerledikçe sonuçlara göre bütçenin mecralar arasındaki dağılımını yeniden düzenliyoruz.",
    },
    {
      q: "Sonuçları ne zaman görmeye başlarız?",
      a: "Bu süre sektöre, bütçeye ve hesabın geçmişine göre değişir. İlk dönemde veriyi topluyor ve hedeflemeyi iyileştiriyoruz; ilerlemeyi düzenli raporlarla sizinle paylaşıyoruz.",
    },
    {
      q: "Reklam hesapları kimin adına açılıyor?",
      a: "Reklam hesaplarının markanız adına açılmasını ve sahipliğin sizde kalmasını öneriyoruz. Biz bu hesaplara yönetici erişimiyle bağlanarak çalışıyoruz.",
    },
    {
      q: "Google Partner olmanız bize ne kazandırır?",
      a: "Google Partner rozeti, kampanyalarımızın Google'ın performans ve yetkinlik standartlarını karşıladığını gösterir. Sizin için bu, hesabınızın güncel uygulamalara uygun biçimde yönetilmesi anlamına gelir.",
    },
  ],
  "video-tasarimi": [
    {
      q: "Hangi tür videolar üretiyorsunuz?",
      a: "Reels, TikTok ve Shorts için dikey videolar, ürün ve hizmet tanıtımları, motion graphics ve animasyonlar, reklam videoları ve kurumsal tanıtım filmleri üretiyoruz.",
    },
    {
      q: "Video üretim süreci nasıl ilerliyor?",
      a: "Fikir ve senaryoyla başlıyor, çekim planı, kurgu, müzik ve grafiklerle devam ediyoruz. Her aşamada onayınızı alarak ilerliyor, videoyu yayınlanacağı platforma uygun formatta teslim ediyoruz.",
    },
    {
      q: "Çekim gerektirmeyen videolar da hazırlıyor musunuz?",
      a: "Evet. Motion graphics ve animasyonla, mevcut ürün görselleriniz ve marka materyallerinizle çekim gerektirmeyen videolar hazırlayabiliyoruz.",
    },
    {
      q: "Videolar hangi formatlarda teslim ediliyor?",
      a: "Her videoyu yayınlanacağı mecraya göre dikey, kare ya da yatay formatta hazırlıyoruz. Aynı içeriğin farklı platformlara uyarlanmış sürümlerini de üretebiliyoruz.",
    },
    {
      q: "Müzik ve ses kullanımını nasıl ele alıyorsunuz?",
      a: "Kullanım hakkı net olan müzik ve ses kaynaklarıyla çalışıyoruz. Lisans koşullarını videonun yayınlanacağı mecraya göre önceden kontrol ediyoruz.",
    },
    {
      q: "Videolar reklam kampanyalarında da kullanılabilir mi?",
      a: "Evet. Reklam videolarını ilk saniyelerde dikkat çekecek ve sessiz izlemede de anlaşılacak şekilde kurguluyoruz. Dijital pazarlama ekibimizle birlikte kampanyaya uygun sürümler hazırlıyoruz.",
    },
  ],
};
