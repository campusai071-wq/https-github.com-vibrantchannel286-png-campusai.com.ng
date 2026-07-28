import { UTMESyllabus } from './types';

export const YORUBA_SYLLABUS: UTMESyllabus = {
  id: 'yoruba',
  subject: 'Yorùbá',
  category: 'Arts',
  generalObjectives: [
    'Stimulate and sustain interest in Yorùbá language, literature and culture.',
    'Acquire basic knowledge and skill in Yorùbá language, literature, and material/non-material culture.'
  ],
  sections: [
    {
      id: 'yor-sec-a',
      sectionCode: 'SECTION A',
      title: 'ÉDÈ (LANGUAGE)',
      topics: [
        {
          id: 'yor-1-1',
          topicNumber: 1,
          title: 'Comprehension, Essay and Orthography (Àkàwé, Àrokọ àti Àkọtọ́)',
          contents: [
            'Àkàwé (Comprehension): Prose and Verse passages',
            'Àrokọ (Essay Writing): Argumentative, Descriptive, Narrative, Formal/Informal Letter Writing',
            'Àkọtọ́ Òde-òní (Current Orthography) and Ìgbufọ̀ (Translation)'
          ],
          objectives: [
            'Identify central ideas in passages, write standard essays, and translate accurately using modern orthography'
          ]
        },
        {
          id: 'yor-1-2',
          topicNumber: 2,
          title: 'Sound System and Grammar (Àpòpò Ìró àti Gírámà)',
          contents: [
            'Production of speech sounds: Consonants (Àpòpò Ìró Ànù) and Vowels (Àpòpò Ìró Ẹfọ́n)',
            'Tones (Àmì Ìró: Ó, Ò, O) and tone changes',
            'Syllable structure (Ìneji) and sound processes (co-vowel occurrence, elision, deletion)',
            'Morphology: Word-formation, loan-word integration',
            'Word classes: Nouns, Verbs, Adjectives, Adverbs, Pronouns, Conjunctions, Prepositions',
            'Phrases, clauses, and sentence structures'
          ],
          objectives: [
            'Analyse organs of speech, tone assignment, sound deletion, word derivation, and syntax'
          ]
        }
      ]
    },
    {
      id: 'yor-sec-b',
      sectionCode: 'SECTION B',
      title: 'LÍTÍRÉṢỌ̀ (LITERATURE)',
      topics: [
        {
          id: 'yor-2-1',
          topicNumber: 1,
          title: 'Oral Literature (Lítíréṣọ̀ Àfenudọ́na)',
          contents: [
            'Prose (Ìtàn Àròsọ): Babalọlá, A. (2023). Àkójọpọ̀ Àlọ́ Ìjàpá (Apá Kejì). Ibadan: UP Plc.',
            'Drama (Eré Oníṣẹ́): Ògúnníran, L. (2022). Eégún Aláré. Ibadan: Golden Pen Publishers.'
          ],
          objectives: [
            'Deduce moral lessons, character roles, and idiomatic expressions in prescribed oral literature'
          ]
        },
        {
          id: 'yor-2-2',
          topicNumber: 2,
          title: 'Written Literature (Lítíréṣọ̀ Àkọsílẹ̀)',
          contents: [
            'Prose (Ìtàn Àròsọ): Ìṣọ̀lá, A. (2023). Ògún Ọmọdé. Ibadan: UP Plc.',
            'Poetry (Ewì): Àdéwọlé, O. (2023). Èdé Àbínibí àti Àwọn Àròfọ̀ Mìíràn. Ibadan: UP Plc. (pp 1-50 for 2026)',
            'Drama (Eré Onítàn): Fádíyà, O. (2023). Ọ̀tẹ̀ Ọyẹ̀. Ibadan: Genius Books.'
          ],
          objectives: [
            'Analyse narrative techniques, poetic devices, themes, and social commentary in prescribed written texts'
          ]
        }
      ]
    },
    {
      id: 'yor-sec-c',
      sectionCode: 'SECTION C',
      title: 'ÀṢÀ ÀTI ÌṢE (CULTURE)',
      topics: [
        {
          id: 'yor-3-1',
          topicNumber: 1,
          title: 'Yorùbá Customs and Beliefs',
          contents: [
            'Èrò àti Ìgbàgbọ́: Olódùmarè, àkùdàájà, ẹmẹ̀rè, àjẹ́, irúnmọlẹ̀',
            'Ètò Ìṣèlú àti Ààbò Ìlú: Ẹgbẹ́, oyè jījẹ, ìjoyè, ogun jíjà',
            'Ètò Ìsìnkú àti Ogún Pínpín: Ókú àgbà, ókú ọ̀fọ̀, mọ̀lẹ́bí',
            'Ònkà Yorùbá: Counting 1 to 20,000 (Óókán títí dé ọ̀kẹ́ kan)',
            'Ètò Ìgbéyàwó àti Ìsọmọlórúkọ',
            'Ètò Ìwòsàn: Ìtọ́jú aláìsàn, aboyún, ẹgbẹ́bí',
            'Eré Ìdárayá: Eré òṣùpá (àlọ́, bojúbojú), Eré ojúmọmọ (ìjàkadì, ayò, ọ̀kòtó)',
            'Iṣẹ́ Àbínibí àti Oúnjẹ Ilẹ̀ Yorùbá: Iṣẹ́-àgbẹ̀, ìṣọ̀nà, ìlù lílù; Oúnjẹ (àbàrí, iyán, ẹ̀wà)',
            'Ẹ̀kọ́ Ilé: Ìwà ọmọluábí'
          ],
          objectives: [
            'Distinguish traditional practices, count in Yorùbá numerals, explain chieftaincy/funeral rites, and demonstrate Ọmọluábí values'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Abíọ́dún, J.', year: '1995', title: 'Àròkọ àti Aáyán Ògbufọ̀', publisher: 'MAJAB Publishers', location: 'Lagos' },
    { author: 'Adéwọlé, L. O. et al.', year: '2000', title: 'Exam Focus – Yorùbá Language for WASSCE/SSCE', publisher: 'UP Plc', location: 'Ibadan' },
    { author: 'Awóbùlúyì, O.', year: '1978', title: 'Essentials of Yorùbá Grammar', publisher: 'UP Plc', location: 'Ibadan' },
    { author: 'Bámgbóṣé, A.', year: '1990', title: 'Fọnọ́lọ́jì àti Gírámà Yorùbá', location: 'Ibadan' },
    { author: 'Adéoyè, C. L.', year: '1979', title: 'Àṣà àti Ìṣe Yorùbá', publisher: 'OUP', location: 'Ibadan' },
    { author: 'Adéoyè, C. L.', year: '1985', title: 'Ìgbàgbọ́ àti Ẹ̀sìn Yorùbá', publisher: 'Oníbonọ̀jé Press', location: 'Ibadan' }
  ],
  lastUpdated: '2026-07-28'
};

export const IGBO_SYLLABUS: UTMESyllabus = {
  id: 'igbo',
  subject: 'Igbo',
  category: 'Arts',
  generalObjectives: [
    'Communicate and read effectively in Igbo.',
    'Analyse issues in the Igbo language.',
    'Interpret and explain figurative and idiomatic expressions in Igbo.',
    'Apply Igbo literature to daily life experiences and demonstrate Igbo cultural values.'
  ],
  sections: [
    {
      id: 'igbo-sec-a',
      sectionCode: 'SECTION A',
      title: 'ASỤSỤ (LANGUAGE)',
      topics: [
        {
          id: 'igbo-1-1',
          topicNumber: 1,
          title: 'Essay, Comprehension, Sounds and Orthography',
          contents: [
            'Edemede (Essay): Akọmakọ (Narrative), Nkọwa (Descriptive), Mgbagha (Argumentative), Ekwumekwu (Speech), Edemleta (Letter), Mkparịtaụka (Dialogue)',
            'Aghọtaazaa (Comprehension): 150-word passage',
            'Ụdaasụsụ (Sounds): Vowels (Ụdaume), Consonants (Mgbochiume), Syllabic nasals (Ụdaimi), Vowel harmony (Ndakọrịta ụdaume), Assimilation (Olilo), Elision (Ndapụ), Tone marking (Akara ụdaolu)',
            'Nsupe na Iwu Nsupe (Spelling rules), Mkpụrụedemede Igbo (Orthography), Olundị na Igbo Izugbe (Dialects & Standard Igbo)'
          ],
          objectives: [
            'Write standardized Igbo essays, mark tones accurately, apply spelling rules, and differentiate standard Igbo from regional dialects'
          ]
        },
        {
          id: 'igbo-1-2',
          topicNumber: 2,
          title: 'Word Derivation, Grammar and Translation',
          contents: [
            'Usoro Mmụbaokwu (Word Derivation): Coinages, loan words, loan-blends',
            'Ụtọasụsụ (Grammar): Parts of speech (Nominals, Verbs, Adjectives, Adverbs, Affixes, Enclitics)',
            'Morpheme structure (Free & Bound morphemes), Words, Phrases (Nkebiokwu), Clauses (Nkebiahịrị), Sentences (Ahịrịokwu)',
            'Ntụgharị (Translation between English and Igbo)'
          ],
          objectives: [
            'Identify parts of speech, classify sentence structures, translate accurately, and identify loan words'
          ]
        }
      ]
    },
    {
      id: 'igbo-sec-b',
      sectionCode: 'SECTION B',
      title: 'AGỤMAGỤ (LITERATURE)',
      topics: [
        {
          id: 'igbo-2-1',
          topicNumber: 1,
          title: 'Literary Devices, Oral and Written Literature',
          contents: [
            'Atụmatụokwu (Literary Devices): Alliteration, assonance, metaphor, simile, hyperbole, personification, proverbs',
            'Agụmagụ Ọnụ (Oral Literature): Folktales (ifo), myths, legends, songs, riddles (agwụgwa), oral drama',
            'Written Prose: Tony U. Ubesie (1993) - Jụọ Obinna',
            'Written Poetry: Inno Ụzọma Nwadike (2014) - Akọnuche (Selected 13 poems: Ọchịchị, Onye Ndu, Nne Ọma, Oke Ọchịchọ, Asịla M Na Ọ Dị Mma, Ihe Ụwa, Jiri Nwayọ, Eziokwu, Mma, Nwanyị, Aja Ala, Ala Igbo, Ndụ M N’ụwa A)',
            'Written Drama: J. C. Maduekwe (1979) - Otu Mkpịsị Aka'
          ],
          objectives: [
            'Analyse poetic devices, characterisation in Jụọ Obinna and Otu Mkpịsị Aka, and evaluate moral lessons from oral/written literature'
          ]
        }
      ]
    },
    {
      id: 'igbo-sec-c',
      sectionCode: 'SECTION C & D',
      title: 'OMENALA, EWUMEWU NA IHE NDỊ NA-EME UGBUA (CUSTOMS & CURRENT AFFAIRS)',
      topics: [
        {
          id: 'igbo-3-1',
          topicNumber: 1,
          title: 'Customs, Traditional Institutions and Current Issues',
          contents: [
            'Ekele (Greetings), Marriage & Divorce, Birth & Ọmụgwọ, Naming, Circumcision, Chieftaincy (Nze na Ọzọ, Igwe, Iyọm)',
            'Funerals (Ike ekpe, Ịkwa ozu), Social structures (Ụmụnna, Ụmụada, Ọhanaeze, Otu ọgbọ), Taboos (Arụ na nsọala)',
            'Worship (Ọfọ, Ikenga), Beliefs (Ọgbanje, Reincarnation/Ịlọ ụwa), Occupations (Farming, Smithing, Fishing), Festivals (Ọfala, Ịwa ji)',
            'Current Affairs & Issues: Ahịajiọkụ/Odenigbo lectures, ISA; HIV/AIDS, Corona, Drug abuse, Cultism, Human rights, Kidnapping'
          ],
          objectives: [
            'Describe Igbo traditional institutions, chieftaincy ranks, religious symbols (Ọfọ, Ikenga), and evaluate solutions to social issues'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Agụ-Ọfọdile, M.C.', year: '2007', title: 'Nkụzi Asụsụ Igbo N’ụzọ Dị Mfe Maka Ndị Sinịọ Sekọndịrị', publisher: 'Austin Modest Publishers', location: 'Ibadan' },
    { author: 'Emenanjọ, E. N. et al.', year: '1999', title: 'Exam Focus Maka WASSCE Na UTME', publisher: 'University Press Plc', location: 'Ibadan' },
    { author: 'Ọfọmata, C. E.', year: '2005', title: 'Ndezu Ụtọasụsụ Igbo', publisher: 'Format Publishers', location: 'Enugu' },
    { author: 'Ubesie, T. U.', year: '1978', title: 'Ọdịnala Ndị Igbo', publisher: 'Oxford University Press', location: 'Ibadan' },
    { author: 'Anọzie, C. C.', year: '2003', title: 'Igbo Kwenu: Akụkọ na Omenala ndị Igbo', publisher: 'Computer Edge Publishers', location: 'Enugu' }
  ],
  lastUpdated: '2026-07-28'
};

export const HAUSA_SYLLABUS: UTMESyllabus = {
  id: 'hausa',
  subject: 'Hausa',
  category: 'Arts',
  generalObjectives: [
    'Acquire the ability to read and write competently in the Hausa language.',
    'Know the basic features of Hausa language (syntax, phonology, morphology and semantics).',
    'Have basic knowledge of oral and written Hausa literature.',
    'Appreciate the culture, customs and institutions of the Hausa people.',
    'Translate competently from English to Hausa.'
  ],
  sections: [
    {
      id: 'ha-sec-a',
      sectionCode: 'SECTION A',
      title: 'HARSHE (LANGUAGE)',
      topics: [
        {
          id: 'ha-1-1',
          topicNumber: 1,
          title: 'Orthography, Comprehension, Composition & Translation (Ƙa’idojin Rubutu, Insha’i da Fassara)',
          contents: [
            'Ƙa’idojin Rubutu (Orthography): Alphabetization, spelling, word division, punctuation in standard Hausa',
            'Auna Fahimta (Comprehension): Unseen passage (~200 words)',
            'Tsarin Rubutun Insha’i (Composition): Argumentative, descriptive, dialogue, expository, narrative, letter writing',
            'Fappara (Translation): Rules, techniques, and translating idioms/proverbs from English to Hausa'
          ],
          objectives: [
            'Apply standard Hausa orthographic rules, write clear compositions, and perform accurate English-Hausa translations'
          ]
        },
        {
          id: 'ha-1-2',
          topicNumber: 2,
          title: 'Phonology, Morphology, Syntax & Semantics (Sauti, Ƙirar Kalma, Ginin Jumla da Ma’ana)',
          contents: [
            'Tsarin Sauti (Phonology): Consonants, vowels (monophthongs/diphthongs), tones (high, low, falling), syllable structures, assimilation, labialization, palatalization',
            'Ƙirar Kalma (Morphology): Roots, stems, affixation, gender/number inflections, noun/verb derivations',
            'Ginin Jumla (Syntax): Word classes, tenses/aspects, mood, nominal vs verbal phrases, simple/compound/complex sentences, relative clauses',
            'Ma’ana (Semantics): Synonyms, antonyms, ambiguity, idioms (maganganun azanci), proverbs (karin magana)'
          ],
          objectives: [
            'Analyse Hausa sound structures, word formation rules, grammatical tenses, sentence classifications, and semantic nuances'
          ]
        }
      ]
    },
    {
      id: 'ha-sec-b',
      sectionCode: 'SECTION B',
      title: 'AL’ADU (CULTURE)',
      topics: [
        {
          id: 'ha-2-1',
          topicNumber: 1,
          title: 'Hausa Customs, Social Life, Occupations & Authority (Rayuwa, Sana’o’i da Sarautu)',
          contents: [
            'Rayuwar Hausawa: Birth customs (haihuwa), marriage (aure), death (mutuwa), modern influences',
            'Zamantakewa: Family setups, Gandu, Gayya, friendship, neighbors, hospitality',
            'Sana’o’in Gargajiya: Farming (noma), blacksmithing (ƙira), tanning (jima), trade, hunting (farauta), barbering (wanzanci)',
            'Material Culture (Kayayyaki): Household items, architecture, traditional food',
            'Festivities & Games: Salla, Kalankuwa, Dambe, Kokawa, Hawan ƙaho, children games',
            'Beliefs & Medicine: Bori, Tsafi, traditional herbs (sassaƙe-sassaƙe), religious remedies'
          ],
          objectives: [
            'Explain rites of passage, family/social structures, traditional occupations, chieftaincy hierarchies, and traditional games'
          ]
        }
      ]
    },
    {
      id: 'ha-sec-c',
      sectionCode: 'SECTION C',
      title: 'ADABI (LITERATURE)',
      topics: [
        {
          id: 'ha-3-1',
          topicNumber: 1,
          title: 'Oral Literature and Prescribed Written Texts (Adabin Baka da Rubutaccen Adabi)',
          contents: [
            'Adabin Baka (Oral Literature): Tatsuniya (folktales), kirari, praise songs, work songs, traditional drama (Tashe)',
            'Rubutaccen Adabi (Written Literature Set Texts 2026-2030):',
            '• Written Prose: Mahe, I. A. - Maraya (Extension Publishers, 2021)',
            '• Written Drama: Gidan Dabino, A. H. - Malam Zalimu (Gidan Dabino Publishers, 2013)',
            '• Written Poetry: Anwar, A. - Waƙoƙin Wayar Da Kai Don Manazarta Hausa Na Ɗaya (ABU Press, 2024)',
            '• Oral Literature Texts: Tofa, B. O. - Mu Sha Dariya; Umar, M. B. - Wasannin Tashe; Gusau, S. M. - Jagoran Nazarin Waƙar Baka'
          ],
          objectives: [
            'Analyse literary themes, plot, characters, and style in Maraya, Malam Zalimu, and prescribed poetry collections'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Sani, M. A. Z.', year: '2000', title: 'Sound System And Grammar', publisher: 'U.P. Plc', location: 'Ibadan' },
    { author: 'Sani, M. A. Z.', year: '2000', title: 'Exams Focus Hausa Language', publisher: 'U.P. Plc', location: 'Ibadan' },
    { author: 'Galadanci, M. K. M.', year: '1984', title: 'An Introduction to Hausa Grammar', publisher: 'Longman Nigeria' },
    { author: 'Madauci, I. et al.', year: '1985', title: 'Hausa Customs', publisher: 'NNPC' },
    { author: 'Dangambo, A.', year: '1984', title: 'Rabe-Raben Adabi Da Muhimmancinsa Ga Rayuwar Hausa', publisher: 'Triumph Publishing', location: 'Kano' }
  ],
  lastUpdated: '2026-07-28'
};
