import * as migration_20261008_230803_ilk_kurulum from './20261008_230803_ilk_kurulum';
import * as migration_20261009_132146_medya_klasorleri from './20261009_132146_medya_klasorleri';

export const migrations = [
  {
    up: migration_20261008_230803_ilk_kurulum.up,
    down: migration_20261008_230803_ilk_kurulum.down,
    name: '20261008_230803_ilk_kurulum',
  },
  {
    up: migration_20261009_132146_medya_klasorleri.up,
    down: migration_20261009_132146_medya_klasorleri.down,
    name: '20261009_132146_medya_klasorleri'
  },
];
