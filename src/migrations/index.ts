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
];
