import * as migration_20261008_230803_ilk_kurulum from './20261008_230803_ilk_kurulum';
import * as migration_20261009_132146_medya_klasorleri from './20261009_132146_medya_klasorleri';
import * as migration_20261009_143301_crm from './20261009_143301_crm';
import * as migration_20261009_151131_operation from './20261009_151131_operation';
import * as migration_20261009_163510_chatbot from './20261009_163510_chatbot';
import * as migration_20261009_193807_business from './20261009_193807_business';
import * as migration_20261009_204543_cok_kiracili from './20261009_204543_cok_kiracili';
import * as migration_20261009_215414_kanallar from './20261009_215414_kanallar';
import * as migration_20261010_104212_kurulum from './20261010_104212_kurulum';
import * as migration_20261012_120000_ayar_kayitlari from './20261012_120000_ayar_kayitlari';
import * as migration_20261014_014257_buyuk_guncelleme_sema from './20261014_014257_buyuk_guncelleme_sema';
import * as migration_20261014_020000_buyuk_guncelleme_veri from './20261014_020000_buyuk_guncelleme_veri';
import * as migration_20261014_084626_ikinci_tur_sema from './20261014_084626_ikinci_tur_sema';
import * as migration_20261014_090000_ikinci_tur_veri from './20261014_090000_ikinci_tur_veri';
import * as migration_20261014_150000_ucuncu_tur_veri from './20261014_150000_ucuncu_tur_veri';
import * as migration_20261014_170000_dorduncu_tur_veri from './20261014_170000_dorduncu_tur_veri';
import * as migration_20261014_190000_bosluk_duzeni_veri from './20261014_190000_bosluk_duzeni_veri';
import * as migration_20261015_090000_eticaret_vakasi_veri from './20261015_090000_eticaret_vakasi_veri';
import * as migration_20261015_220000_katalog_veri from './20261015_220000_katalog_veri';
import * as migration_20261016_000000_grafik_galeri_veri from './20261016_000000_grafik_galeri_veri';
import * as migration_20261016_010000_reklam_galeri_veri from './20261016_010000_reklam_galeri_veri';
import * as migration_20261016_020000_yazilim_galeri_veri from './20261016_020000_yazilim_galeri_veri';
import * as migration_20261016_030000_seo_galeri_veri from './20261016_030000_seo_galeri_veri';
import * as migration_20261016_040000_eticaret_galeri_veri from './20261016_040000_eticaret_galeri_veri';
import * as migration_20261016_050000_tescil_galeri_veri from './20261016_050000_tescil_galeri_veri';
import * as migration_20261016_060000_mobil_galeri_veri from './20261016_060000_mobil_galeri_veri';
import * as migration_20261016_070000_web_usre_duzeltme from './20261016_070000_web_usre_duzeltme';

