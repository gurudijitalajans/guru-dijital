import * as migration_20261008_230803_ilk_kurulum from './20261008_230803_ilk_kurulum';
import * as migration_20261009_132146_medya_klasorleri from './20261009_132146_medya_klasorleri';
import * as migration_20261009_143301_crm from './20261009_143301_crm';
import * as migration_20261009_151131_operation from './20261009_151131_operation';

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
    name: '20261009_151131_operation'
  },
];
