import { UTMESyllabus } from './types';
import { CHEMISTRY_SYLLABUS, BIOLOGY_SYLLABUS, COMPUTER_STUDIES_SYLLABUS, AGRICULTURE_SYLLABUS } from './scienceSyllabuses';
import { PHYSICS_SYLLABUS, MATHEMATICS_SYLLABUS, PHE_SYLLABUS } from './scienceSyllabuses2';
import { COMMERCE_SYLLABUS, ECONOMICS_SYLLABUS, GEOGRAPHY_SYLLABUS, GOVERNMENT_SYLLABUS } from './socialScienceSyllabuses';
import { ACCOUNTING_SYLLABUS, HOME_ECONOMICS_SYLLABUS } from './commercialSyllabuses';
import { CRS_SYLLABUS, FRENCH_SYLLABUS, ART_SYLLABUS, ARABIC_SYLLABUS } from './artsSyllabuses';
import { USE_OF_ENGLISH_SYLLABUS, LITERATURE_IN_ENGLISH_SYLLABUS, IRS_SYLLABUS, HISTORY_SYLLABUS, MUSIC_SYLLABUS } from './artsSyllabuses2';
import { YORUBA_SYLLABUS, IGBO_SYLLABUS, HAUSA_SYLLABUS } from './languageSyllabuses';

export * from './types';
export * from './scienceSyllabuses';
export * from './scienceSyllabuses2';
export * from './socialScienceSyllabuses';
export * from './commercialSyllabuses';
export * from './artsSyllabuses';
export * from './artsSyllabuses2';
export * from './languageSyllabuses';

export const ALL_UTME_SYLLABUSES: UTMESyllabus[] = [
  // Science
  PHYSICS_SYLLABUS,
  CHEMISTRY_SYLLABUS,
  BIOLOGY_SYLLABUS,
  MATHEMATICS_SYLLABUS,
  COMPUTER_STUDIES_SYLLABUS,
  AGRICULTURE_SYLLABUS,
  PHE_SYLLABUS,

  // Social Science & Commercial
  ECONOMICS_SYLLABUS,
  COMMERCE_SYLLABUS,
  ACCOUNTING_SYLLABUS,
  GEOGRAPHY_SYLLABUS,
  GOVERNMENT_SYLLABUS,
  HOME_ECONOMICS_SYLLABUS,

  // Arts & General
  USE_OF_ENGLISH_SYLLABUS,
  LITERATURE_IN_ENGLISH_SYLLABUS,
  CRS_SYLLABUS,
  IRS_SYLLABUS,
  HISTORY_SYLLABUS,
  MUSIC_SYLLABUS,
  FRENCH_SYLLABUS,
  ART_SYLLABUS,
  ARABIC_SYLLABUS,

  // Languages
  YORUBA_SYLLABUS,
  IGBO_SYLLABUS,
  HAUSA_SYLLABUS
];

export const getSyllabusById = (id: string): UTMESyllabus | undefined => {
  const normalized = id.toLowerCase().trim();
  return ALL_UTME_SYLLABUSES.find(s => s.id === normalized || s.subject.toLowerCase() === normalized);
};

export const searchSyllabuses = (query: string): { syllabus: UTMESyllabus; matchedTopic?: string }[] => {
  if (!query || !query.trim()) {
    return ALL_UTME_SYLLABUSES.map(s => ({ syllabus: s }));
  }

  const token = query.toLowerCase().trim();
  const results: { syllabus: UTMESyllabus; matchedTopic?: string }[] = [];

  ALL_UTME_SYLLABUSES.forEach(syl => {
    let matchFound = false;
    let firstMatchedTopicTitle: string | undefined = undefined;

    if (syl.subject.toLowerCase().includes(token) || syl.category.toLowerCase().includes(token)) {
      matchFound = true;
    }

    if (syl.topics) {
      syl.topics.forEach(top => {
        if (
          top.title.toLowerCase().includes(token) ||
          top.contents.some(c => c.toLowerCase().includes(token)) ||
          top.objectives.some(o => o.toLowerCase().includes(token))
        ) {
          matchFound = true;
          if (!firstMatchedTopicTitle) firstMatchedTopicTitle = top.title;
        }
      });
    }

    if (syl.sections) {
      syl.sections.forEach(sec => {
        sec.topics.forEach(top => {
          if (
            top.title.toLowerCase().includes(token) ||
            top.contents.some(c => c.toLowerCase().includes(token)) ||
            top.objectives.some(o => o.toLowerCase().includes(token))
          ) {
            matchFound = true;
            if (!firstMatchedTopicTitle) firstMatchedTopicTitle = top.title;
          }
        });
      });
    }

    if (matchFound) {
      results.push({ syllabus: syl, matchedTopic: firstMatchedTopicTitle });
    }
  });

  return results;
};
