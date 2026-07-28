import { UTMESyllabus } from './types';

export const CHEMISTRY_SYLLABUS: UTMESyllabus = {
  id: "chemistry",
  subject: "Chemistry",
  category: "Science",
  generalObjectives: [
    "Understand the basic principles and concepts in chemistry;",
    "Interpret scientific data relating to chemistry;",
    "Deduce the relationships between chemistry and other sciences; and",
    "Apply the knowledge of chemistry to industry and everyday life."
  ],
  topics: [
    {
      id: "chem_1",
      topicNumber: 1,
      title: "Separation of Mixtures and Purification of Chemical Substances",
      contents: [
        "Elements, compounds and mixtures",
        "Chemical and physical changes",
        "Pure and impure substances",
        "Boiling, density, freezing and melting points as criteria for purity",
        "Separation processes: Evaporation, simple and fractional distillation, sublimation, re-crystallization, paper and column chromatography, simple and fractional crystallization, magnetization, decantation, filtration and centrifugation"
      ],
      objectives: [
        "Distinguish between elements, compounds and mixtures;",
        "Differentiate between chemical and physical changes;",
        "Distinguish between pure and impure substances;",
        "Use boiling and melting points as criteria for purity of chemical substances;",
        "Identify the properties of the components of a mixture;",
        "Specify the principle involved in each separation method;",
        "Apply the basic principle of separation processes in everyday life."
      ]
    },
    {
      id: "chem_2",
      topicNumber: 2,
      title: "Chemical Combination",
      contents: [
        "Laws of definite, multiple and reciprocal proportions",
        "Law of conservation of matter",
        "Chemical symbols, formulae, equations and their uses",
        "Relative atomic mass based on 12C = 12",
        "The mole concept and stoichiometry of reactions"
      ],
      objectives: [
        "Deduce the chemical laws from given expressions/statements/data;",
        "Perform simple calculations involving formulae, equations/chemical composition and the mole concept;",
        "Deduce the stoichiometry of chemical reactions."
      ]
    },
    {
      id: "chem_3",
      topicNumber: 3,
      title: "Kinetic Theory of Matter and Gas Laws",
      contents: [
        "Phenomena supporting kinetic theory: melting, vaporization, boiling, freezing, condensation in terms of molecular motion and Brownian movement",
        "Gas laws: Boyle's, Charles's, Avogadro's, Gay-Lussac's, Graham's, and Dalton's (law of partial pressure)",
        "Molar volume and atomicity of gases",
        "The ideal gas equation (PV = nRT)",
        "Relationship between vapour density of gases and relative molecular mass",
        "Ideal vs Real gases and factors causing deviation"
      ],
      objectives: [
        "Apply kinetic theory to distinguish between solids, liquids and gases;",
        "Deduce reasons for change of state and draw inferences based on molecular motion;",
        "Deduce gas laws from given expressions/statements and interpret graphical representations;",
        "Perform simple calculations based on gas laws, equations and relationships;",
        "State factors responsible for the deviation of real gases from ideal situation."
      ]
    },
    {
      id: "chem_4",
      topicNumber: 4,
      title: "Atomic Structure and Bonding",
      contents: [
        "Concept of atoms, molecules and ions; contributions of Dalton, Millikan, Rutherford, Moseley, Thomson and Bohr",
        "Atomic structure, four quantum numbers, principles governing arrangement of electrons into orbitals, electron configuration, atomic/mass numbers, isotopes (atomic numbers 1 to 20)",
        "Shapes of s and p orbitals",
        "Periodic table and periodicity: alkali & alkaline-earth metals, halogens, noble gases, transition metals. Periodic trends: ionization energy, ionic radii, electron affinity, electronegativity, conductivities",
        "Chemical bonding: Electrovalency, covalency, noble gas stability. Hydrogen, metallic, coordinate bonds ([Fe(CN)6]3-, [Fe(CN)6]4-, [Cu(NH3)4]2+, [Ag(NH3)2]+), Van der Waals' forces",
        "Shapes of simple molecules: linear (H2, O2, Cl2, HCl, CO2), non-linear (H2O), tetrahedral (CH4), pyramidal (NH3)"
      ],
      objectives: [
        "Distinguish between atoms, molecules and ions and identify scientists' contributions;",
        "Deduce protons, neutrons and electrons from atomic/mass numbers and apply configuration rules;",
        "Identify elements exhibiting isotopy and perform calculations relating to isotopy;",
        "Differentiate between shapes of orbitals (s and p) and determine electron capacities;",
        "Relate atomic numbers to position in the periodic table and explain periodicity across periods/groups;",
        "Differentiate between electrovalency, covalency, coordinate, metallic and hydrogen bonding;",
        "Differentiate between various molecular shapes."
      ]
    },
    {
      id: "chem_5",
      topicNumber: 5,
      title: "Nuclear Chemistry",
      contents: [
        "Radioactivity - Types, properties and detection of radiations (alpha, beta, gamma)",
        "Natural and artificial radioactivity",
        "Nuclear stability and radioactive decay",
        "Nuclear reactions: Nuclear fusion and fission",
        "Half-life calculations and applications of radioactivity"
      ],
      objectives: [
        "Distinguish between ordinary chemical reaction and nuclear reaction;",
        "Differentiate between natural and artificial radioactivity;",
        "Compare properties of nuclear radiations and compute half-life calculations;",
        "Balance simple nuclear equations and identify applications of radioactivity."
      ]
    },
    {
      id: "chem_6",
      topicNumber: 6,
      title: "Solubility",
      contents: [
        "Unsaturated, saturated and supersaturated solutions. Solubility curves and simple deductions (solubility in mole/dm3) and calculations",
        "Solvents for fats, oil, perspiration and paints; use of solvents for stain removal",
        "True vs False solutions (Suspensions and colloids): Harmattan haze and water paints as suspensions; fog, milk, blood, aerosol spray, emulsion paints, rubber solution as colloids"
      ],
      objectives: [
        "Distinguish between types of solutions and interpret solubility curves;",
        "Calculate the amount of solute that can dissolve at a given temperature;",
        "Relate nature of solvents to their uses for stain removal;",
        "Differentiate among true solutions, suspensions and colloids with typical examples."
      ]
    },
    {
      id: "chem_7",
      topicNumber: 7,
      title: "Environmental Pollution",
      contents: [
        "Air: natural gaseous constituents (nitrogen, oxygen, water vapour, CO2, argon, neon), air as a mixture, uses of noble gases",
        "Air pollution: H2S, CO, SO2, nitrogen oxides, CFCs, dust; sources and effects",
        "Water pollution: sewage, oil spillage; Soil pollution: biodegradable vs non-biodegradable pollutants"
      ],
      objectives: [
        "Give reasons for existence of air as a mixture and principle of air separation;",
        "Identify types, sources, and environmental effects of air, water and soil pollutants;",
        "Classify pollutants as biodegradable and non-biodegradable and identify control measures."
      ]
    },
    {
      id: "chem_8",
      topicNumber: 8,
      title: "Acids, Bases and Salts",
      contents: [
        "General characteristics, properties and uses of acids, bases, salts. Indicators, basicity of acids; normal, acidic, basic and double salts (alums). H3O+ / proton donor concept. Ethanoic, citric, tartaric acids",
        "Methods of salt preparation: neutralization, precipitation, action of acids on metals",
        "Conductance of molar solutions of strong/weak acids and bases",
        "pH and pOH scales, calculations, buffer solutions",
        "Acid/base titrations and hydrolysis of salts (NH4Cl, AlCl3, Na2CO3, CH3COONa)"
      ],
      objectives: [
        "Distinguish between properties of acids and bases and determine basicity of acids;",
        "Identify salt preparation methods and classify salt types;",
        "Relate degree of dissociation to acid/base strength and conductance;",
        "Perform simple calculations on pH and pOH and state applications of buffer solutions;",
        "Interpret titration curves and deduce acidic, basic or neutral properties from salt hydrolysis."
      ]
    },
    {
      id: "chem_9",
      topicNumber: 9,
      title: "Oxidation and Reduction - Redox",
      contents: [
        "Oxidation as addition of oxygen/electron loss; Reduction as removal of oxygen/electron gain",
        "Oxidation numbers, oxidation state changes, balancing simple redox equations",
        "IUPAC nomenclature of inorganic compounds using oxidation numbers",
        "Tests for oxidizing and reducing agents"
      ],
      objectives: [
        "Identify forms of expressing oxidation/reduction and classify reactions;",
        "Balance redox reaction equations and compute oxidation numbers / electron transfer;",
        "Apply oxidation numbers in naming inorganic compounds;",
        "Distinguish between oxidizing and reducing agents."
      ]
    },
    {
      id: "chem_10",
      topicNumber: 10,
      title: "Electrolysis",
      contents: [
        "Electrolytes and non-electrolytes; Faraday's laws of electrolysis",
        "Electrolysis of dilute H2SO4, aqueous CuSO4, CuCl2, dilute/concentrated NaCl and fused NaCl",
        "Factors affecting discharge of ions at electrodes",
        "Uses of electrolysis: metal purification (copper), production of Al, Na, O2, Cl2, NaOH",
        "Electrochemical cells: Electrochemical series (K, Ca, Na, Mg, Al, Zn, Fe, Sn, Pb, H, Cu, Hg, Ag, Au), half-cell reactions, electrode potentials",
        "Corrosion as electrolytic process; protection methods (cathodic protection, painting, electroplating, greasing)"
      ],
      objectives: [
        "Distinguish between electrolytes and non-electrolytes and calculate Faraday's constant/moles;",
        "Determine electrode products and factors affecting ion discharge;",
        "Calculate electrode potentials using half-cell equations;",
        "Identify applications of electrolysis and corrosion prevention methods."
      ]
    },
    {
      id: "chem_11",
      topicNumber: 11,
      title: "Energy Changes",
      contents: [
        "Energy changes (ΔH) accompanying physical and chemical changes: Na, NaOH, K, NH4Cl in water. Endothermic (+ΔH) and exothermic (-ΔH) reactions",
        "Entropy (ΔS) as order-disorder phenomenon (mixing gases, dissolution of salts)",
        "Spontaneity: ΔG° = 0 for equilibrium; ΔG° < 0 for spontaneous; ΔG° > 0 for non-spontaneous; ΔG° = ΔH° - TΔS°"
      ],
      objectives: [
        "Determine heat changes (ΔH) in physical and chemical processes;",
        "Interpret graphical representations of heat changes and relate physical state to orderliness;",
        "Determine conditions for spontaneity using ΔG° = ΔH° - TΔS°."
      ]
    },
    {
      id: "chem_12",
      topicNumber: 12,
      title: "Rates of Chemical Reaction",
      contents: [
        "Factors affecting reaction rates: Temperature, Concentration/Pressure, Surface area (powdered vs lump marble), Catalyst (MnO2 in H2O2 / KClO3 decomposition)",
        "Reaction rate curves and Activation energy (Ea)",
        "Qualitative Arrhenius law, collision theory, effect of light (halogenation of alkanes)"
      ],
      objectives: [
        "Identify factors affecting reaction rates and describe experimental effects;",
        "Interpret reaction rate curves and deduce activation energy (Ea);",
        "Relate reaction rate to kinetic theory and collision theory."
      ]
    },
    {
      id: "chem_13",
      topicNumber: 13,
      title: "Chemical Equilibria",
      contents: [
        "Reversible reactions, dynamic equilibrium, Le Chatelier's principle and industrial applications",
        "Equilibrium constant. Examples: action of steam on iron, N2O4 <-> 2NO2 (no calculations required)"
      ],
      objectives: [
        "Identify factors affecting position of equilibrium and predict their effects;",
        "Specify industrial processes where Le Chatelier's principle is required."
      ]
    },
    {
      id: "chem_14",
      topicNumber: 14,
      title: "Non-metals and their Compounds",
      contents: [
        "Hydrogen: industrial production from water gas & petroleum cracking; lab preparation, properties, uses, test",
        "Halogens: Chlorine preparation, sterilization, bleaching, HCl, insecticides; Hydrogen chloride & Hydrochloric acid properties & chloride tests",
        "Oxygen & Sulphur: Oxygen lab/industrial preparation from liquid air; Oxides (acidic, basic, amphoteric, neutral), ozone. Water: combustion product, solvent, hard vs soft water (temporary/permanent), treatment for town supply, efflorescence, deliquescence, hygroscopy. Sulphur: allotropes, SO2, H2SO4 (Contact process), H2S, tests for SO4(2-), SO3(2-), S(2-)",
        "Nitrogen: Lab/industrial production, Ammonia (Haber process), ammonium salts, HNO3, Oxides of nitrogen (N2O, NO, NO2), Nitrogen cycle",
        "Carbon: Allotropes, CO2 (lab prep, heat on trioxocarbonates, tests), CO (prep, toxicity in blood, charcoal/exhaust fumes), Coal (types, destructive distillation), Coke (gasification, synthesis gas)"
      ],
      objectives: [
        "Predict reagents and methods for laboratory and industrial preparation of non-metal gases;",
        "Specify properties, tests, and uses for H2, Cl2, HCl, O2, H2O, SO2, H2SO4, H2S, NH3, HNO3, oxides of nitrogen, CO2, CO;",
        "Distinguish between hard/soft water, temporary/permanent hardness, and water treatment steps;",
        "Explain efflorescence, deliquescence, hygroscopy, and the nitrogen cycle."
      ]
    },
    {
      id: "chem_15",
      topicNumber: 15,
      title: "Metals and their Compounds",
      contents: [
        "General properties and extraction principles of metals based on reactivity",
        "Alkali metals (Sodium): NaOH from brine, Na2CO3 / NaHCO3 Solvay process, glass making, NaCl from sea water, test for Na+",
        "Alkaline-earth metals (Calcium): CaO, Ca(OH)2, CaCO3, lime from sea shells, cement & mortar setting, test for Ca(2+)",
        "Aluminium: Bauxite purification, Hall-Héroult electrolytic extraction, uses, test for Al(3+)",
        "Tin: Ores (cassiterite), extraction, properties, uses",
        "First transition series metals: Electron config, variable oxidation states, complex ion formation ([Fe(CN)6]3-, [Cu(NH3)4]2+), colored ions, catalysis",
        "Iron: Extraction from hematite/magnetite in blast furnace, steel production & advantages, tests for Fe(2+) & Fe(3+)",
        "Copper: Extraction, properties, CuSO4 preparation, test for Cu(2+)",
        "Alloys: Steel, stainless steel, brass, bronze, type-metal, duralumin, soft solder, permalloy, alnico (constituents & uses)"
      ],
      objectives: [
        "Relate extraction methods of metals to their position in reactivity series;",
        "Describe industrial processes (Solvay, Hall-Héroult, Blast furnace) and chemical tests for Na+, Ca2+, Al3+, Fe2+, Fe3+, Cu2+;",
        "Identify characteristics of transition metals and IUPAC names of complexes;",
        "Specify constituents and applications of major alloys."
      ]
    },
    {
      id: "chem_16",
      topicNumber: 16,
      title: "Organic Compounds",
      contents: [
        "Tetravalency of carbon, catenation, general formula, IUPAC nomenclature, empirical & molecular formula determination",
        "Aliphatic hydrocarbons: Alkanes (homologous series, substitution, petroleum cracking/reforming, octane rating); Alkenes (isomerism, addition/polymerization, polythene, rubber vulcanization, tests); Alkynes (ethyne production from CaC2, tests for terminal alkynes)",
        "Aromatic hydrocarbons: Benzene structure, resonance, properties",
        "Alkanols: Primary, secondary, tertiary, ethanol by fermentation and petroleum, local gin from palm wine, glycerol, Lucas test",
        "Alkanals and Alkanones: Distinction tests (Tollens, Fehling's)",
        "Alkanoic acids: Neutralization, esterification, oxalic acid, benzoic acid",
        "Alkanoates: Fats & oils, saponification (soap & detergent manufacture, margarine)",
        "Amines: Primary, secondary, tertiary alkanamines",
        "Carbohydrates: Mono-, di-, polysaccharides; hydrolysis of starch/cellulose, tests for simple sugars (Fehling's/Benedict's), iodine test",
        "Proteins: Structure, hydrolysis, tests (Ninhydrin, Biuret, Millon's, Xanthoproteic), enzymes",
        "Polymers: Natural/synthetic rubber, addition & condensation polymerization, thermoplastics vs thermosetting plastics"
      ],
      objectives: [
        "Derive IUPAC names, empirical/molecular formulae, and isomeric forms of organic compounds;",
        "Classify hydrocarbons and describe industrial petroleum refining, cracking, and octane number;",
        "Distinguish between primary, secondary, tertiary alkanols using the Lucas test;",
        "Describe saponification, tests for carbohydrates and proteins, and plastics classification."
      ]
    },
    {
      id: "chem_17",
      topicNumber: 17,
      title: "Chemistry and Industry",
      contents: [
        "Chemical industries: Types, raw materials, heavy vs fine chemicals, biotechnology applications in industry"
      ],
      objectives: [
        "Classify chemical industries by products and raw materials;",
        "Distinguish between fine and heavy chemicals and relate industrial processes to biotechnology."
      ]
    },
    {
      id: "chem_18",
      topicNumber: 18,
      title: "Astronomical Chemistry",
      contents: [
        "Solar system, planets, satellites, composition of Earth: atmosphere, lithosphere and hydrosphere"
      ],
      objectives: [
        "State the composition of the solar system, earth segments, and natural satellite of Earth."
      ]
    }
  ],
  recommendedTexts: [
    { author: "Ababio, O. Y.", year: "2009", title: "New School Chemistry for Senior Secondary Schools", edition: "4th Edition", publisher: "Africana FIRST Publishers Limited, Onitsha" },
    { author: "Bajah, S.T., Teibo, B. O., Onwu, G. and Obikwere, A.", year: "1999/2000", title: "Senior Secondary Chemistry (Books 1 - 3)", publisher: "Longman, Lagos" },
    { author: "Ojokuku, G. O.", year: "2012", title: "Understanding Chemistry for Schools and Colleges", edition: "Revised Edition", publisher: "Press-On Chemresources, Zaria" },
    { author: "Odesina, I. A.", year: "2008", title: "Essential: Chemistry for Senior Secondary Schools", edition: "2nd Edition", publisher: "Tonad Publishers Limited, Lagos" },
    { author: "Uche, I. O., Adenuga, I. J. and Iwuagwu, S. L.", year: "2003", title: "Countdown to WASSCE/SSCE, NECO, JME Chemistry", publisher: "Evans, Ibadan" }
  ],
  lastUpdated: "2026-07-28"
};

