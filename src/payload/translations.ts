/**
 * Payload'un Türkçe arayüz metinlerinde düzeltmeler: İngilizce kalanlar
 * ("Or", "Order") ve yanlış çeviriler (arama kutusu "Şuna göre sırala"
 * diyordu, oysa arar). Yalnız değişen anahtarlar yazılır; gerisi Payload'dan.
 */
export const trOverrides = {
  general: {
    searchBy: "Ara: {{label}}",
    or: "veya",
    /* sayfalama: "1-10 / 46" */
    of: "/",
    order: "Sıra",
    noResultsFound: "Henüz kayıt yok",
    noResultsDescription: "Burada henüz kayıt yok ya da seçtiğiniz filtrelere uyan bir kayıt bulunamadı.",
    createNewLabel: "Yeni {{label}} ekle",
    successfullyCreated: "{{label}} eklendi.",
    updatedSuccessfully: "Kaydedildi. Sitedeki sayfa birkaç saniye içinde güncellenir.",
  },
  authentication: {
    lockUntil: "Kilit süresi",
  },
  fields: {
    chooseBetweenCustomTextOrDocument: "Özel bir adres yazın ya da başka bir kayda bağlantı verin.",
    itemsAndMore: "{{items}} ve {{count}} tane daha",
    labelRelationship: "{{label}} ilişkisi",
    relationTo: "Bağlı olduğu bölüm",
  },
  folder: {
    browseByFolder: "Klasörler",
    searchByNameInFolder: "{{folderName}} içinde ara",
    itemsMovedToFolder: "{{title}}, {{folderName}} klasörüne taşındı.",
  },
  version: {
    confirmRevertToSaved: "Kaydedilmiş sürüme dönmeyi onaylayın",
    draftSavedSuccessfully: "Taslak kaydedildi. Yayınlayana kadar sitede görünmez.",
  },
};
