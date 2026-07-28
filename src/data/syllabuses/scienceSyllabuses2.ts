import { UTMESyllabus } from './types';

export const PHYSICS_SYLLABUS: UTMESyllabus = {
  id: 'physics',
  subject: 'Physics',
  category: 'Science',
  generalObjectives: [
    'Sustain interest in physics.',
    'Develop attitudes relevant to physics that encourage accuracy, precision and objectivity.',
    'Interpret physical phenomena, laws, definitions, concepts and other theories.',
    'Demonstrate the ability to solve correctly physics problems using relevant theories and concepts.'
  ],
  topics: [
    {
      id: 'phy-1',
      topicNumber: 1,
      title: 'Measurements and Units',
      contents: [
        'Fundamental Units: Length, mass, time, electric charge, temperature, luminous intensity, amount of substance',
        'Derived Units: Weight, area, volume, force, speed, etc.',
        'Measuring Instruments: Vernier caliper, metre rule, micrometer screw gauge, measuring cylinder, stop watch, beam balance',
        'Dimensions: Definition, simple examples, homogeneity of equations',
        'Limitations of experimental measurements: Accuracy, error estimation, significant figures, standard form'
      ],
      objectives: [
        'Identify units of length, area, volume, mass, time and electric charge',
        'Use different measuring instruments with high degree of accuracy',
        'Relate fundamental physical quantities to their units',
        'Determine dimensions and test the homogeneity of physical equations',
        'Estimate simple experimental errors and express measurements in standard form'
      ]
    },
    {
      id: 'phy-2a',
      topicNumber: '2a',
      title: 'Scalars and Vectors',
      contents: [
        'Definition and examples of scalar and vector quantities',
        'Relative velocity',
        'Resolution of vectors into two perpendicular directions including graphical methods'
      ],
      objectives: [
        'Distinguish between scalar and vector quantities with practical examples',
        'Determine the resultant of two or more vectors using graphical and algebraic methods',
        'Resolve vectors into two perpendicular components and compute relative velocity'
      ]
    },
    {
      id: 'phy-2b',
      topicNumber: '2b',
      title: 'Measurement, Position, Distance and Displacement',
      contents: [
        'Concept of displacement vs distance',
        'Concept of position and coordinates in x-y plane',
        'Frame of reference and vector location'
      ],
      objectives: [
        'Distinguish between distance and displacement in a specified direction',
        'Use Cartesian systems to locate positions in 2D space and draw graph inferences'
      ]
    },
    {
      id: 'phy-3',
      topicNumber: 3,
      title: 'Motion',
      contents: [
        'Newton’s laws of motion: inertia, mass, force, linear momentum, conservation of momentum',
        'Types of motion: translational, oscillatory, rotational, spin, random',
        'Linear motion: speed, velocity, acceleration, equations of uniform acceleration, motion under gravity',
        'Projectiles: range, maximum height, time of flight, trajectory equations',
        'Motion in a circle: angular velocity, angular acceleration, centripetal/centrifugal force',
        'Simple Harmonic Motion (S.H.M.): definition, period, frequency, amplitude, energy changes, resonance'
      ],
      objectives: [
        'Identify types of motion and solve problems on linear and collinear motion',
        'Interpret velocity-time and distance-time graphs',
        'Apply equations of motion under gravity and projectile motion formulas',
        'Calculate range, height, time of flight for projectiles',
        'Solve numerical problems on motion in a circle and conservation of linear momentum',
        'Analyse energy changes in S.H.M. and explain forced vibration and resonance'
      ]
    },
    {
      id: 'phy-4',
      topicNumber: 4,
      title: 'Gravitational Field',
      contents: [
        'Newton’s law of universal gravitation',
        'Gravitational potential and acceleration due to gravity (g)',
        'Variation of g on earth’s surface',
        'Mass vs weight, escape velocity, parking orbit and weightlessness'
      ],
      objectives: [
        'Apply Newton’s law of universal gravitation to calculate gravitational forces',
        'Differentiate between mass and weight, and explain variations in g',
        'Deduce expressions for gravitational potential and determine escape velocity'
      ]
    },
    {
      id: 'phy-5',
      topicNumber: 5,
      title: 'Equilibrium of Forces',
      contents: [
        'Equilibrium of coplanar forces, triangles and polygon of forces, Lami’s theorem',
        'Principles of moments, moment of force, moment of a couple (torque)',
        'Conditions for equilibrium of rigid bodies under parallel and non-parallel forces',
        'Centre of gravity and stability (stable, unstable, neutral equilibrium)'
      ],
      objectives: [
        'Apply triangle/polygon of forces and Lami’s theorem to solve equilibrium problems',
        'Calculate moments and torque for couples',
        'Determine resultant and equilibrant forces and distinguish between stable, unstable, and neutral equilibrium'
      ]
    },
    {
      id: 'phy-6',
      topicNumber: 6,
      title: 'Friction',
      contents: [
        'Static and dynamic friction, coefficient of limiting friction',
        'Advantages, disadvantages and reduction of friction',
        'Viscosity, terminal velocity and Stoke’s law'
      ],
      objectives: [
        'Determine coefficient of limiting friction and evaluate methods to reduce friction',
        'Apply Stoke’s law and analyze factors affecting viscosity and terminal velocity'
      ]
    },
    {
      id: 'phy-7',
      topicNumber: 7,
      title: 'Work, Energy and Power',
      contents: [
        'Definition of work, energy and power; forms and conservation of energy',
        'Force-distance curves',
        'Energy and society: renewable/non-renewable, diversification, global warming, solar energy, photovoltaic cells, work function, Planck’s constant'
      ],
      objectives: [
        'Differentiate between work, energy and power and solve numerical problems',
        'Apply energy conservation principle and interpret force-distance graphs',
        'Evaluate environmental impacts of energy usage and explain solar panel/photovoltaic operation'
      ]
    },
    {
      id: 'phy-8',
      topicNumber: 8,
      title: 'Simple Machines',
      contents: [
        'Definition and types of simple machines (levers, pulleys, inclined plane, wheel and axle, screw, gears)',
        'Mechanical advantage (M.A.), Velocity ratio (V.R.) and Efficiency'
      ],
      objectives: [
        'Identify simple machine types and calculate M.A., V.R. and efficiency'
      ]
    },
    {
      id: 'phy-9',
      topicNumber: 9,
      title: 'Elasticity',
      contents: [
        'Hooke’s law, Young’s modulus, elastic limit, yield point, breaking point',
        'Spring balance as a force meter',
        'Work done per unit volume in stretched springs and elastic strings'
      ],
      objectives: [
        'Interpret force-extension curves and calculate Young’s modulus',
        'Determine work done in elastic deformation of springs and wires'
      ]
    },
    {
      id: 'phy-10',
      topicNumber: 10,
      title: 'Pressure',
      contents: [
        'Atmospheric pressure, S.I. unit (Pa), barometers (mercury, aneroid, altimeter), manometer',
        'Pressure in liquids: P = ρgh',
        'Pascal’s principle and applications (hydraulic press, hydraulic brakes)'
      ],
      objectives: [
        'Relate variation of pressure to depth and height',
        'Apply Pascal’s principle to hydraulic systems and calculate fluid pressure'
      ]
    },
    {
      id: 'phy-11',
      topicNumber: 11,
      title: 'Liquids at Rest',
      contents: [
        'Determination of density and relative density of solids and liquids',
        'Upthrust, Archimedes’ principle and law of floatation',
        'Applications: hydrometer, submarines, ships'
      ],
      objectives: [
        'Determine upthrust and relative density of various substances',
        'Apply Archimedes’ principle and law of floatation to solve numerical problems'
      ]
    },
    {
      id: 'phy-12',
      topicNumber: 12,
      title: 'Temperature and Its Measurement',
      contents: [
        'Concept of temperature and thermometric properties',
        'Calibration of thermometers and temperature scales (Celsius, Kelvin, Fahrenheit)',
        'Types of thermometers (liquid-in-glass, resistance, thermocouple, bimetallic)'
      ],
      objectives: [
        'Identify thermometric properties and convert between temperature scales',
        'Calibrate thermometers and compare operational ranges'
      ]
    },
    {
      id: 'phy-13',
      topicNumber: 13,
      title: 'Quantity of Heat',
      contents: [
        'Heat capacity and specific heat capacity of solids and liquids',
        'Methods of mixtures and electrical method',
        'Newton’s law of cooling'
      ],
      objectives: [
        'Determine heat capacity and specific heat capacity using method of mixtures and electrical heating',
        'Solve calorimetry numerical problems'
      ]
    },
    {
      id: 'phy-14',
      topicNumber: 14,
      title: 'Change of State',
      contents: [
        'Latent heat and specific latent heat of fusion and vaporization',
        'Melting, evaporation and boiling',
        'Effect of pressure and impurities on boiling and melting points'
      ],
      objectives: [
        'Distinguish between evaporation and boiling',
        'Calculate heat absorbed or released during state changes using specific latent heat'
      ]
    },
    {
      id: 'phy-15',
      topicNumber: 15,
      title: 'Thermal Expansion',
      contents: [
        'Linear, superficial (area), and cubical (volume) expansivities of solids',
        'Real and apparent expansivity of liquids',
        'Anomalous expansion of water and applications'
      ],
      objectives: [
        'Relate linear, area and volume expansivities (α, β, γ)',
        'Calculate expansion in railway tracks and bimetallic strips',
        'Analyse real vs apparent liquid expansion and anomalous expansion of water'
      ]
    },
    {
      id: 'phy-16',
      topicNumber: 16,
      title: 'Gas Laws',
      contents: [
        'Boyle’s law (isothermal process), Charles’ law (isobaric process), Pressure law (volumetric process)',
        'Absolute zero and general gas equation PV/T = k',
        'Ideal gas equation PV = nRT and Van der Waals real gas equation'
      ],
      objectives: [
        'Interpret gas laws and solve problems using PV/T relations',
        'Explain absolute zero temperature and Van der Waals corrections for real gases'
      ]
    },
    {
      id: 'phy-17',
      topicNumber: 17,
      title: 'Vapours',
      contents: [
        'Unsaturated and saturated vapours, Saturated Vapour Pressure (S.V.P.) and boiling point',
        'Determination of S.V.P. by barometer tube method',
        'Dew point, relative humidity and wet/dry bulb hygrometers'
      ],
      objectives: [
        'Relate S.V.P. to boiling point and determine humidity using hygrometers',
        'Solve numerical problems on relative humidity and dew point'
      ]
    },
    {
      id: 'phy-18',
      topicNumber: 18,
      title: 'Structure of Matter and Kinetic Theory',
      contents: [
        'Atoms and molecules; Brownian motion, diffusion, surface tension, capillarity, adhesion, cohesion, angle of contact',
        'Assumptions of kinetic theory of gases',
        'Kinetic explanation of gas pressure, gas laws, temperature and phase changes'
      ],
      objectives: [
        'Use molecular theory to explain surface tension, capillarity, diffusion and cohesion',
        'Examine assumptions of kinetic theory and explain pressure/temperature on a molecular level'
      ]
    },
    {
      id: 'phy-19',
      topicNumber: 19,
      title: 'Heat Transfer',
      contents: [
        'Conduction, convection and radiation',
        'Temperature gradient, thermal conductivity and heat flux',
        'Thermos/vacuum flask, land and sea breeze, combustion engines vs electric engines'
      ],
      objectives: [
        'Compare modes of heat transfer and solve thermal conductivity problems',
        'Explain the operation of vacuum flasks, engine cooling, and coastal breezes'
      ]
    },
    {
      id: 'phy-20',
      topicNumber: 20,
      title: 'Waves',
      contents: [
        'Production and propagation of wave motion; transverse and longitudinal waves',
        'Mechanical vs electromagnetic waves; progressive vs stationary waves',
        'Wave parameters: speed V = fλ, period, amplitude, wave number, phase difference',
        'Progressive wave equation Y = A sin(2π/λ)(vt ± x)',
        'Properties: reflection, refraction, diffraction, plane polarization, interference, beats, Doppler effect'
      ],
      objectives: [
        'Compute basic wave parameters using wave equations',
        'Distinguish between longitudinal/transverse and mechanical/electromagnetic waves',
        'Explain diffraction, polarization, wave interference, beat frequency, and Doppler shift'
      ]
    },
    {
      id: 'phy-21',
      topicNumber: 21,
      title: 'Propagation of Sound Waves',
      contents: [
        'Need for a material medium; speed of sound in solids, liquids and gases',
        'Reflection of sound: echoes, reverberation and applications',
        'Acoustic reverberation control'
      ],
      objectives: [
        'Compare speed of sound across states of matter',
        'Solve echo and distance determination problems'
      ]
    },
    {
      id: 'phy-22',
      topicNumber: 22,
      title: 'Characteristics of Sound Waves',
      contents: [
        'Pitch, loudness, intensity, quality (timbre), harmonics and overtones',
        'Vibrating strings and fundamental frequency Fo = (1/2L)√(T/μ)',
        'Vibrating air columns in open and closed pipes'
      ],
      objectives: [
        'Relate pitch to frequency, loudness to amplitude, and quality to harmonics',
        'Calculate resonant frequencies in stretched strings, open pipes, and closed pipes'
      ]
    },
    {
      id: 'phy-23',
      topicNumber: 23,
      title: 'Light Energy',
      contents: [
        'Natural and artificial sources; luminous and non-luminous bodies',
        'Speed, frequency and wavelength of light',
        'Rectilinear propagation: shadow formation, eclipses, pin-hole camera'
      ],
      objectives: [
        'Relate speed, frequency and wavelength of light',
        'Explain eclipse formation and solve pin-hole camera magnification problems'
      ]
    },
    {
      id: 'phy-24',
      topicNumber: 24,
      title: 'Reflection of Light at Plane and Curved Surfaces',
      contents: [
        'Laws of reflection; image formation in plane, concave and convex mirrors',
        'Mirror formula 1/f = 1/u + 1/v and magnification m = v/u',
        'Applications: periscope, kaleidoscope, sextant, searchlights'
      ],
      objectives: [
        'Construct ray diagrams for plane and spherical mirrors',
        'Apply mirror formula to calculate image distance, focal length, and magnification'
      ]
    },
    {
      id: 'phy-25',
      topicNumber: 25,
      title: 'Refraction of Light Through Plane and Curved Surfaces',
      contents: [
        'Laws of refraction, Snell’s law, refractive index n',
        'Real and apparent depth, lateral displacement, critical angle and total internal reflection (TIR)',
        'Glass prism, minimum deviation formula n = sin((A+D)/2) / sin(A/2)',
        'Lens formula 1/f = 1/u + 1/v, power of lens P = 1/f (dioptres)'
      ],
      objectives: [
        'Apply Snell’s law and calculate refractive index and critical angle',
        'Explain optical fibers and mirage formation using TIR',
        'Solve prism deviation and thin lens formula problems'
      ]
    },
    {
      id: 'phy-26',
      topicNumber: 26,
      title: 'Optical Instruments',
      contents: [
        'Microscopes (simple and compound), astronomical telescopes, projectors, camera',
        'Human eye: accommodation, near and far points, defects (myopia, hypermetropia, presbyopia, astigmatism) and corrections'
      ],
      objectives: [
        'Compare human eye with a camera',
        'Calculate angular magnification of compound microscopes and telescopes',
        'Determine correcting lens powers for eye vision defects'
      ]
    },
    {
      id: 'phy-27',
      topicNumber: 27,
      title: 'Dispersion of Light, Colours & Electromagnetic Spectrum',
      contents: [
        'Dispersion of white light by prism, pure spectrum, rainbow formation',
        'Primary and secondary colours, mixing by addition and subtraction, colour filters',
        'Electromagnetic spectrum: radio waves, microwaves, infrared, visible, ultraviolet, X-rays, gamma rays'
      ],
      objectives: [
        'Explain colour mixing and spectrum formation',
        'Identify radiation components of electromagnetic spectrum by frequency, wavelength, and detection method'
      ]
    },
    {
      id: 'phy-28',
      topicNumber: 28,
      title: 'Electrostatics',
      contents: [
        'Positive and negative charges, electrostatic induction, gold-leaf electroscope',
        'Coulomb’s inverse square law F = k q1 q2 / r^2',
        'Electric field intensity E, electric potential V, potential difference',
        'Lightning conductors and electric discharge'
      ],
      objectives: [
        'Apply Coulomb’s law to point charges',
        'Calculate electric field strength and potential difference',
        'Explain charge distribution on conductors and lightning arrester action'
      ]
    },
    {
      id: 'phy-29',
      topicNumber: 29,
      title: 'Capacitors',
      contents: [
        'Parallel plate capacitor, capacitance C = εA/d',
        'Series and parallel combinations of capacitors',
        'Energy stored in a capacitor W = 1/2 CV^2'
      ],
      objectives: [
        'Determine factors affecting capacitance of parallel plates',
        'Calculate equivalent capacitance and energy stored in capacitor networks'
      ]
    },
    {
      id: 'phy-30',
      topicNumber: 30,
      title: 'Electric Cells',
      contents: [
        'Simple voltaic cell defects (polarization and local action) and remedies',
        'Daniel cell, Leclanché cell (wet and dry), accumulators (lead-acid, Ni-Fe, Lithium-ion)',
        'Arrangement of cells in series and parallel, efficiency of a cell'
      ],
      objectives: [
        'Identify defects in simple cells and explain maintenance of accumulators',
        'Calculate current and terminal e.m.f for cell groupings'
      ]
    },
    {
      id: 'phy-31',
      topicNumber: 31,
      title: 'Current Electricity',
      contents: [
        'E.m.f., potential difference, current, internal resistance, lost volt',
        'Ohm’s law, resistivity ρ and conductivity σ',
        'Resistors in series and parallel, metre bridge, potentiometer method',
        'Kirchhoff’s laws in circuit networks'
      ],
      objectives: [
        'Apply Ohm’s law and Kirchhoff’s laws to solve circuit networks',
        'Calculate resistivity, conductivity, and unknown resistances using metre bridge and potentiometer'
      ]
    },
    {
      id: 'phy-32',
      topicNumber: 32,
      title: 'Electrical Energy and Power',
      contents: [
        'Electrical energy P = IV = I^2R = V^2/R, commercial unit (kWh)',
        'Electrical power transmission (grid system, high voltage low current)',
        'Heating effects, house wiring, fuses and circuit breakers'
      ],
      objectives: [
        'Calculate electrical energy consumption and cost in kWh',
        'Explain electrical power transmission advantages and determine fuse ratings'
      ]
    },
    {
      id: 'phy-33',
      topicNumber: 33,
      title: 'Magnets and Magnetic Fields',
      contents: [
        'Natural/artificial magnets, soft iron vs steel properties, magnetization/demagnetization',
        'Magnetic fields round straight conductors, circular loops and solenoids',
        'Earth’s magnetic field: angle of dip, declination, horizontal component, flux density',
        'Applications in navigation and mineral exploration'
      ],
      objectives: [
        'Differentiate between soft iron and steel magnetic behavior',
        'Determine magnetic field flux patterns and terrestrial magnetic elements'
      ]
    },
    {
      id: 'phy-34',
      topicNumber: 34,
      title: 'Force on a Current-Carrying Conductor in a Magnetic Field',
      contents: [
        'Force between parallel conductors, force on a moving charge F = qvB sin θ',
        'Fleming’s left-hand rule, D.C. motor, electromagnets',
        'Moving coil and moving iron galvanometers, conversion to ammeter (shunt) and voltmeter (multiplier)'
      ],
      objectives: [
        'Use Fleming’s left-hand rule to find force directions',
        'Calculate force on moving charge and parallel conductors',
        'Convert galvanometers to ammeters and voltmeters using shunt and multiplier calculations'
      ]
    },
    {
      id: 'phy-35',
      topicNumber: 35,
      title: 'Electromagnetic Induction, Inductance and Eddy Current',
      contents: [
        'Faraday’s laws of induction, Lenz’s law and energy conservation',
        'A.C. and D.C. generators, transformers (step-up, step-down, efficiency), induction coil',
        'Self and mutual inductance, energy stored in inductor E = 1/2 LI^2',
        'Eddy currents: reduction, applications (induction furnaces, damping)'
      ],
      objectives: [
        'Apply Faraday’s and Lenz’s laws to electromagnetic systems',
        'Calculate transformer voltage, current and efficiency turns ratio',
        'Explain inductance energy storage and methods to reduce eddy current loss'
      ]
    },
    {
      id: 'phy-36',
      topicNumber: 36,
      title: 'Simple A.C. Circuits',
      contents: [
        'Peak and r.m.s. values (I_rms = I0 / √2)',
        'Resistive, capacitive (Xc = 1/2πfC) and inductive (Xl = 2πfL) reactances',
        'Series R-L-C circuit, impedance Z = √(R^2 + (Xl - Xc)^2), phase angle, power factor',
        'Resonance frequency Fo = 1 / (2π√(LC))'
      ],
      objectives: [
        'Calculate r.m.s and peak values of A.C. voltage/current',
        'Calculate reactances, impedance, phase angle, power factor, and resonance frequency'
      ]
    },
    {
      id: 'phy-37',
      topicNumber: 37,
      title: 'Conduction of Electricity Through Liquids and Gases',
      contents: [
        'Electrolytes, electrolysis, Faraday’s laws of electrolysis, electroplating, ammeter calibration',
        'Discharge through gases at low pressure, cathode rays, applications'
      ],
      objectives: [
        'Apply Faraday’s laws of electrolysis (m = ZIt) to solve quantitative problems',
        'Explain gas discharge phenomena and cathode ray tube applications'
      ]
    },
    {
      id: 'phy-38',
      topicNumber: 38,
      title: 'Elementary Modern Physics',
      contents: [
        'Rutherford and Bohr atomic models, energy levels and atomic spectra',
        'Thermionic emission and photoelectric effect (Einstein’s equation E = hf - Φ)',
        'Production and properties of X-rays',
        'Radioactivity: alpha, beta, gamma decay, half-life, decay constant λ = 0.693 / T1/2, nuclear fission and fusion',
        'Binding energy, mass defect ΔE = Δm c^2, wave-particle duality, de Broglie wavelength, uncertainty principle'
      ],
      objectives: [
        'Apply Einstein’s photoelectric equation and calculate stopping potential',
        'Calculate radioactive half-life, decay constant, mass defect, and binding energy',
        'Analyse wave-particle duality and de Broglie wavelength'
      ]
    },
    {
      id: 'phy-39',
      topicNumber: 39,
      title: 'Introductory Electronics',
      contents: [
        'Conductors, semiconductors (band gap energy), insulators',
        'Intrinsic and extrinsic semiconductors (n-type, p-type, dopants)',
        'P-N junction diode, rectification (half-wave and full-wave bridge)',
        'Transistor structure (npn, pnp) and amplification basics'
      ],
      objectives: [
        'Distinguish between conductors, intrinsic/extrinsic semiconductors, and insulators',
        'Explain diode rectification and transistor current amplification'
      ]
    },
    {
      id: 'phy-40',
      topicNumber: 40,
      title: 'Introduction to Fibre Optics and Lasers',
      contents: [
        'Principle of light transmission in optical fibre (TIR), applications in telecommunications (LAN) and medicine',
        'Meaning and types of lasers (solid state, gas, liquid, semiconductor)',
        'Applications of lasers in medicine, military, industry, holograms, and laser safety hazards'
      ],
      objectives: [
        'Explain optical fibre light transmission and network applications',
        'Describe laser types, practical applications in surgery/industry, and safety precautions'
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Ike, E.E.', year: '2014', title: 'Essential Principles of Physics', publisher: 'ENIC Publishers', location: 'Jos' },
    { author: 'Ike, E.E.', year: '2014', title: 'Numerical Problems and Solutions in Physics', publisher: 'ENIC Publishers', location: 'Jos' },
    { author: 'Nelkon, M.', year: '1977', title: 'Fundamentals of Physics', publisher: 'Hart Davis Education', location: 'Great Britain' },
    { author: 'Nelkon, M. and Parker, P.', year: '1989', title: 'Advanced Level Physics (Sixth Edition)', publisher: 'Heinemann' },
    { author: 'Okeke, P.N. and Anyakoha, M.W.', year: '2000', title: 'Senior Secondary School Physics', publisher: 'Pacific Printers', location: 'Lagos' },
    { author: 'Olumuyiwa, A. and Ogunkoya, O. O.', year: '1992', title: 'Comprehensive Certificate Physics', publisher: 'University Press Plc', location: 'Ibadan' },
    { author: 'Orokpo, J.A.', year: '2025', title: 'Ultimate UTME Preparatory Series Physics', publisher: 'Peridot Publishers', location: 'Nasarawa State' }
  ],
  lastUpdated: '2026-07-28'
};

export const MATHEMATICS_SYLLABUS: UTMESyllabus = {
  id: 'mathematics',
  subject: 'Mathematics',
  category: 'Science',
  generalObjectives: [
    'Acquire computational and manipulative skills.',
    'Develop precise, logical and formal reasoning skills.',
    'Develop deductive skills in interpretation of graphs, diagrams and data.',
    'Apply mathematical concepts to resolve issues in daily living.'
  ],
  sections: [
    {
      id: 'math-sec-1',
      sectionCode: 'SECTION I',
      title: 'NUMBER AND NUMERATION',
      topics: [
        {
          id: 'math-1-1',
          topicNumber: 1,
          title: 'Number Bases and Modular Arithmetic',
          contents: [
            'Operations in different number bases from 2 to 10',
            'Conversion from one base to another including fractional parts',
            'Modular arithmetic: addition, subtraction, and multiplication in modulo systems'
          ],
          objectives: [
            'Perform basic arithmetic operations in base 2 through 10',
            'Convert integers and fractional numbers between bases',
            'Perform modular arithmetic calculations'
          ]
        },
        {
          id: 'math-1-2',
          topicNumber: 2,
          title: 'Fractions, Decimals, Approximations and Percentages',
          contents: [
            'Fractions and decimals, significant figures and decimal places',
            'Percentage errors, simple interest, profit and loss percent',
            'Ratio, proportion, rate, shares, and Value Added Tax (VAT)'
          ],
          objectives: [
            'Perform arithmetic operations on fractions and decimals',
            'Express values to specified significant figures and decimal places',
            'Calculate simple interest, percentage error, ratio, rates, shares, and VAT'
          ]
        },
        {
          id: 'math-1-3',
          topicNumber: 3,
          title: 'Indices, Logarithms and Surds',
          contents: [
            'Laws of indices, index equations, standard form',
            'Laws of logarithms, change of base in logarithms',
            'Relationship between indices and logarithms',
            'Surds: simplification, rationalization, and basic operations'
          ],
          objectives: [
            'Apply laws of indices and logarithms in solving algebraic problems',
            'Solve exponential and logarithmic equations',
            'Simplify and rationalize surds'
          ]
        },
        {
          id: 'math-1-4',
          topicNumber: 4,
          title: 'Sets',
          contents: [
            'Types of sets: empty, universal, complement, subset, finite, infinite, disjoint',
            'Algebra of sets (union, intersection, symmetric difference)',
            'Venn diagrams and applications (up to 3 sets)'
          ],
          objectives: [
            'Identify types of sets and compute set operations',
            'Solve set cardinality problems using Venn diagrams up to 3 overlapping sets'
          ]
        }
      ]
    },
    {
      id: 'math-sec-2',
      sectionCode: 'SECTION II',
      title: 'ALGEBRA',
      topics: [
        {
          id: 'math-2-1',
          topicNumber: 1,
          title: 'Polynomials',
          contents: [
            'Change of subject of formula',
            'Addition, subtraction, multiplication, and division of polynomials',
            'Factorization of polynomials (degree ≤ 3), roots of cubic equations',
            'Factor and Remainder Theorems',
            'Simultaneous linear and quadratic equations',
            'Graphs of polynomials of degree ≤ 3, maximum and minimum values'
          ],
          objectives: [
            'Change subject of formula and apply Factor and Remainder theorems',
            'Factorize polynomials and solve simultaneous linear-quadratic equations',
            'Interpret graphs of cubic polynomials and locate turning points'
          ]
        },
        {
          id: 'math-2-2',
          topicNumber: 2,
          title: 'Variation',
          contents: [
            'Direct, inverse, joint, and partial variation',
            'Percentage increase and decrease in variation'
          ],
          objectives: [
            'Formulate and solve direct, inverse, joint, and partial variation equations',
            'Calculate percentage changes in variation problems'
          ]
        },
        {
          id: 'math-2-3',
          topicNumber: 3,
          title: 'Inequalities',
          contents: [
            'Analytical and graphical solutions of linear inequalities in 1 and 2 variables',
            'Quadratic inequalities with integral roots'
          ],
          objectives: [
            'Solve linear and quadratic inequalities analytically and graphically',
            'Shade linear inequality regions on Cartesian planes'
          ]
        },
        {
          id: 'math-2-4',
          topicNumber: 4,
          title: 'Progression',
          contents: [
            'Nth term of Arithmetic Progression (A.P.) and Geometric Progression (G.P.)',
            'Sum of A.P. and G.P.',
            'Sum to infinity of G.P.'
          ],
          objectives: [
            'Determine nth term and sum of A.P. and G.P.',
            'Calculate sum to infinity for convergent G.P. sequences'
          ]
        },
        {
          id: 'math-2-5',
          topicNumber: 5,
          title: 'Binary Operations',
          contents: [
            'Properties of binary operations: closure, commutativity, associativity, distributivity',
            'Identity and inverse elements'
          ],
          objectives: [
            'Test binary operations for closure, commutativity, associativity, and distributivity',
            'Determine identity elements and inverse elements for given binary operations'
          ]
        },
        {
          id: 'math-2-6',
          topicNumber: 6,
          title: 'Matrices and Determinants',
          contents: [
            'Algebra of matrices (addition, subtraction, multiplication up to 3x3)',
            'Determinants of matrices up to 3x3',
            'Inverses of 2x2 matrices'
          ],
          objectives: [
            'Perform matrix addition, subtraction, and multiplication',
            'Calculate determinants of 2x2 and 3x3 matrices and find inverse of 2x2 matrix'
          ]
        }
      ]
    },
    {
      id: 'math-sec-3',
      sectionCode: 'SECTION III',
      title: 'GEOMETRY AND TRIGONOMETRY',
      topics: [
        {
          id: 'math-3-1',
          topicNumber: 1,
          title: 'Euclidean Geometry',
          contents: [
            'Angles, lines, parallel lines, transversal lines',
            'Polygons: triangles, quadrilaterals, interior and exterior angle sums',
            'Circle theorems: angle subtended at center/circumference, cyclic quadrilaterals, intersecting chords, tangents',
            'Geometric constructions of special angles (30°, 45°, 60°, 75°, 90°)'
          ],
          objectives: [
            'Calculate angles in polygons and apply circle geometry theorems',
            'Demonstrate construction procedures for special geometric angles'
          ]
        },
        {
          id: 'math-3-2',
          topicNumber: 2,
          title: 'Mensuration',
          contents: [
            'Lengths and areas of plane geometric figures',
            'Arc length, chord length, perimeter and area of sectors/segments of circles',
            'Surface area and volume of cuboids, cylinders, cones, pyramids, prisms, spheres, composite solids',
            'Earth as a sphere: longitudes, latitudes, distance along parallels and great circles'
          ],
          objectives: [
            'Calculate areas, perimeters, surface areas and volumes of 2D and 3D figures',
            'Determine distance between locations on the earth’s spherical surface'
          ]
        },
        {
          id: 'math-3-3',
          topicNumber: 3,
          title: 'Loci',
          contents: [
            'Locus in 2 dimensions based on geometric principles relating to lines, bisectors, circles'
          ],
          objectives: [
            'Identify and construct loci of points equidistant from lines, points, and circular boundaries'
          ]
        },
        {
          id: 'math-3-4',
          topicNumber: 4,
          title: 'Coordinate Geometry',
          contents: [
            'Midpoint, gradient, and distance between two points',
            'Parallel and perpendicular line conditions',
            'Equations of straight lines: point-slope form, two-point form, slope-intercept form, general form'
          ],
          objectives: [
            'Calculate distance, midpoint, and gradient of line segments',
            'Derive straight line equations and test parallelism/perpendicularity'
          ]
        },
        {
          id: 'math-3-5',
          topicNumber: 5,
          title: 'Trigonometry',
          contents: [
            'Trigonometric ratios (sin, cos, tan) for angles -360° ≤ θ ≤ 360°',
            'Special angles (30°, 45°, 60°, 120°, 135°, etc.)',
            'Angles of elevation and depression, bearings',
            'Area of triangle, Sine Rule and Cosine Rule',
            'Graphs of sine and cosine functions'
          ],
          objectives: [
            'Evaluate trig ratios for angles in all four quadrants',
            'Solve practical 2D/3D problems on bearings, elevation/depression',
            'Apply Sine and Cosine rules to solve non-right-angled triangles'
          ]
        }
      ]
    },
    {
      id: 'math-sec-4',
      sectionCode: 'SECTION IV',
      title: 'CALCULUS',
      topics: [
        {
          id: 'math-4-1',
          topicNumber: 1,
          title: 'Differentiation',
          contents: [
            'Limits of functions',
            'Differentiation of explicit algebraic and simple trigonometric functions (sin x, cos x, tan x) from first principles and standard rules'
          ],
          objectives: [
            'Evaluate limits of algebraic functions',
            'Differentiate polynomial and basic trigonometric functions'
          ]
        },
        {
          id: 'math-4-2',
          topicNumber: 2,
          title: 'Applications of Differentiation',
          contents: [
            'Rate of change, velocity and acceleration',
            'Maxima and minima (turning points), curve sketching'
          ],
          objectives: [
            'Calculate rates of change and kinematics parameters',
            'Determine maximum and minimum values of algebraic functions'
          ]
        },
        {
          id: 'math-4-3',
          topicNumber: 3,
          title: 'Integration',
          contents: [
            'Integration of explicit algebraic and simple trigonometric functions',
            'Indefinite and definite integrals, area under the curve'
          ],
          objectives: [
            'Integrate polynomial and basic trigonometric expressions',
            'Evaluate definite integrals to calculate areas bounded by curves and axes'
          ]
        }
      ]
    },
    {
      id: 'math-sec-5',
      sectionCode: 'SECTION V',
      title: 'STATISTICS',
      topics: [
        {
          id: 'math-5-1',
          topicNumber: 1,
          title: 'Representation of Data',
          contents: [
            'Frequency distribution tables',
            'Histograms, bar charts, pie charts'
          ],
          objectives: [
            'Construct and interpret frequency tables, histograms, bar charts, and pie charts'
          ]
        },
        {
          id: 'math-5-2',
          topicNumber: 2,
          title: 'Measures of Location',
          contents: [
            'Mean, mode and median for ungrouped and grouped data',
            'Cumulative frequency curve (Ogive), quartiles, deciles, percentiles'
          ],
          objectives: [
            'Calculate mean, median, and mode for grouped and ungrouped datasets',
            'Estimate median, quartiles, and percentiles from Ogive curves'
          ]
        },
        {
          id: 'math-5-3',
          topicNumber: 3,
          title: 'Measures of Dispersion',
          contents: [
            'Range, mean deviation, variance and standard deviation for ungrouped and grouped data'
          ],
          objectives: [
            'Compute range, mean deviation, variance, and standard deviation'
          ]
        },
        {
          id: 'math-5-4',
          topicNumber: 4,
          title: 'Permutation and Combination',
          contents: [
            'Linear and circular arrangements',
            'Arrangements involving repeated objects, combinations nCr and nPr'
          ],
          objectives: [
            'Solve counting problems using permutations and combinations'
          ]
        },
        {
          id: 'math-5-5',
          topicNumber: 5,
          title: 'Probability',
          contents: [
            'Experimental and theoretical probability (coins, dice, cards)',
            'Addition law (mutually exclusive events) and Multiplication law (independent events)'
          ],
          objectives: [
            'Calculate simple probabilities for independent and mutually exclusive events'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Adelodun A. A.', year: '2000', title: 'Distinction in Mathematics: Comprehensive Revision Text (3rd Edition)', publisher: 'FNPL', location: 'Ado-Ekiti' },
    { author: 'Anyebe, J. A. B.', year: '1998', title: 'Basic Mathematics for Senior Secondary Schools', publisher: 'Kenny Moore', location: 'Lagos' },
    { author: 'Channon, J. B. and Smith, A. M.', year: '2001', title: 'New General Mathematics for West Africa SSS 1 to 3', publisher: 'Longman', location: 'Lagos' },
    { author: 'David-Osuagwu, M. et al.', year: '2000', title: 'New School Mathematics for Senior Secondary Schools', publisher: 'Africana FIRST Publishers', location: 'Onitsha' },
    { author: 'Egbe, E. et al.', year: '2000', title: 'Further Mathematics', publisher: 'Africana FIRST Publishers', location: 'Onitsha' },
    { author: 'Ibude, S. O. et al.', year: '2003', title: 'Algebra and Calculus for Schools and Colleges', publisher: 'LINCEL Publishers' },
    { author: 'Tuttuh-Adegun, M. R. et al.', year: '1997', title: 'Further Mathematics Project Books 1 to 3', publisher: 'NPS Educational', location: 'Ibadan' },
    { author: 'Wisdomline', year: '2022', title: 'Pass at Once JAMB Mathematics', publisher: 'Wisdomline' }
  ],
  lastUpdated: '2026-07-28'
};

export const PHE_SYLLABUS: UTMESyllabus = {
  id: 'phe',
  subject: 'Physical and Health Education',
  category: 'Science',
  generalObjectives: [
    'Acquire basic knowledge and practical skills in motor activities, fitness, body maintenance and self-awareness.',
    'Acquire basic knowledge required to practice positive health habits and maintenance of health.',
    'Understand relationship between human movement and biological, physical and social sciences.',
    'Appreciate ecological relationship between man and his environment with a view to preventing disease spread.',
    'Stimulate and sustain interest in Physical and Health Education.'
  ],
  sections: [
    {
      id: 'phe-sec-a',
      sectionCode: 'SECTION A',
      title: 'FOUNDATIONS AND PRINCIPLES OF PHYSICAL AND HEALTH EDUCATION',
      topics: [
        {
          id: 'phe-1-1',
          topicNumber: 1,
          title: 'Principles, Meaning, Scope and Philosophy of Physical Education (PE)',
          contents: [
            'Definition, nature, scope and objectives of PE',
            'Philosophy of Founding Fathers of PE (Hetherington, Dudley Sargent, Thomas Wood, John Dewey)',
            'History and Development of PE in ancient Greece (Sparta, Athens), Rome, pre-colonial, colonial, and post-colonial Nigeria',
            'Ancient Greek festivals (Isthmian, Pythian, Nemean, Olympian)'
          ],
          objectives: [
            'State meaning, scope, nature and objectives of PE',
            'Narrate philosophy of founding fathers and trace history of PE in Greece, Rome, and Nigeria'
          ]
        },
        {
          id: 'phe-1-2',
          topicNumber: 2,
          title: 'Philosophy, Objectives and Settings of Health Education',
          contents: [
            'Meaning, philosophy and objectives of Health Education',
            'Settings: home-based, school-based, community-based, health facility-based, workplace-based',
            'Meaning and principles of Health Promotion'
          ],
          objectives: [
            'Define health education and differentiate between health promotion and health education'
          ]
        }
      ]
    },
    {
      id: 'phe-sec-b',
      sectionCode: 'SECTION B',
      title: 'HUMAN ANATOMY AND PHYSIOLOGY IN RELATION TO PHE',
      topics: [
        {
          id: 'phe-2-1',
          topicNumber: 1,
          title: 'Cells, Tissues and Systems of the Human Body',
          contents: [
            'Structure and functions of typical human cell',
            'Types of cell/tissue: epithelial, connective, muscle, nerve',
            'Cell division: mitosis and meiosis, cell differentiation',
            'Organs and systems of the human body'
          ],
          objectives: [
            'Identify cell structures and differentiate between mitosis and meiosis'
          ]
        },
        {
          id: 'phe-2-2',
          topicNumber: 2,
          title: 'Skeletal System',
          contents: [
            'Axial and appendicular skeleton functions',
            'Structure and types of bones and joints, joint movements (flexion, extension, abduction, rotation)'
          ],
          objectives: [
            'Identify bones and joints involved in human movement'
          ]
        },
        {
          id: 'phe-2-3',
          topicNumber: 3,
          title: 'Muscular System',
          contents: [
            'Major skeletal muscles and functions',
            'Isometric and isotonic muscle contractions'
          ],
          objectives: [
            'Locate major muscle groups and differentiate isometric vs isotonic contractions'
          ]
        },
        {
          id: 'phe-2-4',
          topicNumber: 4,
          title: 'Nervous System and Sense Organs',
          contents: [
            'Central nervous system (Brain, Spinal Cord)',
            'Voluntary and involuntary nerves, reflex action',
            'Sense organs: Skin, Nose, Tongue, Ear, Eye'
          ],
          objectives: [
            'Describe central nervous system, reflex action, and sensory perception'
          ]
        },
        {
          id: 'phe-2-5',
          topicNumber: 5,
          title: 'Circulatory, Respiratory and Excretory Systems',
          contents: [
            'Heart structure, blood vessels (arteries, veins, capillaries), blood composition',
            'Systemic and pulmonary circulation',
            'Respiratory organs, inspiration/expiration, cellular respiration',
            'Excretory organs: kidney, skin, lungs; formation of urine and sweat'
          ],
          objectives: [
            'Trace systemic and pulmonary blood circulation, respiratory processes, and excretion'
          ]
        },
        {
          id: 'phe-2-6',
          topicNumber: 6,
          title: 'Somatotypes and Posture',
          contents: [
            'Body types: endomorph, mesomorph, ectomorph',
            'Characteristics of correct posture',
            'Postural defects: flatfoot, scoliosis, kyphosis, lordosis; corrective exercises and nutrition'
          ],
          objectives: [
            'Relate somatotypes to sports performance and prescribe corrective measures for postural defects'
          ]
        }
      ]
    },
    {
      id: 'phe-sec-c',
      sectionCode: 'SECTION C',
      title: 'THEORY OF PRACTICE OF SPORTS AND GAMES',
      topics: [
        {
          id: 'phe-3-1',
          topicNumber: 1,
          title: 'Athletics (Track and Field Events)',
          contents: [
            'Track events: Sprints (50m, 100m, 200m, 400m, hurdles, relays), start styles (bullet/bunch, medium, elongated)',
            'Baton takeover (visual/non-visual), middle/long distance races, rules & officiating',
            'Field events: Throwing (discus, javelin, shotput) & Jumping (high jump, long jump, pole vault, triple jump)'
          ],
          objectives: [
            'Identify sprint start styles, relay takeover zones, jump/throw techniques, rules and safety'
          ]
        },
        {
          id: 'phe-3-2',
          topicNumber: 2,
          title: 'Ball Games and Racket Games',
          contents: [
            'Ball games: Football and Basketball skills, equipment specifications, rules, officials and functions',
            'Racket games: Table tennis and Badminton skills, court specs, rules and officiating'
          ],
          objectives: [
            'Describe skills, court dimensions, rules and official duties in football, basketball, table tennis and badminton'
          ]
        }
      ]
    },
    {
      id: 'phe-sec-d',
      sectionCode: 'SECTION D',
      title: 'FOOD, NUTRITION, DRUGS AND FITNESS',
      topics: [
        {
          id: 'phe-4-1',
          topicNumber: 1,
          title: 'Food, Nutrition and Drugs',
          contents: [
            'Classes of nutrients, balanced diet, dietary needs for athletes, children, pregnant women, aged',
            'Beverages, water importance, common nutritional deficiencies',
            'Drugs: stimulants, narcotics, hallucinogens, sedatives, ergogenic aids; misuse, abuse, side effects'
          ],
          objectives: [
            'Specify balanced diets for special groups and evaluate consequences of drug abuse and ergogenic aids'
          ]
        },
        {
          id: 'phe-4-2',
          topicNumber: 2,
          title: 'Physical Fitness, Recreation and First Aid',
          contents: [
            'Fitness components (health-related vs skill-related), benefits of exercise',
            'Conditioning programmes: aerobic, anaerobic, strength, endurance',
            'Recreation, outdoor/indoor games, traditional dances & costumes',
            'First aid principles, first aid box, treating cuts, sprains, fractures, burns, poisoning',
            'Safety education at home, school, workplace, disaster relief (Red Cross, St. John Ambulance)'
          ],
          objectives: [
            'Design conditioning routines, execute first aid interventions, and outline safety regulations'
          ]
        },
        {
          id: 'phe-4-3',
          topicNumber: 3,
          title: 'Competitions, Special Needs, and Disease Prevention',
          contents: [
            'Sports competitions: National Sports Festival, NUGA, NIPOGA, NATCEGA, All Africa Games, IOC, FIFA, World Athletics',
            'Adapted PE for disabled/special needs, rehabilitation exercises',
            'Personal, community & environmental health: eye/ear screening, pollution, pest control',
            'Communicable (air/water/insect/contact) vs non-communicable diseases (hypertension, diabetes, sickle cell)',
            'Family life, human sexuality, reproductive health rights, family planning'
          ],
          objectives: [
            'Recognize sports governing bodies, explain adapted PE routines, disease prevention, and reproductive health'
          ]
        }
      ]
    }
  ],
  recommendedTexts: [
    { author: 'Afuekwe, A. I.', year: '2007', title: 'An Introductory Textbook of Physical Education for Secondary Schools and Colleges', publisher: 'Sales Point Co.', location: 'Nigeria' },
    { author: 'Afuekwe, A. I.', year: '2009', title: 'Health Topics in the New Curriculum of Physical and Health Education', publisher: 'Seas Print' },
    { author: 'Nnabueze, U. C.', year: '2002', title: 'Foundation of Health and Physical Education for Schools', publisher: 'Okotech Publishers', location: 'Enugu' },
    { author: 'Ofadeji, A. A.', year: '2013', title: 'Comprehensive Textbook on Physical and Health Education' },
    { author: 'Oyerinde, O. O. et al.', year: '2021', title: 'A Textbook of Physical and Health Education for Secondary School (4th Edition)', publisher: 'Fabonish Publisher', location: 'Ibadan' },
    { author: 'Puffa, H. A. et al.', year: '2009', title: 'Foundations of Physical Education and Sports', publisher: 'Akwu', location: 'Winneba, Ghana' }
  ],
  lastUpdated: '2026-07-28'
};
