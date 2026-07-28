import { UTMESyllabus } from './types';

export const COMMERCE_SYLLABUS: UTMESyllabus = {
  id: "commerce",
  subject: "Commerce",
  category: "Commercial",
  generalObjectives: [
    "Acquire basic knowledge of Commerce and e-business;",
    "Examine the relationship between Commerce and other fields;",
    "Apply principles of Commerce in the Nigerian economy; and",
    "Appreciate dynamic and positive changes in commercial activities."
  ],
  topics: [
    {
      id: "com_1",
      topicNumber: 1,
      title: "Commerce & E-Commerce Overview",
      contents: [
        "Meaning, scope, characteristics, and functions of Commerce",
        "E-Commerce and E-Business: meaning, functions, and impact on modern trade"
      ],
      objectives: [
        "Identify functions of e-commerce/e-business;",
        "Differentiate Commerce from related subjects and describe its characteristics and functions."
      ]
    },
    {
      id: "com_2",
      topicNumber: 2,
      title: "Occupation and Production",
      contents: [
        "Occupation: industrial, commercial, and service occupations; factors determining choice of occupation",
        "Production: factors (land, labour, capital, entrepreneur) and rewards; division of labour and specialization; types (primary, secondary, tertiary); relationship between production, specialization and exchange"
      ],
      objectives: [
        "Compare types of occupations and state factors determining choice;",
        "Identify factors of production, their rewards, and distinguish division of labour from specialization."
      ]
    },
    {
      id: "com_3",
      topicNumber: 3,
      title: "Home and Foreign Trade",
      contents: [
        "Home Trade - Retail: types, functions, setup factors, trends (branding, self-service, vending machines, vouchers), merits/demerits, success/failure factors",
        "Home Trade - Wholesale: merchant, agent, general wholesalers; channels of distribution; functions and middleman merits/demerits",
        "Foreign Trade: types (import, export, entrepôt), balance of trade & balance of payments, counter trade, documentation, tariffs, trade restrictions, export promotion, Customs and Ports Authorities"
      ],
      objectives: [
        "Compare retail and wholesale trade types, functions, and distribution channels;",
        "Analyze foreign trade concepts, documentation, tariffs, and government regulatory agencies."
      ]
    },
    {
      id: "com_4",
      topicNumber: 4,
      title: "Purchase/Sale of Goods, Terms & Means of Payment",
      contents: [
        "Procedures and documents: enquiry, quotation, order, invoice, proforma invoice, statement of accounts, indent, consular invoice, bill of lading, certificate of origin, consignment note",
        "Terms of trade: trade/quantity/cash discounts, C.O.D., C.I.F., F.O.B., E.O.E., warranties",
        "Means of payment: Legal tender, cheques, standing orders, bank drafts, postal/money orders, bills of exchange, promissory notes, e-payments"
      ],
      objectives: [
        "Examine documents used in buying and selling goods;",
        "Distinguish between terms of trade, trade discounts, cash payments, and electronic payment systems."
      ]
    },
    {
      id: "com_5",
      topicNumber: 5,
      title: "Aids-to-Trade",
      contents: [
        "Advertising: roles, types, media, methods, advantages/disadvantages",
        "Banking: types of banks, services, challenges, e-banking",
        "Communication: procedure, types, trends (courier, GSM), barriers",
        "Insurance: types, principles (indemnity, insurable interest, utmost good faith, proximate cause), terms, types of risk",
        "Tourism: forms, importance, promoting agencies, Nigerian tourist centers",
        "Transportation: modes, importance, advantages/disadvantages",
        "Warehousing: types, functions, siting factors"
      ],
      objectives: [
        "Appraise the roles of advertising, banking, communication, insurance, tourism, transportation, and warehousing in facilitating trade."
      ]
    },
    {
      id: "com_6",
      topicNumber: 6,
      title: "Business Units, Financing & Management",
      contents: [
        "Business Units: Sole Proprietorship, Partnership, Limited Liability Companies, Public Corporations, Cooperatives; registration, dissolution, liquidation, government ownership reasons",
        "Financing Business: sources of finance, types of capital (authorized, issued, called-up, paid-up, working capital, equity), calculations of profit/turnover, Bureau de Change",
        "Trade Associations, Chambers of Commerce, Mergers & Combinations",
        "Money: evolution, qualities, functions; Stock Exchange: securities (stocks, shares, bonds, debentures), Second-Tier Securities Market (SSM)",
        "Elements of Business Management: functions (planning, organizing, staffing, directing), principles (span of control, unity of command), structures (line, matrix, committee), 5 Ms (Man, Money, Materials, Machines, Opportunities)",
        "Marketing & Legal Aspects: Marketing mix (4 Ps), market segmentation, consumer protection (CPC, NAFDAC, NDLEA), contracts, patents, trademarks, commodity exchange"
      ],
      objectives: [
        "Identify business forms, capital calculations, management functions, marketing mix, and legal regulations in business."
      ]
    }
  ],
  recommendedTexts: [
    { author: "Adedokun, M.O., Udokogu, P.C and Ogunji, C.O.N", title: "Senior Secondary Commerce (Books 1 - 3)" },
    { author: "Longe, O.A.", year: "2020", title: "Essential Commerce for Secondary Schools", publisher: "Tonad Publishers Limited, Lagos" },
    { author: "Ahukannah, L. I. et al.", year: "1992", title: "Commerce for Secondary Schools", publisher: "Africana First Publishers" },
    { author: "Asaolu, A. and Igwe, P. M.", year: "2005", title: "New Syllabus Commerce for Secondary Schools (1 - 3)", publisher: "Evans, Ibadan" }
  ],
  lastUpdated: "2026-07-28"
};

