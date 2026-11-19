import { MODULES_01_02 } from './modules01_02.js';
import { MODULE_03_DATA_STORAGE } from './module03_data.js';
import { MODULES_04_05 } from './modules04_05.js';
import { MODULES_06_09 } from './modules06_09.js';
import { MODULE_10_WHOLE_SYSTEMS } from './module10_hld_systems.js';
import { MODULE_11_LLD_CORE } from './module11_lld_core.js';
import { MODULE_12_LLD_SYSTEMS } from './module12_lld_systems.js';

// Complete 12-Module HLD + LLD Curriculum (67 Interactive Step-by-Step Lessons!)
export const CURRICULUM_MODULES = [
  ...MODULES_01_02,
  MODULE_03_DATA_STORAGE,
  ...MODULES_04_05,
  ...MODULES_06_09,
  MODULE_10_WHOLE_SYSTEMS,
  MODULE_11_LLD_CORE,
  MODULE_12_LLD_SYSTEMS,
];

export function getAllLessons() {
  const list = [];
  CURRICULUM_MODULES.forEach((mod) => {
    mod.lessons.forEach((lesson, idx) => {
      list.push({
        lesson,
        moduleMeta: mod,
        lessonIndexInModule: idx,
      });
    });
  });
  return list;
}

export function findLessonById(lessonId) {
  const all = getAllLessons();
  const idx = all.findIndex((entry) => entry.lesson.id === lessonId);
  if (idx === -1) return null;
  return {
    ...all[idx],
    prevLesson: idx > 0 ? all[idx - 1].lesson : null,
    nextLesson: idx < all.length - 1 ? all[idx + 1].lesson : null,
  };
}
