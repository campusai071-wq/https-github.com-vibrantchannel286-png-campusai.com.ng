import { UTMESyllabus } from './types';

export const ACCOUNTING_SYLLABUS: UTMESyllabus = {
  id: 'accounting',
  subject: 'Principles of Accounting',
  category: 'Commercial',
  generalObjectives: [
    'Stimulate and sustain interest in Principles of Accounting.',
    'Use basic principles, knowledge, and practical skills in Financial Accounting.',
    'Apply the knowledge and interpretation of Accounting information to decision making.',
    'Appreciate the relevance of Accounting information to business and governments.',
    'Apply information technology in solving Accounting problems.'
  ],
  topics: [
    {
      id: 'acc-1',
      topicNumber: 1,
      title: 'Nature and Significance of Bookkeeping and Accounting',
      contents: [
        'Development of Accounting and branches (Cost, Management, Auditing, Financial, Forensic, Environmental, Government, Tax)',
        'Objectives of Bookkeeping and Accounting',
        'Users and characteristics of Accounting information',
        'Principles, concepts and conventions of Accounting (entity, going concern, accrual, periodicity, consistency, prudence, materiality)',
        'Career opportunities in Bookkeeping and Accounting'
      ],
      objectives: [
        'Differentiate between Bookkeeping and Accounting',
        'Apply accounting principles, concepts and conventions to solve problems',
        'Identify branches of accounting and users of financial information'
      ]
    },
    {
      id: 'acc-2',
      topicNumber: 2,
      title: 'Principles of Double Entry',
      contents: [
        'Source documents: invoice, receipts, debit/credit notes, vouchers',
        'Books of original entry: cash book, sales/purchases day books, journal',
        'Accounting equation: Assets = Liabilities + Capital',
        'Ledger classification: personal, real, nominal accounts',
        'Trial balance, types of errors and correction, Suspense Account'
      ],
      objectives: [
        'Relate source documents to books of original entry',
        'Determine effects of changes in elements of the accounting equation',
        'Extract trial balance, identify error types, and correct errors via suspense accounts'
      ]
    },
    {
      id: 'acc-3',
      topicNumber: 3,
      title: 'Ethics, Professional and Regulatory Bodies in Accounting',
      contents: [
        'Ethical principles: honesty, integrity, transparency, accountability, fairness',
        'Professional accounting bodies in Nigeria (ICAN, ANAN)',
        'Regulatory bodies: FRCN (Financial Reporting Council of Nigeria), CAC (Corporate Affairs Commission), IASB'
      ],
      objectives: [
        'Explain ethical standards in financial reporting',
        'Understand roles of ICAN, ANAN, FRCN, CAC, and IASB'
      ]
    },
    {
      id: 'acc-4',
      topicNumber: 4,
      title: 'Cash Book',
      contents: [
        'Columnar cash books: Single, Double, and Three-column cash books',
        'Trade discounts vs Cash discounts and accounting treatment',
        'Petty Cash Book and Imprest system, cash float'
      ],
      objectives: [
        'Record transactions in single, double and three-column cash books',
        'Calculate cash float, trade/cash discounts, and petty cash balances'
      ]
    },
    {
      id: 'acc-5',
      topicNumber: 5,
      title: 'Bank Transactions and Reconciliation Statements',
      contents: [
        'Instruments: cheques, pay-in slips, credit/debit cards, e-banking transfers',
        'Causes of discrepancies between cash book and bank statement balance',
        'Bank Reconciliation Statement and Adjusted Cash Book'
      ],
      objectives: [
        'Identify instruments and e-banking transfer systems',
        'Determine adjusted cash book balance and prepare bank reconciliation statements'
      ]
    },
    {
      id: 'acc-6',
      topicNumber: 6,
      title: 'Final Accounts of a Sole Trader',
      contents: [
        'Statement of Profit or Loss / Income Statement',
        'Statement of Financial Position (Balance Sheet)',
        'Adjustments: bad and doubtful debts provision, discount provision, depreciation (straight-line, reducing balance), accruals and prepayments'
      ],
      objectives: [
        'Calculate cost of sales, gross profit, and net profit for sole proprietors',
        'Classify assets and liabilities, and compute year-end accounting adjustments'
      ]
    },
    {
      id: 'acc-7',
      topicNumber: 7,
      title: 'Stock Valuation',
      contents: [
        'Meaning and purpose of inventory valuation',
        'Methods: FIFO (First In First Out), LIFO, Simple Average',
        'Advantages, disadvantages and impact on income statement'
      ],
      objectives: [
        'Calculate material issue values and closing stock using FIFO, LIFO, and Simple Average',
        'Analyse inventory method effects on reported profit'
      ]
    },
    {
      id: 'acc-8',
      topicNumber: 8,
      title: 'Control Accounts',
      contents: [
        'Meaning and uses of control accounts in internal control',
        'Purchases Ledger Control Account (Trade Creditors)',
        'Sales Ledger Control Account (Trade Debtors)'
      ],
      objectives: [
        'Prepare sales and purchases ledger control accounts and locate posting errors'
      ]
    },
    {
      id: 'acc-9',
      topicNumber: 9,
      title: 'Incomplete Records and Single Entry',
      contents: [
        'Single entry vs incomplete accounting records',
        'Statement of Affairs to determine proprietor’s opening and closing capital',
        'Conversion from single entry to double entry (finding sales, purchases, expenses)',
        'Accounting ratios (gross profit percentage, mark-up, margin)'
      ],
      objectives: [
        'Determine missing financial figures using single entry conversion and margin/mark-up equations'
      ]
    },
    {
      id: 'acc-10',
      topicNumber: 10,
      title: 'Manufacturing Accounts',
      contents: [
        'Purpose of manufacturing account',
        'Cost classifications: prime cost (direct materials, direct labour, direct expenses), factory overheads, production cost, work-in-progress',
        'Cost apportionment among production, administration, selling/distribution'
      ],
      objectives: [
        'Calculate prime cost, factory overheads, work-in-progress adjustments, and total production cost'
      ]
    },
    {
      id: 'acc-11',
      topicNumber: 11,
      title: 'Accounts of Not-For-Profit-Making Organizations',
      contents: [
        'Objectives of non-profit clubs and societies',
        'Receipts and Payments Account vs Income and Expenditure Account',
        'Subscriptions in arrears, in advance, accumulated fund, surplus or deficit'
      ],
      objectives: [
        'Compute annual subscription income, accumulated funds, and surplus/deficit for non-profit entities'
      ]
    },
    {
      id: 'acc-12',
      topicNumber: 12,
      title: 'Departmental Accounts',
      contents: [
        'Objectives of departmental accounting',
        'Apportionment of departmental income and expenses',
        'Departmental statement of profit or loss, inter-departmental transfers'
      ],
      objectives: [
        'Apportion overhead expenses to departments and determine departmental profit or loss'
      ]
    },
    {
      id: 'acc-13',
      topicNumber: 13,
      title: 'Branch Accounts',
      contents: [
        'Types of branches: dependent and independent branches',
        'Pricing methods: cost price, selling price, wholesale price',
        'Reconciliation of head office and branch books'
      ],
      objectives: [
        'Prepare head office and branch accounts and determine branch branch profit or loss'
      ]
    },
    {
      id: 'acc-14',
      topicNumber: 14,
      title: 'Joint Venture Accounts',
      contents: [
        'Features and objectives of joint ventures',
        'Accounting records: venture accounts and Memorandum Joint Venture Account',
        'Calculation of venture profit or loss and distribution'
      ],
      objectives: [
        'Prepare joint venture accounts and memorandum joint venture statements'
      ]
    },
    {
      id: 'acc-15',
      topicNumber: 15,
      title: 'Partnership Accounts',
      contents: [
        'Partnership agreement, Capital and Current accounts',
        'Partnership final accounts: Profit and Loss Appropriation Account, Balance Sheet',
        'Goodwill valuation and accounting treatment',
        'Admission, retirement, asset revaluation, and dissolution of partnership'
      ],
      objectives: [
        'Prepare profit and loss appropriation accounts, asset revaluation accounts, and partner capital accounts upon admission/dissolution'
      ]
    },
    {
      id: 'acc-16',
      topicNumber: 16,
      title: 'Introduction to Company Accounts',
      contents: [
        'Formation and classification of limited liability companies',
        'Issue of shares (ordinary, preference) and debentures',
        'Company final accounts: Profit or loss statement, Statement of financial position',
        'Accounting ratios: Current ratio, Liquidity/Acid-test ratio, Stock turnover, Return on Capital Employed (ROCE)'
      ],
      objectives: [
        'Identify share capital classes and compute accounting liquidity and profitability ratios'
      ]
    },
    {
      id: 'acc-17',
      topicNumber: 17,
      title: 'Public Sector Accounting',
      contents: [
        'Public sector vs private sector accounting, cash basis vs accrual basis',
        'Sources of government revenue, capital and recurrent expenditure',
        'Consolidated Revenue Fund (CRF) and Development Fund',
        'Responsibilities of Accountant-General, Auditor-General, Minister of Finance, Local Government Treasurer',
        'Public finance initiatives: Treasury Single Account (TSA), IPSAS, IPPIS'
      ],
      objectives: [
        'Differentiate public and private sector accounting',
        'Explain government financial regulations, TSA, IPSAS, and IPPIS implementations'
      ]
    },
    {
      id: 'acc-18',
      topicNumber: 18,
      title: 'Information Technology in Accounting',
      contents: [
        'Manual vs Computerized accounting processing systems',
        'Data processing procedures',
        'Digital technologies in accounting: Machine Learning and AI, Data Analytics, Mobile Accounting, Specialized packages (Sage, QuickBooks, Tally)',
        'Blockchain technology in accounting systems and Virtual Accounting services'
      ],
      objectives: [
        'Evaluate computerized accounting software and artificial intelligence applications in auditing/bookkeeping',
        'Understand blockchain ledger security and virtual accounting services'
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Adekunle, K.O.', year: '2014', title: 'Bounty Financial Accounting for Schools and College', publisher: 'Bounty Press Ltd', location: 'Ibadan' },
    { author: 'Agbasiere, E.A. et al.', year: '2015', title: 'New Age Financial Accounting SSS Text Books', publisher: 'New Age Press Ltd' },
    { author: 'Ayodele, A.', year: '2015', title: 'Financial Accounting for Schools and Colleges', publisher: 'Spectrum Books Ltd', location: 'Ibadan' },
    { author: 'Ekwue, K. C.', year: '2010', title: 'Principles of Accounts, Book 1 & 2', publisher: 'Adson Publishing Company', location: 'Onitsha' },
    { author: 'Frankwood and Alan S.', year: '2002', title: 'Frankwood’s Business Accounting', publisher: 'Prentice Hall' },
    { author: 'Hassan, M. M.', year: '2001', title: 'Government Accounting', publisher: 'Malthouse Press Limited', location: 'Lagos' },
    { author: 'Ibrahim, R.A. and Kazeem, R. A.', year: '2018', title: 'Essential Financial Accounting for Senior Secondary Schools (6th Edition)', publisher: 'Tonad Publishers Limited' },
    { author: 'Igben, R. O.', year: '2004', title: 'Financial Accounting Made Simple (Vol. I)', publisher: 'Roi Publishers', location: 'Lagos' },
    { author: 'ICAN', year: '2021', title: 'Foundation Level Financial Accounting Study Text', publisher: 'Institute of Chartered Accountants of Nigeria', location: 'Lagos' }
  ],
  lastUpdated: '2026-07-28'
};

export const HOME_ECONOMICS_SYLLABUS: UTMESyllabus = {
  id: 'home_economics',
  subject: 'Home Economics',
  category: 'Commercial',
  generalObjectives: [
    'Acquire knowledge on the concepts and principles of Home Economics education.',
    'Apply the principles of Foods and Nutrition to planning, selection and preparation of meals and the adoption of food hygiene and safety.',
    'Equip students with knowledge and skills in Clothing and Textiles.',
    'Apply the principles of Home Management in home and family living.'
  ],
  sections: [
    {
      id: 'he-sec-a',
      sectionCode: 'SECTION A',
      title: 'HOME ECONOMICS EDUCATION',
      topics: [
        {
          id: 'he-1-1',
          topicNumber: 1,
          title: 'Home Economics Concept and Careers',
          contents: [
            'Meaning, scope and importance of Home Economics to individuals, family, society, and nation',
            'Objectives and ideals of Home Economics',
            'Careers in Home Management (interior decoration, florist, child care), Foods & Nutrition (catering, dietetics), Clothing & Textiles (fashion design, modeling), Family & Child Development',
            'Interrelationship with Biology, Chemistry, Physics, Agriculture, Fine Arts, Economics'
          ],
          objectives: [
            'Examine importance and scope of Home Economics',
            'Recommend vocations and relate interdisciplinary subjects to Home Economics'
          ]
        }
      ]
    },
    {
      id: 'he-sec-b',
      sectionCode: 'SECTION B',
      title: 'HOME MANAGEMENT',
      topics: [
        {
          id: 'he-2-1',
          topicNumber: 1,
          title: 'Principles of Home Management and Resources',
          contents: [
            'Management process steps: planning, organizing, implementing, evaluating',
            'Decision making, motivators: goals, values, standards, needs and wants',
            'Human resources: Time management, energy management (work simplification), skills',
            'Material resources: Money management, household budgeting, bank accounts, insurance'
          ],
          objectives: [
            'Apply management steps, decision making, time management and family budgeting'
          ]
        },
        {
          id: 'he-2-2',
          topicNumber: 2,
          title: 'Family Living, Marriage and Reproductive Health',
          contents: [
            'Family types, family life cycle, relationships, personality profiles, conflict resolution, human rights',
            'Marriage preparation: courtship, marriage types (Islamic, Christian, Court, Traditional)',
            'Reproductive health, STIs/HIV/AIDS, unwanted pregnancy',
            'Pregnancy, childbirth, post-natal care, infant care, child development, parenting'
          ],
          objectives: [
            'Analyse family relationships, marriage types, reproductive health, and infant development'
          ]
        },
        {
          id: 'he-2-3',
          topicNumber: 3,
          title: 'Housing, Home Surfaces, Sanitation and Consumer Education',
          contents: [
            'Types of houses, interior decoration (colour, texture, floral arrangements), furniture, utilities (water, gas, electricity, ICT)',
            'Home surfaces: wood, tiles, terrazzo, cleaning agents',
            'Sanitation: drainage, refuse disposal, pest control, pollution hazards',
            'Consumer education: market types, buying practices, advertising, consumer rights, regulatory bodies'
          ],
          objectives: [
            'Apply principles of interior decoration, surface cleaning, sanitation, and consumer rights'
          ]
        }
      ]
    },
    {
      id: 'he-sec-c',
      sectionCode: 'SECTION C',
      title: 'FOODS & NUTRITION',
      topics: [
        {
          id: 'he-3-1',
          topicNumber: 1,
          title: 'Nutrients, Meal Planning and Cooking Methods',
          contents: [
            'Food nutrients (carbohydrates, proteins, fats, vitamins, minerals, water), deficiency diseases',
            'Meal planning for special groups (pregnant mothers, infants, athletes, invalids, vegetarians, COVID/HIV patients)',
            'Table setting and hostessing',
            'Cookers (gas, electric, microwave), cooking methods (boiling, baking, steaming), heat transfer (conduction, convection, radiation)'
          ],
          objectives: [
            'Identify nutrients, plan balanced meals for special groups, and compare heat transfer modes'
          ]
        },
        {
          id: 'he-3-2',
          topicNumber: 2,
          title: 'Flours, Basic Mixtures, Safety, Preservation and Gardening',
          contents: [
            'Flours and raising agents (air, yeast, palm wine, steam)',
            'Basic mixtures: batters, pastries, cakes, breads and common faults',
            'Scientific tests for nutrients, recipe development',
            'Kitchen safety, first aid kit, food hygiene, food-borne diseases',
            'Food storage and preservation, convenience foods, additives, réchauffé dishes',
            'Home gardening: tools, soil types, suitable garden crops'
          ],
          objectives: [
            'Select raising agents, identify cake/pastry faults, administer kitchen first aid, and apply food preservation methods'
          ]
        }
      ]
    },
    {
      id: 'he-sec-d',
      sectionCode: 'SECTION D',
      title: 'CLOTHING & TEXTILE',
      topics: [
        {
          id: 'he-4-1',
          topicNumber: 1,
          title: 'Fibres, Fabrics and Care Labels',
          contents: [
            'Fibre origin and classification (natural: cotton, silk, wool; synthetic: rayon, nylon)',
            'Fabric construction: weaving, bonding, felting; local fabrics (aso-oke, Akwete, Okene cloth)',
            'Fabric finishes and fabric design (tie and dye, batik, screen printing)',
            'Textile care symbols and care labels'
          ],
          objectives: [
            'Differentiate textile fibres, local fabrics, fabric finishes, and interpret laundry symbols'
          ]
        },
        {
          id: 'he-4-2',
          topicNumber: 2,
          title: 'Sewing Equipment, Garment Construction and Laundry',
          contents: [
            'Sewing machine parts and faults, basic stitches and seams',
            'Style features (collars, yokes, pockets), arrangement of fullness (darts, pleats, gathers, smocking)',
            'Body measurement, pattern drafting, wardrobe planning, grooming',
            'Laundry processes: sorting, stain removal, washing agents, dry cleaning, ironing temperatures'
          ],
          objectives: [
            'Demonstrate sewing machine troubleshooting, pattern drafting, stain removal techniques, and garment maintenance'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Anfani-Joe, M.E. and Ogunjide, L.O.', year: '1993', title: 'Home Management for Senior Secondary School 1 – 3', publisher: 'University Press Plc', location: 'Ibadan' },
    { author: 'Anyakoha, E.U. and Eluwa, M.', year: '1990', title: 'Home Management for Schools and Colleges', publisher: 'Africana FIRST Publishers', location: 'Onitsha' },
    { author: 'Enid O’Reilly-Wright', year: '1985', title: 'The Student’s Cookery Book', publisher: 'Oxford University Press' },
    { author: 'Ogunjide, L.O. et al.', year: '1993', title: 'Clothing and Textiles for Senior Secondary Schools 1 – 3', publisher: 'University Press Plc', location: 'Ibadan' },
    { author: 'Olusanya, J.O. et al.', year: '1990', title: 'Foods and Nutrition for Secondary Schools Books 1 – 3', publisher: 'University Press Plc', location: 'Ibadan' }
  ],
  lastUpdated: '2026-07-28'
};