export const ECONOMICS_SYLLABUS: UTMESyllabus = {
  id: "economics",
  subject: "Economics",
  category: "Social Science",
  generalObjectives: [
    "Demonstrate knowledge of basic economic concepts, tools and analytical methods;",
    "Identify economic units, structures and national/international institutions;",
    "Describe economic activities (production, distribution, consumption); and",
    "Identify current economic issues in Nigeria and proffer viable solutions."
  ],
  topics: [
    {
      id: "econ_1",
      topicNumber: 1,
      title: "Introduction to Economics, Systems & Analytical Tools",
      contents: [
        "Basic Concepts: wants, scarcity, choice, scale of preference, opportunity cost, Production Possibility Curve (PPC/PPF)",
        "Economic Systems: free enterprise (capitalism), centrally planned (socialism), mixed economy; contemporary Nigerian economic reforms (deregulation, cash policy, banking consolidation)",
        "Methods & Tools: inductive/deductive reasoning, positive vs normative economics, graphs, tables, central tendency (mean, median, mode), dispersion (range, variance, standard deviation)"
      ],
      objectives: [
        "Apply basic economic concepts and interpret PPF curves;",
        "Compare economic systems and calculate statistical measures of central tendency and dispersion."
      ]
    },
    {
      id: "econ_2",
      topicNumber: 2,
      title: "Theory of Demand, Consumer Behaviour, Supply & Price",
      contents: [
        "Demand: determinants, schedule/curve, change in quantity demanded vs change in demand, types (composite, derived, competitive, joint), price/income/cross elasticity calculations",
        "Consumer Behaviour: Utility (cardinal & ordinal, total/average/marginal), diminishing marginal utility, indifference curves, budget line, consumer equilibrium, consumer surplus",
        "Supply: determinants, schedule/curve, change in quantity supplied vs change in supply, types (joint, competitive, composite), price elasticity of supply",
        "Price Determination: market equilibrium, price system functions, price control legislation (minimum and maximum price ceilings)"
      ],
      objectives: [
        "Calculate price, income, and cross elasticities of demand and supply;",
        "Determine consumer equilibrium using indifference curves and calculate market equilibrium price/quantity."
      ]
    },
    {
      id: "econ_3",
      topicNumber: 3,
      title: "Production, Costs, Revenue & Market Structures",
      contents: [
        "Production: Total Product (TP), Average Product (AP), Marginal Product (MP), Law of Variable Proportions, economies of scale (internal & external), returns to scale, isoquant-isocost analysis",
        "Costs & Revenue: Fixed, Variable, Total, Average, Marginal Costs/Revenues; Accountant vs Economist costs, short-run vs long-run curves",
        "Market Structures: Perfect competition (characteristics, short-run & long-run equilibrium), Imperfect competition (Monopoly, Monopolistic competition, Oligopoly), break-even and shut-down conditions"
      ],
      objectives: [
        "Relate TP, AP, MP with the law of variable proportions;",
        "Differentiate short-run and long-run cost curves and determine break-even/shut-down points across market structures."
      ]
    },
    {
      id: "econ_4",
      topicNumber: 4,
      title: "Macroeconomics: National Income, Money, Banking & Public Finance",
      contents: [
        "National Income: GDP, GNP, NNP, NI, personal/disposable income, measurement methods (income, output, expenditure) & problems, circular flow (2 and 3 sector models), multiplier effect",
        "Money & Inflation: money functions & qualities, Quantity Theory of Money (Fisher's equation MV=PT), Inflation (types, Demand-pull, Cost-push, Consumer Price Index CPI, control measures), Deflation",
        "Financial Institutions: Central Bank, Deposit Money Banks, credit creation process, monetary policy instruments (reserve ratio, bank rate, open market operations OMO)",
        "Public Finance: Fiscal policy, revenue sources (taxation principles & incidence, oil royalties), government budget (surplus, deficit), public debt, revenue allocation formula in Nigeria"
      ],
      objectives: [
        "Compute GDP/GNP, multipliers, and CPI inflation index;",
        "Explain money creation by commercial banks and monetary/fiscal policies for economic stabilization."
      ]
    },
    {
      id: "econ_5",
      topicNumber: 5,
      title: "Growth, Agriculture, Industry, Trade & Population",
      contents: [
        "Economic Growth & Development: indicators, planning in Nigeria, problems",
        "Agriculture & Industry: roles, problems, industrial location & localization, NNPC, OPEC, petroleum upstream/downstream sectors",
        "Population: Malthusian theory, demographic transition, census, optimum population, government population policy",
        "International Trade & Orgs: Absolute & comparative advantage, balance of trade vs balance of payments, exchange rate systems, ECOWAS, AU, IMF, World Bank, WTO, UNCTAD",
        "Factors of Production Theories: marginal productivity theory of wages, liquidity preference theory of interest, unemployment types & solutions"
      ],
      objectives: [
        "Evaluate comparative advantage in international trade and balance of payments corrective measures;",
        "Analyze economic development strategies, population theories, and unemployment solutions in Nigeria."
      ]
    }
  ],
  recommendedTexts: [
    { author: "Aderinto, A.A et al.", year: "1996", title: "Economics: Exam Focus", publisher: "University Press Plc, Ibadan" },
    { author: "Lipsey, R.G.", year: "1997", title: "An Introduction to Positive Economics", publisher: "Oxford University Press" },
    { author: "Udu, E. and Agu, G.A.", year: "2005", title: "New System Economics: A Senior Secondary Course", publisher: "Africana FIRST Publishers" },
    { author: "Eyiyere, D.O.", year: "1980", title: "Economics Made Easy", publisher: "Quality Publishers Ltd., Benin City" }
  ],
  lastUpdated: "2026-07-28"
};

