import { MODULES_01_02 } from './modules01_02.js';
import { MODULE_03_DATA_STORAGE } from './module03_data.js';
import { MODULES_04_05 } from './modules04_05.js';
import { MODULES_06_09 } from './modules06_09.js';
import { MODULE_10_WHOLE_SYSTEMS } from './module10_hld_systems.js';
import { MODULE_14_ADVANCED_HLD } from './module14_advanced_hld.js';
import { MODULE_13_IN_THE_WILD } from './module13_in_the_wild.js';
import { MODULE_11_LLD_CORE } from './module11_lld_core.js';
import { MODULE_12_LLD_SYSTEMS } from './module12_lld_systems.js';
import { DISTRIBUTED_CORRECTNESS } from './distributedCorrectness.js';
import { PRODUCTION_ENGINEERING } from './productionEngineering.js';
import { DATA_PLATFORMS } from './dataPlatforms.js';
import {
  EXTRA_MOD_01_FOUNDATIONS,
  EXTRA_MOD_02_SCALING,
  EXTRA_MOD_03_DATA,
  EXTRA_MOD_06_ARCH,
  EXTRA_MOD_07_SECURITY,
  EXTRA_MOD_08_SHIPPING,
} from './karanGapClosures.js';

const EXTRA_BY_MODULE_ID = {
  'mod-01-foundations': EXTRA_MOD_01_FOUNDATIONS,
  'mod-02-scaling': EXTRA_MOD_02_SCALING,
  'mod-03-data-storage': EXTRA_MOD_03_DATA,
  'mod-06-architecture': EXTRA_MOD_06_ARCH,
  'mod-07-security': EXTRA_MOD_07_SECURITY,
  'mod-08-shipping': EXTRA_MOD_08_SHIPPING,
};

const RAW_MODULES = [
  ...MODULES_01_02,
  MODULE_03_DATA_STORAGE,
  ...MODULES_04_05,
  ...MODULES_06_09,
  MODULE_10_WHOLE_SYSTEMS,
  MODULE_14_ADVANCED_HLD,
  MODULE_13_IN_THE_WILD,
  MODULE_11_LLD_CORE,
  MODULE_12_LLD_SYSTEMS,
  DISTRIBUTED_CORRECTNESS,
  PRODUCTION_ENGINEERING,
  DATA_PLATFORMS,
];

// Preserve published lesson IDs as modules grow.
export const CURRICULUM_MODULES = RAW_MODULES.map((m, idx) => ({
  ...m,
  number: String(idx + 1).padStart(2, '0'),
  lessons: [...m.lessons, ...(EXTRA_BY_MODULE_ID[m.id] || [])],
}));

const allLessons = CURRICULUM_MODULES.flatMap((moduleMeta) =>
  moduleMeta.lessons.map((lesson, lessonIndexInModule) => ({ lesson, moduleMeta, lessonIndexInModule }))
);
const lessonsById = new Map(allLessons.map((entry, index) => [entry.lesson.id, {
  ...entry,
  prevLesson: allLessons[index - 1]?.lesson || null,
  nextLesson: allLessons[index + 1]?.lesson || null,
}]));

export function getAllLessons() {
  return allLessons;
}

export function findLessonById(lessonId) {
  return lessonsById.get(lessonId) || null;
}