export const migrations = [
  {
    up: migration_20261008_230803_ilk_kurulum.up,
    down: migration_20261008_230803_ilk_kurulum.down,
    name: '20261008_230803_ilk_kurulum',
  },
  {
    up: migration_20261009_132146_medya_klasorleri.up,
    down: migration_20261009_132146_medya_klasorleri.down,
    name: '20261009_132146_medya_klasorleri',
  },
  {
    up: migration_20261009_143301_crm.up,
    down: migration_20261009_143301_crm.down,
    name: '20261009_143301_crm',
  },
  {
    up: migration_20261009_151131_operation.up,
    down: migration_20261009_151131_operation.down,
    name: '20261009_151131_operation',
  },
  {
    up: migration_20261009_163510_chatbot.up,
    down: migration_20261009_163510_chatbot.down,
    name: '20261009_163510_chatbot',
  },
  {
    up: migration_20261009_193807_business.up,
    down: migration_20261009_193807_business.down,
    name: '20261009_193807_business',
  },
  {
    up: migration_20261009_204543_cok_kiracili.up,
    down: migration_20261009_204543_cok_kiracili.down,
    name: '20261009_204543_cok_kiracili',
  },
  {
    up: migration_20261009_215414_kanallar.up,
    down: migration_20261009_215414_kanallar.down,
    name: '20261009_215414_kanallar',
  },
  {
    up: migration_20261010_104212_kurulum.up,
    down: migration_20261010_104212_kurulum.down,
    name: '20261010_104212_kurulum',
  },
  {
    up: migration_20261012_120000_ayar_kayitlari.up,
    down: migration_20261012_120000_ayar_kayitlari.down,
    name: '20261012_120000_ayar_kayitlari',
  },
  {
    up: migration_20261014_014257_buyuk_guncelleme_sema.up,
    down: migration_20261014_014257_buyuk_guncelleme_sema.down,
    name: '20261014_014257_buyuk_guncelleme_sema',
  },
  {
    up: migration_20261014_020000_buyuk_guncelleme_veri.up,
    down: migration_20261014_020000_buyuk_guncelleme_veri.down,
    name: '20261014_020000_buyuk_guncelleme_veri',
  },
  {
    up: migration_20261014_084626_ikinci_tur_sema.up,
    down: migration_20261014_084626_ikinci_tur_sema.down,
    name: '20261014_084626_ikinci_tur_sema'
  },
  {
    up: migration_20261014_090000_ikinci_tur_veri.up,
    down: migration_20261014_090000_ikinci_tur_veri.down,
    name: '20261014_090000_ikinci_tur_veri',
  },
  {
    up: migration_20261014_150000_ucuncu_tur_veri.up,
    down: migration_20261014_150000_ucuncu_tur_veri.down,
    name: '20261014_150000_ucuncu_tur_veri',
  },
  {
    up: migration_20261014_170000_dorduncu_tur_veri.up,
    down: migration_20261014_170000_dorduncu_tur_veri.down,
    name: '20261014_170000_dorduncu_tur_veri',
  },
  {
    up: migration_20261014_190000_bosluk_duzeni_veri.up,
    down: migration_20261014_190000_bosluk_duzeni_veri.down,
    name: '20261014_190000_bosluk_duzeni_veri',
  },
  {
    up: migration_20261015_090000_eticaret_vakasi_veri.up,
    down: migration_20261015_090000_eticaret_vakasi_veri.down,
    name: '20261015_090000_eticaret_vakasi_veri',
  },
  {
    up: migration_20261015_220000_katalog_veri.up,
    down: migration_20261015_220000_katalog_veri.down,
    name: '20261015_220000_katalog_veri',
  },
  {
    up: migration_20261016_000000_grafik_galeri_veri.up,
    down: migration_20261016_000000_grafik_galeri_veri.down,
    name: '20261016_000000_grafik_galeri_veri',
  },
  {
    up: migration_20261016_010000_reklam_galeri_veri.up,
    down: migration_20261016_010000_reklam_galeri_veri.down,
    name: '20261016_010000_reklam_galeri_veri',
  },
  {
    up: migration_20261016_020000_yazilim_galeri_veri.up,
    down: migration_20261016_020000_yazilim_galeri_veri.down,
    name: '20261016_020000_yazilim_galeri_veri',
  },
  {
    up: migration_20261016_030000_seo_galeri_veri.up,
    down: migration_20261016_030000_seo_galeri_veri.down,
    name: '20261016_030000_seo_galeri_veri',
  },
  {
    up: migration_20261016_040000_eticaret_galeri_veri.up,
    down: migration_20261016_040000_eticaret_galeri_veri.down,
    name: '20261016_040000_eticaret_galeri_veri',
  },
  {
    up: migration_20261016_050000_tescil_galeri_veri.up,
    down: migration_20261016_050000_tescil_galeri_veri.down,
    name: '20261016_050000_tescil_galeri_veri',
  },
  {
    up: migration_20261016_060000_mobil_galeri_veri.up,
    down: migration_20261016_060000_mobil_galeri_veri.down,
    name: '20261016_060000_mobil_galeri_veri',
  },
  {
    up: migration_20261016_070000_web_usre_duzeltme.up,
    down: migration_20261016_070000_web_usre_duzeltme.down,
    name: '20261016_070000_web_usre_duzeltme',
  },
];
