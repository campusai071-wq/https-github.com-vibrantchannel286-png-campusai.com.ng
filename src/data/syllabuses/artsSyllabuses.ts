import { UTMESyllabus } from './types';

export const CRS_SYLLABUS: UTMESyllabus = {
  id: "crs",
  subject: "Christian Religious Studies",
  category: "Arts",
  generalObjectives: [
    "Acquire knowledge and understanding of the tenets of the Christian faith in the Bible;",
    "Interpret biblical teachings and themes;",
    "Apply biblical teachings and tenets to life in society; and",
    "Evaluate the level of application of biblical teachings to contemporary life."
  ],
  sections: [
    {
      id: "crs_sec_a",
      title: "SECTION A: Creation to Division of Kingdom",
      topics: [
        {
          id: "crs_1",
          topicNumber: 1,
          title: "Sovereignty of God, Covenants & Leadership",
          contents: [
            "Sovereignty of God: God as Creator and Controller of Universe (Gen 1-2, Amos 9:5-6, Is 45:5-12, Ps 19, Jer 18, Rom 8:28)",
            "Covenants: Flood & Noah (Gen 6-9), Abraham (Gen 12, 17, 21, 25), Israel (Ex 19, 20, 24, Deut 28), New Covenant (Jer 31:31-34, Ezek 36:25-28)",
            "Leadership Qualities: Joseph (Gen 37, 41, 45), Moses (Ex 1-5, 12, Num 13-14), Joshua (Num 13, 27, Josh 1, 6, 7, 24), Judges (Deborah, Gideon, Samson)"
          ],
          objectives: [
            "Analyze God's process and sequence of creation and man's role;",
            "Distinguish between old and new covenants and explain leadership qualities of Old Testament leaders."
          ]
        },
        {
          id: "crs_2",
          topicNumber: 2,
          title: "Providence, Parental Responsibility, Obedience & David",
          contents: [
            "Divine Providence, Guidance & Protection: Guidance (Ex 13, Josh 8, Matt 11), Protection (Ex 14, Dan 6, Ps 91), Provision (Ex 16, 17, 1 Kings 17, Num 20)",
            "Parental Responsibility: Eli and Samuel (1 Sam 2-4, 8), David (2 Sam 13, 15, 18-19), Asa (1 Kings 15, 22, Prov 4, 22)",
            "Obedience vs Disobedience: Rewards for Abraham (Gen 22), Three Hebrew Youths (Dan 3), David (1 Sam 30); Consequences for Adam (Gen 2-3), Manna (Ex 16), Golden Calf (Ex 32), Moses (Num 20), Saul (1 Sam 15)",
            "David as a man after God's own heart: early life, anointing, submission to God's will, repentance & forgiveness (2 Sam 11-12, Ps 51)",
            "Decision Making: medium reliance (1 Sam 28), Solomon's wisdom (1 Kings 3, 4, 5, 8), unwise decisions of Solomon and Rehoboam (1 Kings 9, 11, 12)"
          ],
          objectives: [
            "Examine circumstances leading to obedience, disobedience, sin, and repentance in the Old Testament."
          ]
        }
      ]
    },
    {
      id: "crs_sec_b",
      title: "SECTION B: Division of Kingdom to Return from Exile & Prophets",
      topics: [
        {
          id: "crs_3",
          topicNumber: 3,
          title: "Greed, Supremacy of God, Reforms, Exile & Prophets",
          contents: [
            "Greed and effects: Ahab & Naboth's vineyard (1 Kings 21-22), Gehazi (2 Kings 5)",
            "Supremacy of God: Elijah on Mount Carmel (1 Kings 16:29-34, 17, 18, 19)",
            "Religious reforms in Judah: Josiah's Temple cleansing and covenant renewal (2 Kings 22-23)",
            "Concern for Judah: Fall of Jerusalem (2 Kings 24-25), Exile & Rebuilding under Nehemiah and Ezra (Neh 1-4, Ezra 1-7)",
            "Faith & Protection: Daniel, Shadrach, Meshach, Abednego (Dan 3, 6); Nineveh & Jonah (Jonah 1-4)",
            "Social Justice, True Religion & Divine Love: Amos (Amos 2, 4, 5, 6, 7, 8; Jas 1), Hosea (Hosea 1-4, 6, 14)",
            "Holiness, Divine Call & Hope: Vision of Isaiah (Is 6), Calls of Jeremiah (Jer 1) & Ezekiel (Ezek 2-3); Punishment & Hope (Jer 3, 32, Ezek 18, 37, Is 61)"
          ],
          objectives: [
            "Analyze greed, Elijah's contest on Mt Carmel, Josiah's reforms, and prophetic messages of Amos, Hosea, Isaiah, Jeremiah, and Ezekiel."
          ]
        }
      ]
    },
    {
      id: "crs_sec_c",
      title: "SECTION C: Four Gospels and Acts of the Apostles",
      topics: [
        {
          id: "crs_4",
          topicNumber: 4,
          title: "Life of Jesus, Miracles, Parables & Mission of the Church",
          contents: [
            "Birth & early life of Jesus and John the Baptist; Baptism & Temptations of Jesus (Mt 3-4, Mk 1, Lk 3-4)",
            "Discipleship calls & demands (Mt 4, 8, 9, Mk 1-2, Lk 5, 9, 14)",
            "Miracles: Nature (stilling storm, 5000 fed, walking on water, water to wine), Resuscitation (Lazarus, Jairus' daughter, widow's son at Nain), Healing (lepers, paralytic, centurion's servant, blind), Exorcism (Gadarene demoniac, epileptic boy)",
            "Parables: Kingdom (sower, weeds, drag-net, wedding garment), Love of God (lost sheep, lost coin, prodigal son), Love for neighbor (Good Samaritan, rich man & Lazarus), Wealth (rich fool), Prayer (unrighteous judge, Pharisee & publican)",
            "Sermon on Mount, Mission of 12 and 70, Great Confession, Transfiguration, Triumphal Entry & Temple Cleansing, Last Supper, Trials (High Priest, Pilate, Herod), Crucifixion, Burial, Resurrection, Appearances & Ascension",
            "Jesus' self-teachings: Bread of Life, Living Water, Light of World, Door, Good Shepherd, True Vine, Resurrection",
            "Love, Fellowship in Early Church, Pentecost & Holy Spirit, Opposition (Stephen's martyrdom, Peter/John arrest, Saul's persecution), Mission to Gentiles (Saul's conversion, Cornelius, Council of Jerusalem)"
          ],
          objectives: [
            "Classify Jesus' miracles and parables;",
            "Trace passion week events, resurrection accounts, and growth of early church in Acts."
          ]
        }
      ]
    },
    {
      id: "crs_sec_d",
      title: "SECTION D: Themes from Selected Epistles",
      topics: [
        {
          id: "crs_5",
          topicNumber: 5,
          title: "Epistolary Teachings & Christian Living",
          contents: [
            "Justification by Faith (Rom 3, 5, 10, Gal 2); Law and Grace (Rom 4, 5, Gal 3)",
            "New Life in Christ (Rom 6, 12, Col 3, Gal 5, 2 Cor 5, 1 Thess 4); Joint Heirs with Christ (Gal 3-4)",
            "Humility (Phil 2, 1 Pet 5, Jas 4, Mt 23); Forgiveness (Philemon, 2 Cor 2, Mt 7)",
            "Spiritual Gifts (1 Cor 12, 14, Rom 12); Christian Giving (Phil 4, 2 Cor 8-9, Mt 6)",
            "Civic Responsibility (Rom 13, 1 Tim 2, 1 Pet 2); Dignity of Labour (Mt 20, 2 Thess 3, Col 3)",
            "Second Coming of Christ (1 Thess 4-5, 2 Thess 2, 2 Pet 3); Impartiality (Jas 2, Acts 10, Mt 7); Effective Prayer (Jas 1, 4, 5, Mt 6)",
            "Community Living: Christian relationships, non-Christian relations, attitude to persecution, family duties (Eph 6, Col 3, 1 Pet 1-5)",
            "Social Ethics: Corruption (1 Tim 6, 2 Tim 3, Jas 5) and Sexual Immorality (1 Cor 6, Heb 13, Eph 5, Rom 1)"
          ],
          objectives: [
            "Explain Paul's teachings on justification, spiritual gifts, giving, civic duties, second coming, and Christian ethics."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Adetunji, P.G. et al.", year: "2000", title: "Exam Focus Christian Religious Knowledge for WASSCE and SSCE", publisher: "University Press Plc, Ibadan" },
    { author: "Dibie, C. Chris", year: "2020", title: "Essential Christian Religious Knowledge", publisher: "Tonad Publishers Limited, Lagos" },
    { author: "Udokporo, L.O., Okemiri, C.O., Olaomo, Y.A.", year: "2012", title: "Christian Religious Studies for Senior Secondary Schools (Books 1 - 3)", publisher: "Melrose Books" },
    { author: "THE BIBLE", year: "1971", title: "Revised Standard Version (RSV)", publisher: "Bible Society Publishing House" }
  ],
  lastUpdated: "2026-07-28"
};

export const FRENCH_SYLLABUS: UTMESyllabus = {
  id: "french",
  subject: "French",
  category: "Arts",
  generalObjectives: [
    "Assess written comprehension in French;",
    "Apply principles governing structure and use of written French;",
    "Identify how French sounds work in speech production; and",
    "Examine the culture and civilization of Francophone West Africa and France."
  ],
  topics: [
    {
      id: "fr_1",
      topicNumber: 1,
      title: "Written Comprehension in French",
      contents: [
        "Comprehension passages (70-150 words) on general and emergent topics: love, health, politics, child trafficking, cultism, travel, corruption, money laundering, etc."
      ],
      objectives: [
        "Deduce answers on content, intent, and style of proposed texts;",
        "Apply reasoning skills to infer context and vocabulary."
      ]
    },
    {
      id: "fr_2",
      topicNumber: 2,
      title: "Structure and Use of Written French",
      contents: [
        "Nouns (simple/compound, gender, plurals), Pronouns (personal, demonstrative, possessive, relative, impersonal)",
        "Verbs: reflexive/non-reflexive, moods, tenses (all tenses except subjonctif past/imperfect/pluperfect)",
        "Adjectives (qualifying, possessive, demonstrative, indefinite, numeral, ordinal) & Adverbs (-ment, prep + noun, special forms bien/vite/mieux/pire)",
        "Prepositions, Conjunctions (coordination & subordination), Articles (definite, indefinite, partitive, contracted)",
        "Vocabulary span: synonyms, antonyms, faux amis (librairie/library, rester/to rest, blesser/to bless)",
        "Word order (affirmative, interrogative, imperative, passive voice), Negation (ne...pas, ne...plus, ne...rien, nul ne, ne...personne)",
        "Agreement, pluralisation, derivation, Proverbs, Idioms (avoir une faim de loup), speech acts, figures of speech (metaphor, simile, hyperbole)"
      ],
      objectives: [
        "Identify basic form classes and apply grammatical rules to construct correct French sentences;",
        "Recognize false friends (faux amis), complete proverbs, and interpret idiomatic expressions."
      ]
    },
    {
      id: "fr_3",
      topicNumber: 3,
      title: "Workings of French Sounds",
      contents: [
        "Sound discrimination (tout/tu, fais/fée)",
        "Letter-sound correspondence (ai -> /e/, eau -> /o/)",
        "Syllabification (con/tente/ment), Liaison (trois_animaux, des_enfants)",
        "Sense groups in reading, pause, intonation, e-caduc, silent letters, homophones (maison/saison, dents/don)"
      ],
      objectives: [
        "Discriminate between French sounds and phonetic combinations;",
        "Understand liaison, syllabification, and sense group rules for oral fluency."
      ]
    },
    {
      id: "fr_4",
      topicNumber: 4,
      title: "Culture and Civilization",
      contents: [
        "Educational systems, socio-economic life, political organization, and cultural customs of Francophone West Africa (Senegal, Côte d'Ivoire, Benin, Togo, Mali, etc.) and France in comparison with Nigeria",
        "Cultural themes: greetings, clothing, cuisine, leisure, marriage, festivals, arts, professions"
      ],
      objectives: [
        "Identify specific features of Francophone African and French culture and compare them with Nigerian traditions."
      ]
    }
  ],
  recommendedTexts: [
    { author: "Adeleke, J.", year: "2018", title: "A Short French Grammar", edition: "5th Edition", publisher: "Success Printers, Badagry" },
    { author: "Ajiboye, T.", year: "2014", title: "Companion to French Grammar", edition: "4th Edition", publisher: "Cleavoketa Books, Ibadan" },
    { author: "Hatier", year: "1980", title: "Le Nouveau Bescherelle: L'Art de Conjuguer", publisher: "Spectrum Books Ltd., Ibadan" },
    { author: "Mbuko, L.", year: "2000", title: "French Essays on Culture and Civilisation for Schools and Colleges", publisher: "Bounty Press, Ibadan" }
  ],
  lastUpdated: "2026-07-28"
};

export const ART_SYLLABUS: UTMESyllabus = {
  id: "art",
  subject: "Art (Fine & Applied Arts)",
  category: "Arts",
  generalObjectives: [
    "Exhibit knowledge of fundamental elements, principles and terminologies of art;",
    "Show knowledge of historical dimensions of art with emphasis on Nigerian arts and crafts;",
    "Demonstrate artistic techniques, processes, material handling and equipment care; and",
    "Display aesthetic awareness and understand the role and entrepreneurship of art in society."
  ],
  sections: [
    {
      id: "art_sec_a",
      title: "SECTION A: Classification & Design Principles",
      topics: [
        {
          id: "art_1",
          topicNumber: 1,
          title: "Classification of Art, Elements, Principles & Terms",
          contents: [
            "Branches of Art: Visual Arts (Fine & Applied), Performing Arts (Music, Dance, Drama), Literary Arts (Poetry, Prose)",
            "Elements of Design: line, colour, shape, form, texture, tone, value, space",
            "Principles of Design: balance, rhythm, proportion, harmony, contrast, repetition, dominance, variety",
            "Art Terms: Pigments, motif, greenware, armature, silhouette, chiaroscuro, cire-perdue (lost wax), terra-cotta"
          ],
          objectives: [
            "Differentiate branches of art;",
            "Identify elements and principles of design with illustrations;",
            "Define art terms and apply them in analyzing artworks."
          ]
        }
      ]
    },
    {
      id: "art_sec_b",
      title: "SECTION B: Historical Dimensions of Art",
      topics: [
        {
          id: "art_2",
          topicNumber: 2,
          title: "Prehistoric, World Art, Traditional African & Nigerian Art",
          contents: [
            "Prehistoric, Greek, Roman, Medieval architecture and calligraphy",
            "Renaissance Art & Masters: Giotto, Michelangelo, Leonardo da Vinci, Raphael",
            "19th & 20th Century Movements: Impressionism, Realism, Futurism, Cubism, Bauhaus, Pop Art, Abstract Expressionism, Fauvism",
            "Traditional African Art: Egypt, Ashanti, Dogon, Mossi, Fon, Senufo, Bambara, Mende, Kissi, Bamileke, Bakumba",
            "Traditional Nigerian Art: Nok, Igbo-Ukwu, Ife, Benin, Esie, Igala, Jukun, Akwanshi, Mbari",
            "Nigerian Crafts: pottery, woodworks, cloth-weaving, carving, leather works, metal works, beadworks, mat/cane weaving",
            "Contemporary Nigerian Art Schools & Masters: Zaria Art Society, Nsukka, Osogbo group; Aina Onabolu, Ben Enwonwu, S.I. Wangboje, Jimoh Akolo, Dele Jegede",
            "Museums, Galleries, Art Organizations (NSEA, SNA, NCAC), Festivals (Argungu, Eyo, Egungun, New Yam, Durbar, Igue, Ekpo, Odo)"
          ],
          objectives: [
            "Compare historical art periods, movements, and master artists;",
            "Analyze traditional African/Nigerian art traditions and contemporary Nigerian art movements."
          ]
        }
      ]
    },
    {
      id: "art_sec_c",
      title: "SECTION C & D: Skills, Appreciation & Entrepreneurship",
      topics: [
        {
          id: "art_3",
          topicNumber: 3,
          title: "Artistic Skills, Equipment, Appreciation & Careers",
          contents: [
            "2D Art: drawing, painting, graphics, textile design; Perspective (linear, angular, aerial, picture plane, vanishing point, foreshortening)",
            "3D Art: sculpture, ceramics, crafts; Computer Graphics: CorelDraw tools",
            "Tools, Materials & Equipment: brushes, lino, charcoal, fixative, dyes, spray gun, light table; Improvisation",
            "Art Appreciation: natural (Zuma Rock, Ikogosi) vs man-made aesthetics",
            "Functions of Art: religious, social, cultural, political, therapeutic, economic, media advertising",
            "Art Entrepreneurship & Careers: Ceramist, Curator, Textile designer, Industrial designer, Sculptor, Photographer, Cartoonist, Illustrator"
          ],
          objectives: [
            "Explain perspective rules and 2D/3D art processes;",
            "Evaluate functions of art and career opportunities in visual arts."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Banjoko, I.", year: "2000", title: "Visual Arts Made Easy: Textbook for Schools and Colleges", publisher: "Movic Publishing Company Ltd., Lagos" },
    { author: "Egonwa, O.D.", year: "1991", title: "African Art: A Contemporary Source Book", publisher: "Osasu Publishers, Benin" },
    { author: "Wangboje, I. N.", year: "1982", title: "A Textbook on Art for Junior and Senior Secondary Schools", publisher: "Evans Publishers" },
    { author: "Oyedun, Y.F.", year: "2017", title: "Excel in Arts, Photography, Dyeing, Starching and Bleaching", publisher: "Yemsol Graphic Communication, Lagos" }
  ],
  lastUpdated: "2026-07-28"
};

export const ARABIC_SYLLABUS: UTMESyllabus = {
  id: "arabic",
  subject: "Arabic",
  category: "Arts",
  generalObjectives: [
    "Answer comprehension questions correctly in standard Arabic;",
    "Translate simple texts between English and Arabic accurately;",
    "Apply Arabic grammar rules functionally;",
    "Appreciate Arabic literary texts in historical and West African contexts; and",
    "Use Arabic effectively as a living world language."
  ],
  sections: [
    {
      id: "arb_sec_a",
      title: "SECTIONS A & B: Comprehension & Translation",
      topics: [
        {
          id: "arb_1",
          topicNumber: 1,
          title: "Comprehension & Translation",
          contents: [
            "Comprehension passage (70 words) covering current affairs, sports, education, politics, economy, health, culture, ethics",
            "Translation (10 questions): 5 English to Arabic, 5 Arabic to English including key idiomatic phrases"
          ],
          objectives: [
            "Deduce themes and titles from Arabic texts;",
            "Translate accurately between English and Arabic using standard grammar and idioms."
          ]
        }
      ]
    },
    {
      id: "arb_sec_b",
      title: "SECTION C: Arabic Grammar (النحو العربي)",
      topics: [
        {
          id: "arb_2",
          topicNumber: 2,
          title: "Grammar Rules & Syntax",
          contents: [
            "Demonstratives, Relative Pronouns, Conditional & Interrogatives (أسماء الإشارة والموصولة والشرط والاستفهام)",
            "Gender (المذكر والمؤنث), Noun characteristics, Dual (المثنى), Plurals (Sound masculine, Sound feminine, Broken plural - جمع المذكر/المؤنث السالم وجمع التكسير)",
            "Construct Phrase (المضاف والمضاف إليه), Separable & Inseparable Pronouns (الضمائر المنفصلة والمتصلة)",
            "Appendants: Adjective, Conjunction, Permutative, Emphasis (التوابع: النعت، العطف، البدل، التوكيد)",
            "Prepositions & Particles (حروف الجر والنصب والجزم), Transitive vs Intransitive Verbs (الفعل اللازم والمتعدي)",
            "Verbs: Perfect (الماضي), Imperfect (المضارع: المرفوع، المنصوب، المجزوم), Imperative (الأمر)",
            "Modifiers: Kana and its associates, Inna and its associates, Zanna and its associates (النواسخ: كان، إن، ظن وأخواتها)",
            "Trilateral & Derived Verbs (الفعل الثلاثي المجرد والمزيد فيه), Verbal Noun (المصدر)",
            "Derivatives: Active/Passive Participles, Superlative, Noun of Instrument, Time & Place, Relative Adjective, Hyperbole (المشتقات: اسم الفاعل، المفعول، التفضيل، الآلة، الزمان والمكان، النسب، المبالغة)",
            "Conditional sentences, Numerals 1-1000 (العدد 1-1000), Active/Passive voice (الفاعل ونائب الفاعل), Subject & Predicate (المبتدأ والخبر), Nouns in Accusative (المفعول به، المفعول فيه/الظرف، الحال، المستثنى بإلا، التمييز، المنادى)"
          ],
          objectives: [
            "Apply rules governing Arabic nouns, verbs, modifiers, derivatives, numerals, and sentence parsing (I'rab)."
          ]
        }
      ]
    },
    {
      id: "arb_sec_c",
      title: "SECTIONS D & E: Composition & Arabic Literature",
      topics: [
        {
          id: "arb_3",
          topicNumber: 3,
          title: "Composition & Literary History",
          contents: [
            "Composition: 5 questions on education, culture, health, politics, economy, sports",
            "Introduction to Arabic Literature (الأدب: الشعر والنثر)",
            "Pre-Islamic Period (العصر الجاهلي 500-610 CE): Al-Shanfara (أقيموا بني أمي), Aktham b. Saifi",
            "Islamic & Umayyad/Abbasid Periods (610-1798 CE): Al-Hajjaj b. Yusuf, Ali b. Abi Talib, Ibn al-Muqaffa, Jarir b. Atiyyah",
            "Modern Period (1798-present): Ahmad Shawqi (العلم والتعليم), Gibran Khalil Gibran (الموكب), Abbas Mahmud al-Aqqad",
            "Arabic Literature in West Africa: Asma'u bint Shehu Usman dan Fodio (أعيني جودا وابكيا لحبيبتي), Ali Abd al-Qadir al-Asali, Muhammad al-Amin Samgho Gassama, Adam Abd Allah al-Iluri (الألوري)"
          ],
          objectives: [
            "Demonstrate essay composition skills in Arabic;",
            "Analyze literary works and poetic themes from Pre-Islamic to West African Arabic literature."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Bashir Ahmad Muhyi al-Din & Al-Mardi", title: "Al-Mutala'ah al-Wadihah", publisher: "Tan al-Mi Press, Kano" },
    { author: "Ali al-Jarim & Mustafa Amin", title: "Al-Nahw al-Wadih (Parts 1-3)", publisher: "Dar al-Ma'arif, Cairo" },
    { author: "Adekilekun, A. L. A.", title: "Learning Arabic Language", location: "Ilorin" },
    { author: "Haywood, J. A. and Nahmad, H. M.", year: "1965", title: "A New Arabic Grammar of the Written Language", publisher: "Lund Humphries, London" }
  ],
  lastUpdated: "2026-07-28"
};
