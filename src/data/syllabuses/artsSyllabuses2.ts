import { UTMESyllabus } from './types';

export const USE_OF_ENGLISH_SYLLABUS: UTMESyllabus = {
  id: 'english',
  subject: 'Use of English',
  category: 'Arts',
  generalObjectives: [
    'Communicate effectively in both written and spoken English.',
    'Use English Language for learning at the tertiary level.'
  ],
  sections: [
    {
      id: 'eng-sec-a',
      sectionCode: 'SECTION A',
      title: 'COMPREHENSION AND SUMMARY',
      topics: [
        {
          id: 'eng-1-1',
          topicNumber: 1,
          title: 'Passages and Text Comprehension',
          contents: [
            'Description, narration, exposition, argumentation/persuasion passages (~200 words each)',
            'Cloze test passage (10 items)',
            'Comprehension of whole or part of passages, words, phrases, clauses, figures of speech and idioms',
            'Coherence, logical deductions and inferences',
            'JAMB Approved Reading Text',
            'Synthesis of ideas (combining distinct information into concise summary)'
          ],
          objectives: [
            'Identify main points/topic sentences in passages',
            'Determine implied meanings, tone, mood, and writer’s intentions',
            'Identify grammatical functions of words, phrases, clauses and figures of speech',
            'Synthesize ideas and answer prescribed text questions accurately'
          ]
        }
      ]
    },
    {
      id: 'eng-sec-b',
      sectionCode: 'SECTION B',
      title: 'LEXIS AND STRUCTURE',
      topics: [
        {
          id: 'eng-2-1',
          topicNumber: 1,
          title: 'Grammar and Vocabulary (Standard British English)',
          contents: [
            'Synonyms and antonyms',
            'Clause and sentence patterns',
            'Word classes (nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions) and their functions',
            'Mood, tense, aspect, number, agreement/concord, degree (positive, comparative, superlative), question tags',
            'Punctuation and spelling mechanics',
            'Ordinary usage, figurative usage, and formal Standard British English idiomatic usage'
          ],
          objectives: [
            'Identify words in ordinary, figurative, and idiomatic contexts',
            'Determine exact synonyms and antonyms',
            'Differentiate correct and incorrect spellings and grammatical structures',
            'Interpret information conveyed in complex sentences'
          ]
        }
      ]
    },
    {
      id: 'eng-sec-c',
      sectionCode: 'SECTION C',
      title: 'ORAL FORMS',
      topics: [
        {
          id: 'eng-3-1',
          topicNumber: 1,
          title: 'Phonetics and Phonology',
          contents: [
            'Vowels: monophthongs, diphthongs, triphthongs',
            'Consonants: voiceless, voiced, consonant clusters',
            'Rhymes and homophones',
            'Word stress (monosyllabic and polysyllabic words)',
            'Emphatic stress in connected speech'
          ],
          objectives: [
            'Make distinctions among vowel and consonant sound types',
            'Identify homophones, rhyming patterns, and correct syllable stress',
            'Identify the word receiving emphatic stress in an utterance'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Adedimeji, M. A.', year: '2021', title: 'Doses of Grammar', publisher: 'Ahman Pategi University Press', location: 'Patigi' },
    { author: 'Attah, M. O.', year: '2013', title: 'Practice in Spoken English for Intermediate and Advanced Learners', publisher: 'University of Maiduguri Press', location: 'Maiduguri' },
    { author: 'Bamgbose, A.', year: '2002', title: 'English Lexis and Structure for Senior Secondary Schools and Colleges', publisher: 'Heinemann', location: 'Ibadan' },
    { author: 'Banjo, A. et al.', year: '2004', title: 'New Oxford Secondary English Course Book 6', publisher: 'University Press Plc', location: 'Ibadan' },
    { author: 'Caesar, O. J.', year: '2003', title: 'Essential Oral English for Schools and Colleges', publisher: 'Tonad Publishers Limited', location: 'Lagos' },
    { author: 'Jones, Daniel', year: '2011', title: 'Cambridge English Pronouncing Dictionary', publisher: 'Cambridge University Press' },
    { author: 'Ukwuegbu, C. et al.', year: '2002', title: 'Catch-up English for SSCE/UME', publisher: 'Heinemann', location: 'Ibadan' }
  ],
  lastUpdated: '2026-07-28'
};

export const LITERATURE_IN_ENGLISH_SYLLABUS: UTMESyllabus = {
  id: 'literature_in_english',
  subject: 'Literature in English',
  category: 'Arts',
  generalObjectives: [
    'Stimulate and sustain interest in Literature in English.',
    'Create an awareness of general principles of Literature and functions of language.',
    'Appreciate literary works of all genres and across all cultures.',
    'Apply knowledge of Literature in English to understanding cultural, political and economic activities.'
  ],
  topics: [
    {
      id: 'lit-1',
      topicNumber: 1,
      title: 'Drama',
      contents: [
        'Types of drama: Tragedy, Comedy, Tragicomedy, Melodrama, Farce, Opera',
        'Dramatic Techniques: Characterisation, Dialogue, Flashback, Mime, Costume, Music/Dance, Décor/scenery, Acts/Scenes, Soliloquy/aside, Figures of speech',
        'Prescribed Text Analysis (Theme, Plot, Socio-political context, Spatial/Temporal Setting)',
        'Prescribed African Drama: Efua Sutherland - Marriage of Anansewa',
        'Prescribed Non-African Drama: William Shakespeare - Antony and Cleopatra'
      ],
      objectives: [
        'Identify types of drama and dramatic techniques',
        'Analyse themes, plot development, character traits, and settings in prescribed plays'
      ]
    },
    {
      id: 'lit-2',
      topicNumber: 2,
      title: 'Prose',
      contents: [
        'Types of Prose: Fiction (Novel, Novella, Short story), Non-fiction (Biography, Autobiography, Memoir), Faction',
        'Narrative Devices: Point of view (Omniscient, 1st, 2nd, 3rd person, Stream of consciousness, Epiphany), Characterisation (Round, flat, foil, hero/heroine, antihero, villain), Diction',
        'Prescribed African Prose: Pede Hollist - So the Path Does Not Die; Elma Shaw - Redemption Road',
        'Prescribed Non-African Prose: Susanne Bellefeuille - Path of Lucas: The Journey He Endured'
      ],
      objectives: [
        'Distinguish prose genres and narrative points of view',
        'Analyse thematic preoccupation, character relationships, and style in prescribed prose texts'
      ]
    },
    {
      id: 'lit-3',
      topicNumber: 3,
      title: 'Poetry',
      contents: [
        'Poetic Types: Sonnet, Ode, Lyric, Elegy, Ballad, Panegyric, Epic, Blank Verse',
        'Poetic Devices: Imagery, Sound (rhyme, rhythm, repetition, pun, onomatopoeia), Diction, Persona',
        'Prescribed African Poems:',
        '1. Gabriel Okara - "Once Upon a Time"',
        '2. Elizabeth L.A. Kamara - "New Tongue"',
        '3. Wole Soyinka - "Night"',
        '4. Niyi Osundare - "Not My Business"',
        '5. S.O.H. Afriyie-Vidza - "Hearty Garlands"',
        '6. Syl Cheney-Coker - "The Breast of the Sea"',
        'Prescribed Non-African Poems:',
        '1. Lord Byron - "She Walks in Beauty"',
        '2. Geoffrey Chaucer - "The Nun’s Priest’s Tale" (shortened)',
        '3. Fleur Adcock - "The Telephone Call"',
        '4. Wilfred Wilson Gibson - "The Stone"'
      ],
      objectives: [
        'Identify poetic types and analyse poetic devices (imagery, sound, persona)',
        'Appraise moral values and thematic messages in prescribed African and Non-African poems'
      ]
    },
    {
      id: 'lit-4',
      topicNumber: 4,
      title: 'General Literary Terms and Principles',
      contents: [
        'Foreshadowing, suspense, theatre, monologue, dialogue, soliloquy, symbolism, protagonist, antagonist, satire, stream of consciousness, synecdoche, metonymy',
        'Overlaps across genres (verse in drama/poetry, narration in all genres)'
      ],
      objectives: [
        'Define and identify literary terms and genre overlaps'
      ]
    },
    {
      id: 'lit-5',
      topicNumber: 5,
      title: 'Literary Appreciation',
      contents: [
        'Unseen passages and extracts from Drama, Prose and Poetry'
      ],
      objectives: [
        'Identify literary devices and provide accurate interpretation of unseen extracts'
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Efua Sutherland', year: '1975', title: 'Marriage of Anansewa (Prescribed Drama)' },
    { author: 'William Shakespeare', year: '1607', title: 'Antony and Cleopatra (Prescribed Drama)' },
    { author: 'Pede Hollist', year: '2012', title: 'So the Path Does Not Die (Prescribed Prose)' },
    { author: 'Elma Shaw', year: '2008', title: 'Redemption Road (Prescribed Prose)' },
    { author: 'Susanne Bellefeuille', year: '2016', title: 'Path of Lucas: The Journey He Endured (Prescribed Prose)' },
    { author: 'Abrams, M. H.', year: '1981', title: 'A Glossary of Literary Terms (4th Edition)', publisher: 'Holt Rinehart and Winston', location: 'New York' },
    { author: 'Murphy, M. J.', year: '1972', title: 'Understanding Unseen: An Introduction to English Poetry and Novel', publisher: 'Allen and Unwin', location: 'London' }
  ],
  lastUpdated: '2026-07-28'
};

export const IRS_SYLLABUS: UTMESyllabus = {
  id: 'irs',
  subject: 'Islamic Religious Studies',
  category: 'Arts',
  generalObjectives: [
    'Master the Qur’ān and Sunnah as foundations of Islamic and social life.',
    'Be familiar with Islamic heritage, culture and civilization.',
    'Be acquainted with the tradition of Islamic scholarship and intellectual discourse.',
    'Demonstrate knowledge of Islamic moral, spiritual, economic, political and social values.',
    'Be exposed to fundamental principles of Islam and prepared as practicing Muslims.'
  ],
  sections: [
    {
      id: 'irs-sec-1',
      sectionCode: 'PART 1',
      title: 'THE QUR’ĀN AND HADĪTH',
      topics: [
        {
          id: 'irs-1-1',
          topicNumber: 1,
          title: 'Revelation, Preservation and Authenticity of the Qur’ān',
          contents: [
            'Visits of Prophet (SAW) to Cave Hira and reaction to first revelation',
            'Modes of revelation (Q.42:51) and piecemeal revelation (Q.17:106, Q.25:32)',
            'Names and attributes of the Qur’ān',
            'Preservation: recording, compilation, standardization, Makkan vs Madinan suwar',
            'Proof of Divine authenticity (Q.4:82, Q.41:42) and uniqueness (Q.17:88, Q.75:16-19)'
          ],
          objectives: [
            'Explain revelation modes, compilation history, and divine authenticity of the Qur’ān'
          ]
        },
        {
          id: 'irs-1-2',
          topicNumber: 2,
          title: 'Tafsīr, Tajwīd and Selected Suwar',
          contents: [
            'Tafsīr: historical development, importance, types',
            'Introduction to Tajwīd (theory and rules)',
            'Study with Tajwīd and translation of suwar: al-Fātihah (Q.1), al-ʿĀdiyāt (Q.100) to an-Nās (Q.114)',
            'Study of suwar/āyāt: al-Aʿlā (Q.87), ad-Duhā (Q.93), al-Inshirāh (Q.94), at-Tīn (Q.95), al-ʿAlaq (Q.96), al-Qadr (Q.97), al-Bayyinah (Q.98), az-Zalzalah (Q.99), Āyatul-Kursiyy (Q.2:255), Āmanar-Rasūl (Q.2:285-6), Laqad jāʾakum (Q.9:128-129)'
          ],
          objectives: [
            'Recite prescribed suwar with Tajwīd, translate verses, and deduce moral/spiritual lessons'
          ]
        },
        {
          id: 'irs-1-3',
          topicNumber: 3,
          title: 'Hadīth Literature and Moral Lessons',
          contents: [
            'History of Hadīth collection to the 6 authentic collectors (Bukhari, Muslim, Abu Daud, Tirmidhi, Nasa’i, Ibn Majah)',
            'Authentication: Isnād (Asmāʾur-rijāl) and Matn; Sahīh, Hasan, Daʿīf classifications',
            'Muwatta of Imam Malik',
            'An-Nawawī’s 40 Hadīth selected texts (1,3,5,6,7,9,10,11,12,13,15,16,18,19,21,22,25,27,34,41)',
            'Moral teachings: Sage Luqman (Q.31:12-18), parents (Q.17:23-24), honesty, anti-bribery/corruption, dignity of labour, modesty, leadership, trust, Taqwa'
          ],
          objectives: [
            'Analyse Isnād and Matn, distinguish Hadīth categories, and apply moral teachings in daily life'
          ]
        }
      ]
    },
    {
      id: 'irs-sec-2',
      sectionCode: 'PART II',
      title: 'TAWHĪD AND FIQH',
      topics: [
        {
          id: 'irs-2-1',
          topicNumber: 1,
          title: 'Faith, Articles of Faith, Shirk and Innovation',
          contents: [
            'Tawhīd and Kalimatush-Shahadah',
            'Oneness of Allah, servanthood and finality of Prophet Muhammad (SAW)',
            'Shirk (idol worship, ancestral worship, trinity, atheism) and incompatible practices (superstition, fortune-telling, magic, cults, Bid’ah)',
            'Articles of Faith: Allah, Angels, Books, Prophets (Ulul-azmi), Last Day (Yawm-al-Ba’th), Destiny (Qada and Qadar)'
          ],
          objectives: [
            'Analyse Tawhīd, identify actions constituting Shirk and Bid’ah, and explain the 6 Articles of Faith'
          ]
        },
        {
          id: 'irs-2-2',
          topicNumber: 2,
          title: 'Ibadat, Family Matters, Law, Economics and Politics',
          contents: [
            'Taharah (wudu, ghusl, tayammum, istinja), Salah, Zakah, Sawm, Hajj, Jihad',
            'Family: Marriage validity conditions, rights/duties, polygamy, Idrar (ill-treatment), Divorce types (Talaq, Khul, Faskh, Mubara’ah, Li’an, Iddah, Hadanah), Inheritance shares',
            'Sources of Law: Qur’ān, Sunnah, Ijmāʿ, Qiyās; 4 Sunni Schools (Hanafi, Maliki, Shafi’i, Hanbali)',
            'Economic system: Riba prohibition, At-tatfif, Ihtikar (hoarding), Zakah, Jizyah, Kharaj, Ghanimah, Baitul-mal vs Western economy',
            'Political system: Sovereignty of Allah, Shūrah, ʿAdālah, Masʾūliyah, Non-Muslim rights'
          ],
          objectives: [
            'Demonstrate rules of Taharah/Salah/Zakah/Hajj, divorce/inheritance procedures, and contrast Islamic economic/political systems with Western models'
          ]
        }
      ]
    },
    {
      id: 'irs-sec-3',
      sectionCode: 'PART III',
      title: 'ISLAMIC HISTORY AND CIVILIZATION',
      topics: [
        {
          id: 'irs-3-1',
          topicNumber: 1,
          title: 'Pre-Islamic Arabia, Prophet’s Life and Caliphs',
          contents: [
            'Pre-Islamic Arabia (Jahiliyyah) practices and Islamic reforms',
            'Life of Prophet Muhammad (SAW): birth, call, Da’wah in Makkah/Madinah, Hijrah, Battles (Badr, Uhud, Khandaq), Hudaibiyyah, Conquest of Makkah, Farewell Pilgrimage',
            'The Four Rightly Guided Caliphs (al-Khulafāʾu ar-Rāshidūn): Abu Bakr, Umar, Uthman, Ali'
          ],
          objectives: [
            'Trace reforms of Jahiliyyah, major events in Prophet’s life, and achievements of the 4 Caliphs'
          ]
        },
        {
          id: 'irs-3-2',
          topicNumber: 2,
          title: 'Islam in Africa and Contributions to Education',
          contents: [
            'Early contact with Africa: Hijrah to Abyssinia, spread to Egypt',
            'Spread of Islam in West Africa: traders, teachers, Murabitun, Sufi orders, Mujaddidun',
            'Impact on empires (Ghana, Mali, Songhai, Borno) and trade cities (Timbuktu, Kano)',
            'Contributions to education: House of Wisdom (Baghdad), Al-Azhar, Nizamiyyah',
            'Scholars: Ahmad Baba, Sheikh al-Maghili, Sheikh Uthman Dan Fodio, Sultan Muhammad Bello, Ibn Battuta, Ibn Sina, Al-Ghazali, Ibn Rushd, Ar-Razi, Ibn Khaldun'
          ],
          objectives: [
            'Evaluate Islamic impact on West African empires and scholars’ contributions to global education'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Abdul, M.O.A.', year: '1976', title: 'Studies in Islam Series Book 3', publisher: 'IPB', location: 'Lagos' },
    { author: 'Abdul, M.O.A.', year: '1988', title: 'The Classical Caliphate', publisher: 'IPB', location: 'Lagos' },
    { author: 'Ali, A.Y.', year: '1975', title: 'The Holy Qur’ān Text: Translation and Commentary', publisher: 'The Islamic Foundation', location: 'Leicester' },
    { author: 'Doi, A. R. I.', year: '1997', title: 'Shariah: The Islamic Law', publisher: 'Noordeen', location: 'Kuala Lumpur' },
    { author: 'Lemu, A.', year: '1993', title: 'Islamic Studies for Senior Secondary Schools', publisher: 'IET', location: 'Minna' },
    { author: 'Trimingham, J.S.', year: '1993', title: 'A History of Islam in West Africa', publisher: 'Oxford University Press', location: 'Oxford' }
  ],
  lastUpdated: '2026-07-28'
};

export const HISTORY_SYLLABUS: UTMESyllabus = {
  id: 'history',
  subject: 'History',
  category: 'Arts',
  generalObjectives: [
    'Impart knowledge of Nigerian history from earliest times to the present.',
    'Identify similarities and relationships among the peoples of Nigeria for national unity and integration.',
    'Appreciate Nigerian history as the basis to understand West African and African history.',
    'Apply history to understand Nigeria’s and Africa’s relationship with the wider world.',
    'Analyse issues of modernization, nation-building and development.'
  ],
  sections: [
    {
      id: 'hist-sec-a',
      sectionCode: 'SECTION A',
      title: 'THE NIGERIA AREA UP TO 1800',
      topics: [
        {
          id: 'hist-1-1',
          topicNumber: 1,
          title: 'Land, Peoples and Early Centres of Civilization',
          contents: [
            'Geographical zones and peoples of Nigeria area',
            'Early centres: Nok, Daima, Ife, Benin, Igbo-Ukwu, Iwo Eleru',
            'Monuments and shelter systems: Kuyambana, Durbi-ta-Kusheyi, city walls, moats, palaces',
            'Origins of states: Kanuri, Hausa, Nupe, Jukun, Igala, Idoma, Tiv, Ebira, Igbo, Ibibio, Yoruba, Edo, Efik, Ijo, Itsekiri, Urhobo'
          ],
          objectives: [
            'Identify geographic zones, early centers of civilization, and state traditions of origin'
          ]
        },
        {
          id: 'hist-1-2',
          topicNumber: 2,
          title: 'Economic Activities and External Influences',
          contents: [
            'Agriculture, industries (pottery, salt, iron smelting, leather, cloth-making), trade routes',
            'Trans-Saharan trade and introduction of Islam',
            'Trans-Atlantic slave trade and early European/missionary contact'
          ],
          objectives: [
            'Assess impact of Trans-Saharan and Trans-Atlantic trade on Nigerian states'
          ]
        }
      ]
    },
    {
      id: 'hist-sec-b',
      sectionCode: 'SECTION B',
      title: 'THE NIGERIA AREA 1800 – 1900',
      topics: [
        {
          id: 'hist-2-1',
          topicNumber: 1,
          title: '19th Century States, Wars and British Conquest',
          contents: [
            'Sokoto Caliphate (Jihad, administration, collapse)',
            'Kanem-Borno (Saifawa collapse, Shehus, Rabeh)',
            'Yorubaland (fall of Old Oyo, Yoruba wars, 1886 Peace Treaty)',
            'Benin, Nupe, Igbo, Efik 19th-century developments',
            'European penetration, commodity trade, consular authority, British conquest (1851-1900)'
          ],
          objectives: [
            'Analyse Sokoto Jihad, Yoruba wars, fall of Oyo, and British military conquest'
          ]
        }
      ]
    },
    {
      id: 'hist-sec-c',
      sectionCode: 'SECTION C',
      title: 'NIGERIA 1900 – 1960',
      topics: [
        {
          id: 'hist-3-1',
          topicNumber: 1,
          title: 'Colonial Rule, Resistance, Constitutions and Independence',
          contents: [
            'Pacification, resistance (Ekumeku movement 1898-1911, Satiru 1906, Egba 1918, Aba Women 1929)',
            '1914 Amalgamation (reasons and effects)',
            'Indirect Rule system (reasons, working, effects)',
            'Colonial economy and social development',
            'Constitutional development: Clifford (1922), Richards (1946), Macpherson (1951), Lyttleton (1954), 1957/58 conferences, 1959 elections & 1960 Independence'
          ],
          objectives: [
            'Examine 1914 amalgamation, Indirect Rule, nationalist movements, and constitutional steps to 1960 independence'
          ]
        }
      ]
    },
    {
      id: 'hist-sec-d',
      sectionCode: 'SECTION D',
      title: 'NIGERIA SINCE INDEPENDENCE AND AFRICA IN WORLD AFFAIRS',
      topics: [
        {
          id: 'hist-4-1',
          topicNumber: 1,
          title: 'Post-Independence Nigeria and Pan-African History',
          contents: [
            'First Republic, 1966 Coups, Nigerian Civil War (causes, course, effects)',
            'Regimes: Gowon, Murtala/Obasanjo, Second Republic, Buhari, Babangida, ING, Abacha, Abdulsalami, Fourth Republic',
            'Nigeria in ECOWAS, AU, Commonwealth, OPEC, UN',
            'Africa: West/North Africa Jihads, Samori Toure, Egypt under Mohammad Ali, Mfecane, Great Trek, Scramble for Africa, Berlin Conference, Colonial Rule styles, Decolonization, Apartheid South Africa, Nation-building problems (neo-colonialism, terrorism, globalisation)'
          ],
          objectives: [
            'Evaluate military/civilian post-independence regimes, Civil War, Nigerian foreign policy, Scramble for Africa, and Apartheid'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Adesote, S. and Falade, D.', year: '2020', title: 'District Comprehensive History for Senior Secondary Schools (1-3)', publisher: 'Unique Mercy', location: 'Ondo' },
    { author: 'Ayandele, A. E. et al.', year: '1986', title: 'The Making of Modern Africa, Vol 2', publisher: 'Longman' },
    { author: 'Falola, T. et al.', year: '1989', title: 'History of Nigeria Vols 1 - 3', publisher: 'Longman', location: 'Lagos' },
    { author: 'Ikime, O.', year: '1980', title: 'Groundwork of Nigerian History', publisher: 'Heinemann', location: 'Ibadan' }
  ],
  lastUpdated: '2026-07-28'
};

export const MUSIC_SYLLABUS: UTMESyllabus = {
  id: 'music',
  subject: 'Music',
  category: 'Arts',
  generalObjectives: [
    'Appreciate and discuss the foundations of Music fairly and critically.',
    'Identify features of music of different periods through written/aural analysis.',
    'Investigate Western and African music theory, history, forms and instrumentation.',
    'Recognise influence of socio-cultural and technological factors (including AI and computer software) on music.',
    'Acquire a sound musical basis for further tertiary learning.'
  ],
  sections: [
    {
      id: 'mus-sec-a',
      sectionCode: 'SECTION A',
      title: 'RUDIMENTS OF MUSIC',
      topics: [
        {
          id: 'mus-1-1',
          topicNumber: 1,
          title: 'Staff, Notes, Time & Key Signatures',
          contents: [
            'Great staff, ledger lines, open score, G clef (Treble), C clef (Alto/Tenor), F clef (Bass)',
            'Music notes/rests and duration values',
            'Simple and compound time signatures, note grouping and barring',
            'Key signatures, major/minor diatonic scales, chromatic scales, key determination up to 2 sharps/flats',
            'Keyboard setting, enharmonic equivalents, accidentals, intervals (diatonic/chromatic) and inversions',
            'Musical terms, signs, abbreviations, tonic solfa transcription, transposition'
          ],
          objectives: [
            'Identify staves, clefs, key signatures, interval inversions, and transcribe between staff and tonic solfa notation'
          ]
        }
      ]
    },
    {
      id: 'mus-sec-b',
      sectionCode: 'SECTION B',
      title: 'ELEMENTARY HARMONY',
      topics: [
        {
          id: 'mus-2-1',
          topicNumber: 1,
          title: 'Triads, Progressions, Cadences and Counterpoint',
          contents: [
            'Primary and secondary triads in major and harmonic minor keys (up to 2 sharps/flats)',
            'Four-part vocal chord progressions (SATB), Dominant 7th chord in root position',
            'Kinds of motion: Parallel, Similar, Contrary, Oblique',
            'Cadences: Perfect, Imperfect, Plagal, Interrupted/Deceptive',
            'Non-chord tones: auxiliary/neighbouring tones, passing tones',
            'Simple diatonic modulation to dominant and subdominant keys',
            'Elementary composition: melody writing to words, balancing phrases, 2-part free counterpoint'
          ],
          objectives: [
            'Analyse SATB chord progressions, identify cadences and non-harmonic tones, and compose simple melodious counterpoint'
          ]
        }
      ]
    },
    {
      id: 'mus-sec-c',
      sectionCode: 'SECTION C',
      title: 'HISTORY AND LITERATURE OF AFRICAN MUSIC',
      topics: [
        {
          id: 'mus-3-1',
          topicNumber: 1,
          title: 'Folksongs, Instruments and Musicians',
          contents: [
            'Nigerian folksongs (types: cradle, war, dirge, work; forms: call-response, strophic, antiphony; modes: pentatonic, hexatonic; rhythms: cross-rhythm, syncopation, poly-rhythm)',
            'Festivals (Osun, Ifa, Ofala, Argungu, Eyo, Gelede) and Traditional Dances (Atilogwu, Bata, Swange, Dundun)',
            'Instruments classification: Aerophones (kakaki, algaita, oja), Chordophones (goge, kuntigi, garaya), Idiophones (sekere, agogo, udu, ekwe), Membranophones (dundun, bata, gangan, gudugudu)',
            'Traditional & Popular Musicians: Mamman Shata, Dan Maraya, Oliver De Coque, Mike Ejeagha, Fela Anikulapo Kuti, King Sunny Ade, Ebenezer Obey, Onyeka Onwenu, Wizkid, Davido, Burna Boy, Angelique Kidjo',
            'African Art Musicians: Laz Ekwueme, Akin Euba, Ayo Bankole, Kwabena Nketia, Sam Akpabot'
          ],
          objectives: [
            'Classify African musical instruments, identify folksong structures, and trace biographies of African popular and art musicians'
          ]
        }
      ]
    },
    {
      id: 'mus-sec-d',
      sectionCode: 'SECTION D & E',
      title: 'WESTERN MUSIC HISTORY, AI TECHNOLOGY AND COMPARATIVE STUDIES',
      topics: [
        {
          id: 'mus-4-1',
          topicNumber: 1,
          title: 'Western Music, Music Tech, AI & Diaspora Studies',
          contents: [
            'Periods of Western Music: Medieval (800-1400), Renaissance (1400-1600), Baroque (1600-1750), Classical (1750-1820), Romantic (1820-1900), 20th Century (1900-1999)',
            'Composers: Bach, Handel, Mozart, Haydn, Beethoven, Schubert, Chopin, Stravinsky, Debussy',
            'Music Forms: Binary, Ternary, Rondo, Sonata Allegro, Theme & Variation',
            'Music Technology & AI: notation software (Finale, Sibelius, Cubase), AI tools in music composition, AI-Powered Music Generators',
            'Comparative Music: Black musicians in Diaspora (Bob Marley, Michael Jackson, Stevie Wonder, Beyoncé, Tupac, Whitney Houston), genres (Jazz, Reggae, Gospel, Hip-hop)',
            'Nationalism in Nigerian Music and Anthems'
          ],
          objectives: [
            'Trace Western music historical eras, evaluate AI tools in music creation, and assess Diaspora genre influence and nationalistic songs'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Adesipe, A.E.', year: '2025', title: 'Essential Music for Senior Secondary Schools with Introduction to Artificial Intelligence', publisher: 'Tonad Publishers', location: 'Ogun State' },
    { author: 'Adesipe, A.E.', year: '2025', title: 'Artificial Intelligence in African Music and Instrumental Technology', publisher: 'Amazon Kindle' },
    { author: 'Akpabot, S.E.', year: '1986', title: 'Foundation of Traditional Music', publisher: 'Spectrum Books', location: 'Ibadan' },
    { author: 'Echezona, W. W. C.', year: '1981', title: 'Nigerian Musical Instruments', publisher: 'Apollo Publishing Ltd', location: 'Enugu' },
    { author: 'Kamien, Roger', year: '2008', title: 'Music: An Appreciation', publisher: 'McGraw Hill', location: 'New York' }
  ],
  lastUpdated: '2026-07-28'
};