export const BIOLOGY_SYLLABUS: UTMESyllabus = {
  id: "biology",
  subject: "Biology",
  category: "Science",
  generalObjectives: [
    "Demonstrate sufficient knowledge of the concepts of the diversity, interdependence and unity of life;",
    "Account for continuity of life through reorganization, inheritance and evolution; and",
    "Apply biological principles and concepts to everyday life, especially to matters affecting living things, individual, society, the environment, community health and the economy."
  ],
  sections: [
    {
      id: "bio_sec_a",
      title: "A: VARIETY OF ORGANISMS",
      topics: [
        {
          id: "bio_1",
          topicNumber: 1,
          title: "Living Organisms",
          contents: [
            "Characteristics of living vs non-living things",
            "Cell structure and functions of plant and animal cell components",
            "Levels of organization: Cell (Euglena, Paramecium), Tissue (epithelial, Hydra), Organ (onion bulb), System (reproductive, digestive, excretory), Organism (Chlamydomonas)"
          ],
          objectives: [
            "Differentiate between living and non-living characteristics;",
            "Identify and compare structures and functions of plant and animal cells;",
            "Trace the logical sequence of the 5 levels of biological organization."
          ]
        },
        {
          id: "bio_2",
          topicNumber: 2,
          title: "Evolution Among Organisms",
          contents: [
            "Monera (prokaryotes): bacteria, blue-green algae",
            "Protista: Amoeba, Euglena, Paramecium",
            "Fungi: mushroom, Rhizopus",
            "Plantae: Thallophyta (Spirogyra), Bryophyta (mosses, Marchantia), Pteridophyta (Dryopteris), Spermatophyta (Gymnosperms, Angiosperms monocot/dicot)",
            "Animalia Invertebrates: Coelenterata (Hydra), Platyhelminthes (Taenia), Nematoda, Annelida (earthworm), Arthropoda (mosquito, cockroach, housefly, bee, butterfly), Mollusca (snails)",
            "Animalia Vertebrates: Pisces, Amphibia, Reptilia, Aves, Mammalia"
          ],
          objectives: [
            "Analyse structural complexity across kingdoms Monera, Protista, Fungi, Plantae and Animalia;",
            "Demonstrate transition from aquatic to terrestrial life across plant and animal phyla;",
            "Determine economic importance of insects and multicellular animals."
          ]
        },
        {
          id: "bio_3",
          topicNumber: 3,
          title: "Structural/Functional and Behavioural Adaptations",
          contents: [
            "Adaptive colouration: countershading in fish/toads/snakes, warning colouration in mushrooms",
            "Behavioural adaptations in social insects (termite castes) and environmental extremes (basking, hibernation, aestivation)",
            "Structural adaptations for food capture, defense, securing mates, temperature regulation, and water conservation"
          ],
          objectives: [
            "Describe how adaptations fit organisms to their habitats and ways of life;",
            "Differentiate termite castes and functions in colony hives;",
            "Explain mechanisms for food obtaining, protection, mating display, thermoregulation, and water conservation."
          ]
        }
      ]
    },
    {
      id: "bio_sec_b",
      title: "B: FORM AND FUNCTIONS",
      topics: [
        {
          id: "bio_4",
          topicNumber: 4,
          title: "Internal Structure of Plants and Mammals",
          contents: [
            "Transverse sections of root, stem, leaf in flowering plants; supporting tissues (collenchyma, sclerenchyma, xylem, phloem)",
            "Internal organs layout in mammals: digestive, reproductive, excretory organs"
          ],
          objectives: [
            "Identify transverse sections and relate supporting tissues to plant structure;",
            "Examine mammalian internal organ arrangements."
          ]
        },
        {
          id: "bio_5",
          topicNumber: 5,
          title: "Nutrition",
          contents: [
            "Modes of nutrition: Autotrophic (photosynthesis, chemosynthesis) vs Heterotrophic (holozoic, parasitic, saprophytic, carnivorous plants)",
            "Photosynthesis: light and dark reactions, necessity of light/CO2/chlorophyll, starch test",
            "Plant mineral requirements: N, P, K macro/micro nutrients and deficiency symptoms",
            "Animal nutrition: Food classes, food tests, mammalian teeth & dental formulae (man, sheep, dog), alimentary canal and digestive enzymes"
          ],
          objectives: [
            "Compare autotrophic and heterotrophic modes of nutrition;",
            "Differentiate light and dark reactions of photosynthesis and test for starch;",
            "Relate food classes, dental formulae, and digestive enzymes to animal digestion."
          ]
        },
        {
          id: "bio_6",
          topicNumber: 6,
          title: "Transport System",
          contents: [
            "Need for transport system in complex organisms; materials transported",
            "Mammalian circulatory system: heart, blood vessels (hepatic portal vein, pulmonary vessels, aorta, renal vessels), blood & lymph composition",
            "Plant vascular system: xylem and phloem functions, transpiration pull, root pressure, active transport",
            "Diffusion, osmosis, plasmolysis, turgidity"
          ],
          objectives: [
            "Relate body size and complexity to the need for transport systems;",
            "Describe blood circulation and plant vascular transport mechanisms."
          ]
        },
        {
          id: "bio_7",
          topicNumber: 7,
          title: "Respiration",
          contents: [
            "Respiratory organs: body surface, gills, trachea, lungs, stomata, lenticels",
            "Chemical processes: Glycolysis and Krebs cycle with ATP production",
            "Stomatal opening/closing mechanism",
            "Aerobic vs Anaerobic respiration and yeast fermentation"
          ],
          objectives: [
            "Outline chemical pathways in glycolysis and Krebs cycle;",
            "Compare gaseous exchange mechanisms in plants and animals;",
            "Demonstrate anaerobic fermentation using yeast and sugar."
          ]
        },
        {
          id: "bio_8",
          topicNumber: 8,
          title: "Excretion & Support/Movement & Reproduction",
          contents: [
            "Excretory structures: contractile vacuole, flame cell, nephridium, Malpighian tubule, kidney, lungs, skin, plant excretory products",
            "Plant movements (tropic, tactic, nastic, sleep), auxins; animal skeleton (exo/endoskeleton), joints and locomotion",
            "Reproduction: Asexual (fission, budding, vegetative propagation, grafting), Sexual in plants (floral parts, pollination, placentation, fruit development) and mammals (gametogenesis, fertilization, embryo development, birth control, IVF)"
          ],
          objectives: [
            "Relate excretory structures to osmoregulation and waste elimination;",
            "Differentiate plant tropisms and mammalian skeletal structures;",
            "Compare sexual and asexual reproduction in plants and mammals."
          ]
        },
        {
          id: "bio_9",
          topicNumber: 9,
          title: "Growth, Co-ordination, Control and Homeostasis",
          contents: [
            "Germination conditions, epigeal vs hypogeal germination",
            "Nervous coordination: CNS, PNS, reflex actions, voluntary vs conditioned reflexes",
            "Sense organs: skin, nose, tongue, eye, ear and defects",
            "Hormonal control: pituitary, thyroid, adrenal, pancreas, gonads; plant phytohormones (auxins, gibberellins, cytokinins, ethylene)",
            "Homeostasis: body temperature, salt and water regulation"
          ],
          objectives: [
            "Differentiate epigeal and hypogeal germination;",
            "Explain central/peripheral nervous systems, reflex arcs, and sense organ defects;",
            "Relate endocrine hormones and phytohormones to growth and homeostasis."
          ]
        }
      ]
    },
    {
      id: "bio_sec_c",
      title: "C: ECOLOGY",
      topics: [
        {
          id: "bio_10",
          topicNumber: 10,
          title: "Ecology, Ecosystems, Biomes and Human Impact",
          contents: [
            "Abiotic factors (temp, rainfall, humidity, salinity, pH, secchi disc) & biotic factors",
            "Food chains, food webs, trophic levels, nutrient cycles (carbon, water, nitrogen)",
            "Natural habitats (aquatic, terrestrial, arboreal) and Nigerian biomes (tropical rainforest, Guinea/Sudan savanna, desert, Obudu/Jos/Mambilla montane)",
            "Population ecology: density calculations, competition, primary & secondary succession",
            "Soil properties (sandy, loamy, clayey), profile, fertility, conservation (terracing, contouring, crop rotation)",
            "Human impact: endemic diseases (malaria, cholera, TB, STDs), drug abuse, pollution (air/water/soil), conservation agencies (NCF, WWF, IUCN, UNEP, national parks)"
          ],
          objectives: [
            "Measure abiotic factors using appropriate instruments;",
            "Trace carbon, water, and nitrogen cycles;",
            "Identify characteristics of local Nigerian biomes and soil conservation methods;",
            "Assess causes/prevention of diseases, pollution, and wildlife conservation."
          ]
        }
      ]
    },
    {
      id: "bio_sec_d",
      title: "D: HEREDITY, VARIATIONS & EVOLUTION",
      topics: [
        {
          id: "bio_11",
          topicNumber: 11,
          title: "Heredity, Variations, Biotechnology and Evolution",
          contents: [
            "Morphological vs physiological variations (height, weight, fingerprints, PTC, blood groups); crime & paternity applications",
            "Genetics: Mendel's laws, DNA structure, monohybrid/dihybrid crosses, sex-linked traits (baldness, haemophilia, colour blindness), genetic counselling (sickle-cell, Rhesus factor)",
            "Biotechnology: applications in agriculture, medicine, pharmaceuticals, food industry, GMOs, gene therapy",
            "Evolution: Theories of Lamarck, Darwin, Organic evolution; Evidence from fossils, comparative anatomy, embryology, molecular genetics"
          ],
          objectives: [
            "Distinguish continuous and discontinuous variations with examples;",
            "Apply Mendel's principles to cross-breeding and marriage counselling;",
            "Define biotechnology applications and evaluate evidences for evolution."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Ndu, F.O., C. Ndu, Abun A. and Aina J.O.", year: "2001", title: "Senior Secondary School Biology (Books 1 - 3)", publisher: "Longman, Lagos" },
    { author: "Ramalingam, S.T.", year: "2018", title: "Modern Biology (SS Science Series)", edition: "New Edition", publisher: "African First Publishers (AFP)" },
    { author: "Idodo - Umeh, G.", year: "2015", title: "College Biology", publisher: "Idodo - Umeh Publishers Ltd." },
    { author: "Micheal, M.C.", year: "2018", title: "Essential Biology for Senior Secondary Schools", publisher: "TONAD Publishers Ltd." },
    { author: "STAN", year: "2004", title: "Biology for Senior Secondary Schools", edition: "Revised Edition", publisher: "Heinemann, Ibadan" }
  ],
  lastUpdated: "2026-07-28"
};

export const COMPUTER_STUDIES_SYLLABUS: UTMESyllabus = {
  id: "computer_studies",
  subject: "Computer Studies",
  category: "Science",
  generalObjectives: [
    "Understand the evolution of computing systems;",
    "Acquire basic concepts of computer and its operations;",
    "Develop problem solving, data processing and practical skills in computing;",
    "Master system software, application packages, ICT, ethics, AI & robotics, and career paths."
  ],
  sections: [
    {
      id: "cs_sec_a",
      title: "SECTION A: Evolution & Fundamentals of Computing",
      topics: [
        {
          id: "cs_1",
          topicNumber: 1,
          title: "History & Classification of Computing Devices",
          contents: [
            "Early computing devices: Abacus, Slide Rule, Napier's Bones, Pascal Calculator, Leibnitz Multiplier, Jacquard Loom, Babbage's Analytical Engine, Hollerith Census machine, Burrough's machine",
            "20th century electronic computers: ENIAC, EDVAC, UNIVAC 1, Desktop PCs",
            "Classifications: By Generation (1st to 5th), By Size (micro, mini, mainframe, super), By Purpose (special vs general), By Type (digital, analog, hybrid)"
          ],
          objectives: [
            "Identify historical computing devices and their inventors;",
            "Compare computer generations by technology, speed, capacity, and size."
          ]
        },
        {
          id: "cs_2",
          topicNumber: 2,
          title: "Hardware, CPU, Storage & Logic Circuits",
          contents: [
            "Hardware constituents: Input, Output, CPU, Storage media",
            "CPU components: ALU, CU, Registers (MDR, MAR, MBR, AC, PC, CIR), Buses (data, address, control)",
            "Primary Memory: RAM (SRAM, DRAM), ROM (PROM, EPROM, EEPROM)",
            "Secondary Storage: HDD, SSD, Magnetic tape, CD/DVD, USB drives, memory units (bits, bytes, KB, MB, GB, TB, PB)",
            "Logic Circuits: Gates (AND, OR, NOT, NAND, NOR, XOR), truth tables, logic equations, comparators"
          ],
          objectives: [
            "Explain CPU registers, memory hierarchy, and storage measurement units;",
            "Construct truth tables and logic circuit diagrams for basic gates."
          ]
        }
      ]
    },
    {
      id: "cs_sec_b",
      title: "SECTION B: Software & Application Packages",
      topics: [
        {
          id: "cs_3",
          topicNumber: 3,
          title: "System & Application Software & Office Suites",
          contents: [
            "System Software: Operating Systems (Windows, Linux, Unix, Android, iOS), Utilities (antivirus, backup, disk defragmenter), Translators (Compilers, Interpreters, Assemblers)",
            "Application Packages: Word Processing (MS Word), Spreadsheets (MS Excel), Databases (MS Access), Graphics (CorelDraw, Photoshop), Presentation (PowerPoint), Web Design (Dreamweaver, HTML/XML)"
          ],
          objectives: [
            "Differentiate between compilers, interpreters, and assemblers;",
            "Perform core practical tasks in MS Word, Excel, Access, CorelDraw, PowerPoint, and Web design."
          ]
        }
      ]
    },
    {
      id: "cs_sec_c",
      title: "SECTION C: Files, Safety, ICT, Programming, AI & Ethics",
      topics: [
        {
          id: "cs_4",
          topicNumber: 4,
          title: "Data Management, Networks, Programming & AI",
          contents: [
            "File Management: Structure (data item -> field -> record -> file -> database), Organizations (serial, sequential, indexed, random), Master/Transaction files, security & backup",
            "ICT & Networks: Topologies (Star, Bus, Ring), Types (PAN, LAN, MAN, WAN), Devices (Hub, Switch, Router, Modem, NIC), Web protocols (HTTP, HTTPS, FTP)",
            "Programming & SDLC: Levels (Machine, Assembly, High-level), Algorithms & Flowcharts, SDLC stages (Feasibility, Analysis, Design, Coding, Testing, Maintenance)",
            "Artificial Intelligence & Robotics: Machine Learning (supervised, unsupervised, reinforcement), Neural networks, Expert systems, NLP; Robot components (sensors, actuators, controllers)",
            "Computer Ethics & Security: Cybercrime, CIA triad (Confidentiality, Integrity, Availability), threats (malware, phishing, ransomware, SQLi), safety measures & career paths"
          ],
          objectives: [
            "Explain file organization, network topologies, and SDLC stages;",
            "Identify AI branches, robotics components, cyber threats, and computing career opportunities."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Sharma, B., Singh, S. & Singh, V.", year: "2021", title: "Computer Studies for Year 11", publisher: "Ministry of Education, Fiji" },
    { author: "Otuka, J. O. E., Akande, A. F. and Iginla, S. I.", year: "2019", title: "New Computer Studies (Books 1-3)", publisher: "LearnAfrica" },
    { author: "HiiT@School", year: "2021", title: "Computer Studies for Senior Secondary Education", publisher: "HiiT" },
    { author: "Ojo, D. J.", year: "2018", title: "SSCE Data Processing & Computer Studies Past Questions and Answers", publisher: "TONAD Publishers Limited" }
  ],
  lastUpdated: "2026-07-28"
};

export const AGRICULTURE_SYLLABUS: UTMESyllabus = {
  id: "agriculture",
  subject: "Agriculture",
  category: "Science",
  generalObjectives: [
    "Stimulate and sustain interest in agriculture;",
    "Acquire basic knowledge and practical skills in agriculture;",
    "Acquire the knowledge of interpretation and use of data; and",
    "Make deductions using acquired agricultural knowledge."
  ],
  sections: [
    {
      id: "agric_sec_a",
      title: "SECTION A: General Agriculture & Agronomy",
      topics: [
        {
          id: "agric_1",
          topicNumber: 1,
          title: "General Agriculture, Genetics & Land Management",
          contents: [
            "Meaning, scope, and branches of agriculture; importance to industry & economy",
            "Ecological zones of West Africa & agricultural products",
            "Agricultural genetics: Mendel's laws, monohybrid/dihybrid ratios, crop and livestock improvement (selection, breeding, hybridization, artificial insemination)",
            "Agricultural Development in West Africa: research institutes (NCRI, IAR, IITA, WARDA, NIFOR, CRIN), ADPs, OFN, Green Revolution; Land Use Act and government policies"
          ],
          objectives: [
            "Differentiate branches and types of agriculture;",
            "Apply Mendel's laws to plant/animal breeding;",
            "Assess roles of agricultural research institutes, ADPs, and land policies."
          ]
        },
        {
          id: "agric_2",
          topicNumber: 2,
          title: "Agronomy: Soils, Crops, Pests & Forestry",
          contents: [
            "Soil formation, physical/chemical properties, soil water (capillary, gravitational, hygroscopic), soil fertility & fertilizer calculations",
            "Land preparation, tillage systems (zero/minimum tillage), plant propagation (seeds, cuttings, grafting, budding, layering, nursery)",
            "Crop Husbandry: Cereals, Legumes, Tubers, Vegetables, Fruits, Beverages, Oils, Rubber, Fibres, Sugars",
            "Pastures & Forage crops, Floriculture, Weeds & weed control (herbicides, trap cropping)",
            "Crop Diseases (fungal, bacterial, viral) & Crop Pests (biting, boring, sucking insects); Silviculture & agroforestry"
          ],
          objectives: [
            "Identify soil types, fertilizer ratios, and tillage choices;",
            "Describe propagation, harvesting, storage, and pest/disease control for major West African crops."
          ]
        }
      ]
    },
    {
      id: "agric_sec_b",
      title: "SECTION B: Animal Production, Economics & Technology",
      topics: [
        {
          id: "agric_3",
          topicNumber: 3,
          title: "Animal Production, Fisheries & Wildlife",
          contents: [
            "Livestock classification (cattle, sheep, goat, pigs, rabbits, poultry), husbandry terms",
            "Anatomy & physiology: ruminant vs non-ruminant digestion, reproduction, oestrus cycle, gestation, egg formation in poultry",
            "Animal nutrition: nutrients, balanced ration, hay, silage, malnutrition",
            "Livestock health & diseases (viral, bacterial, fungal, protozoan) & parasites (ticks, tapeworm, liver fluke)",
            "Fisheries (tilapia, catfish; extensive/intensive systems, pond management) and Wildlife management"
          ],
          objectives: [
            "Compare ruminant and non-ruminant digestion and feed formulation;",
            "Describe livestock disease prevention, fish farming, and wildlife protection."
          ]
        },
        {
          id: "agric_4",
          topicNumber: 4,
          title: "Agric Economics, Extension & Technology",
          contents: [
            "Factors of production (land tenure, labour, capital, management)",
            "Economic principles: supply/demand, production functions, diminishing returns, farm records, profit/loss, depreciation, salvage value",
            "Agricultural insurance, financing, marketing channels, extension methods (demonstration plots, mass media)",
            "Agric Technology: farm surveying, tools, machinery (tractors, implements), mechanization, processing (gari, rice, groundnut), biotechnology (tissue culture), ICT in agriculture"
          ],
          objectives: [
            "Calculate gross/net margins, depreciation, and plant densities;",
            "Identify farm tools, machinery maintenance, biotechnology terms, and ICT applications in farming."
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: "Are, L. A. et al.", year: "2010", title: "Comprehensive Certificate Agricultural Science for Senior Secondary Schools", publisher: "University Press Plc" },
    { author: "Komolafe, M. F., Adegbola, A. A. et al.", year: "2004", title: "Agricultural Science for Senior Secondary Schools (1 - 3)", publisher: "University Press Ltd." },
    { author: "Adeniyi, M. O. et al.", year: "1999", title: "Countdown to SSCE Agricultural Science", publisher: "Evans, Ibadan" },
    { author: "Akinsanmi, O.", year: "2000", title: "Senior Secondary Agricultural Science", publisher: "Longman, UK" }
  ],
  lastUpdated: "2026-07-28"
};