export const GEOGRAPHY_SYLLABUS: UTMESyllabus = {
  id: "geography",
  subject: "Geography",
  category: "Social Science",
  generalObjectives: [
    "Handle and interpret topographical maps, photos, statistical data and field survey;",
    "Demonstrate knowledge of physical and human environment (Nigeria, Africa, World);",
    "Understand the interrelationship between man and his environment; and",
    "Apply geographical concepts and field work techniques to problem solving."
  ],
  sections: [
    {
      id: "geo_sec_1",
      title: "PRACTICAL GEOGRAPHY",
      topics: [
        {
          id: "geo_1",
          topicNumber: 1,
          title: "Map Work, Surveying & GIS",
          contents: [
            "Map scale, distance/area measurement, reduction/enlargement, bearings, gradients",
            "Map reading & interpretation: relief cross profiles, intervisibility, physical/human features",
            "Statistical data presentation: charts, graphs, maps",
            "Elementary Surveying: chain & prismatic compass traverse, procedure, advantages/disadvantages",
            "Geographic Information System (GIS): components, data sources (remote sensing, scanning, digitizing), applications in defense, agriculture, rural development, problems in Nigeria"
          ],
          objectives: [
            "Calculate scale conversions, bearings, gradients, and draw topographic cross-sections;",
            "Explain surveying techniques and GIS applications in spatial analysis."
          ]
        }
      ]
    },
    {
      id: "geo_sec_2",
      title: "PHYSICAL GEOGRAPHY",
      topics: [
        {
          id: "geo_2",
          topicNumber: 2,
          title: "The Earth, Crust, Landforms & Water Bodies",
          contents: [
            "Earth as a planet: solar system, rotation (day/night) & revolution (seasons), shape/size, latitude & distance, longitude & local time calculations",
            "Earth's Crust: internal/external structure, rock types (igneous, sedimentary, metamorphic), rock formation, tectonic forces, landforms (mountains, plateaux, plains, karst, desert landforms)",
            "Volcanism & Earthquakes: intrusive/extrusive landforms, major world volcanic events",
            "Denudation: weathering, erosion, mass movement, deposition by water, wind, waves",
            "Water Bodies: oceans & seas, ocean currents (types, causes, effects), lakes, river development stages & landforms"
          ],
          objectives: [
            "Calculate local time and latitude distance on Earth's surface;",
            "Identify landforms produced by faulting, folding, volcanism, weathering, rivers, wind, and coastal processes."
          ]
        },
        {
          id: "geo_3",
          topicNumber: 3,
          title: "Weather, Climate, Soils & Ecosystems",
          contents: [
            "Weather & Climate: elements, factors (air mass, altitude, continentality, winds), Köppen & Greek classifications, weather instruments, climate change science & effects",
            "Vegetation: plant growth factors, plant communities, major world biomes, human impact",
            "Soils: formation factors, profile/horizons, tropical soil types, soil erosion & conservation",
            "Ecosystems & Environmental Conservation: renewable/non-renewable resources, environmental hazards (drought, flooding, desertification, soil erosion), conservation methods"
          ],
          objectives: [
            "Interpret Köppen climate symbols and weather instrument readings;",
            "Describe soil profiles, cause/prevention of environmental hazards, and conservation strategies."
          ]
        }
      ]
    },
    {
      id: "geo_sec_3",
      title: "HUMAN & REGIONAL GEOGRAPHY",
      topics: [
        {
          id: "geo_4",
          topicNumber: 4,
          title: "Population, Settlements, Economic Activities & Regional Geography",
          contents: [
            "Population: world distribution (Amazon, NE USA, India, Japan, West Africa), birth/death rates, age-sex pyramids, migration types/causes/effects",
            "Settlement: rural vs urban, settlement patterns (linear, nucleated, dispersed), urban hierarchy & problems",
            "Economic Activities: primary, secondary, tertiary, quaternary; manufacturing location factors; transport modes & world trade routes; tourism",
            "Regional Geography of Nigeria: location, size, political divisions (36 states & FCT), relief, drainage, climate, vegetation zones, natural resources, agriculture, industry, ECOWAS member states & mandate"
          ],
          objectives: [
            "Analyze population density, migration patterns, and settlement growth factors;",
            "Describe physical and economic geography of Nigeria and ECOWAS integration."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Iwena, O.A.", year: "2018", title: "Essential Geography for Senior Secondary Schools", publisher: "Tonad Publishers Limited, Ibafo" },
    { author: "Adeleke, B.O. and Leong, G.C.", year: "2002", title: "Certificate Physical and Human Geography for Senior Secondary Schools", publisher: "Oxford University Press, Ibadan" },
    { author: "Iloeje, N. P.", year: "1999", title: "A New Geography of West Africa / A New Geography of Nigeria", publisher: "Longman, Hong Kong" },
    { author: "Adegoke, M.A.", year: "2013", title: "A Comprehensive Text on Physical, Human and Regional Geography" }
  ],
  lastUpdated: "2026-07-28"
};

export const GOVERNMENT_SYLLABUS: UTMESyllabus = {
  id: "government",
  subject: "Government",
  category: "Social Science",
  generalObjectives: [
    "Appreciate the meaning, institutions, and basic concepts of Government;",
    "Understand democratic principles, citizenship rights, and duties;",
    "Trace political development, constitutions, and governance in Nigeria; and",
    "Assess Nigeria's foreign policy and role in international organizations."
  ],
  sections: [
    {
      id: "gov_sec_1",
      title: "PART 1: ELEMENTS OF GOVERNMENT",
      topics: [
        {
          id: "gov_1",
          topicNumber: 1,
          title: "Concepts, Forms, Arms & Systems of Government",
          contents: [
            "Definition & Scope of Government; Basic concepts: Power, Authority, Legitimacy, Sovereignty, State, Nation, Nation-State, Political Socialization & Culture",
            "Forms of Government: Monarchy, Aristocracy, Oligarchy, Autocracy, Republicanism, Democracy",
            "Arms of Government: Legislature (unicameral/bicameral), Executive, Judiciary, interrelationships & checks and balances",
            "Structures of Governance: Unitary, Federal, Confederal; Systems: Presidential, Parliamentary, Monarchical",
            "Political Ideologies: Capitalism, Socialism, Communism, Feudalism, Fascism, Nazism, Liberalism",
            "Constitutions & Principles: Written/Unwritten, Rigid/Flexible; Separation of Powers, Rule of Law, Constitutionalism, Delegated Legislation",
            "Citizenship, Electoral Process, Political Parties, Pressure Groups, Public Opinion, Civil/Public Service"
          ],
          objectives: [
            "Define government concepts, forms, structures, and systems;",
            "Compare parliamentary and presidential systems, and explain citizenship acquisition and rule of law."
          ]
        }
      ]
    },
    {
      id: "gov_sec_2",
      title: "PART 2: POLITICAL DEVELOPMENT IN NIGERIA",
      topics: [
        {
          id: "gov_2",
          topicNumber: 2,
          title: "Pre-Colonial, Colonialism, Decolonization & Constitutions",
          contents: [
            "Pre-colonial polities: Hausa/Fulani Emirate, Oyo Yoruba system, Igbo decentralized system, Tiv political organization",
            "Colonial rule: British Indirect Rule in Northern, Western, and Eastern Nigeria; French Assimilation vs Association policies",
            "Decolonization & Nationalism: Herbert Macaulay, Nnamdi Azikiwe, Obafemi Awolowo, Ahmadu Bello, Tafawa Balewa, J.S. Tarka; nationalist movements & parties",
            "Constitutional Development: Clifford (1922), Richards (1946), Macpherson (1951), Lyttleton (1954), Independence (1960), Republican (1963), 1979, 1989, and 1999 (as amended) Constitutions"
          ],
          objectives: [
            "Compare pre-colonial administration across Nigeria's major ethnic groups;",
            "Trace features, merits, and shortcomings of colonial constitutions from 1922 to 1999."
          ]
        },
        {
          id: "gov_3",
          topicNumber: 3,
          title: "Post-Independence Governance, Federalism & Military Rule",
          contents: [
            "Post-Independence republics: 1st, 2nd, 3rd, 4th Republic party politics and elections",
            "Nigerian Federalism: rationale, state creation (1963, 1967, 1976, 1987, 1991, 1996), Federal Character Principle, revenue allocation disputes",
            "Public Commissions: Civil Service Commission, Public Complaints Commission (PCC), INEC, ICPC, EFCC",
            "Public Corporations, Privatization & Commercialization; Local Government Reforms (1976, 1989)",
            "Military Rule: factors for coups, military structure (SMC, AFRC, PRC), political/economic impact (NYSC, state creation, SAP), military disengagement processes"
          ],
          objectives: [
            "Evaluate problems of Nigerian federalism, local government reforms, and military intervention in politics."
          ]
        }
      ]
    },
    {
      id: "gov_sec_3",
      title: "PARTS 3 & 4: FOREIGN POLICY & INTERNATIONAL ORGANIZATIONS",
      topics: [
        {
          id: "gov_4",
          topicNumber: 4,
          title: "Foreign Policy & International Relations",
          contents: [
            "Foreign Policy: definition, determinants, formulation & implementation",
            "Nigeria's Foreign Policy: non-alignment posture, Africa as centerpiece, Technical Aid Corps (TAC), peace-keeping operations (UN, ECOWAS/ECOMOG), NEPAD",
            "International Organizations: UN, Commonwealth of Nations, OAU/AU, ECOWAS, OPEC, APPA (origin, objectives, structure, achievements, problems)"
          ],
          objectives: [
            "Explain determinants of foreign policy and evaluate Nigeria's leadership role in Africa;",
            "Assess the achievements and challenges of international organizations (UN, AU, ECOWAS, OPEC)."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Dibie, C. Chris", year: "2020", title: "Essential Government for Senior Secondary Schools", publisher: "Tonad Publishers Limited, Ibafo" },
    { author: "Oyediran, O. et al.", year: "1990", title: "Government for Senior Secondary Schools (Books 1 - 3)", publisher: "Longman, Ibadan" },
    { author: "Adigwe, F.", year: "1985", title: "Essentials of Government for West Africa", publisher: "University Press Plc, Ibadan" },
    { author: "Appadorai, A.", year: "1978", title: "The Substance of Politics", publisher: "Oxford University Press, London" }
  ],
  lastUpdated: "2026-07-28"
};
