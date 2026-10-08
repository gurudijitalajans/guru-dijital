import * as migration_20261008_211700_ilk_kurulum from './20261008_211700_ilk_kurulum';

export const migrations = [
  {
    up: migration_20261008_211700_ilk_kurulum.up,
    down: migration_20261008_211700_ilk_kurulum.down,
    name: '20261008_211700_ilk_kurulum'
  },
];
