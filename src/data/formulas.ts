export interface Formula {
  domain: string;
  concept: string;
  formula: string;
  variables: string;
  application: string;
}

export const FORMULA_DATA: Formula[] = [
  // Mathematics
  { domain: 'Mathematics', concept: 'Logarithmic Rules', formula: 'log_b a + log_b c = log_b (ac); log_b a - log_b c = log_b (a/c); n log_b a = log_b (a^n)', variables: 'a, b, c: real numbers', application: 'Logarithm simplification' },
  { domain: 'Mathematics', concept: 'Base Change Theorem', formula: 'log_b a = (log_c a) / (log_c b)', variables: 'a, b, c: real numbers', application: 'Change of log base' },
  { domain: 'Mathematics', concept: 'Quadratic Formula', formula: 'x = (-b ± sqrt(b^2 - 4ac)) / 2a', variables: 'a, b, c: coefficients', application: 'Roots of ax^2 + bx + c = 0' },
  { domain: 'Mathematics', concept: 'Arithmetic Progression', formula: 'T_n = a + (n-1)d; S_n = (n/2)[2a + (n-1)d]', variables: 'a: first term, d: common diff, n: index', application: 'Linear sequences' },
  { domain: 'Mathematics', concept: 'Geometric Progression', formula: 'T_n = ar^(n-1); S_n = a(1-r^n)/(1-r)', variables: 'a: first term, r: common ratio', application: 'Exponential sequences' },
  { domain: 'Mathematics', concept: 'Trigonometry: Sine Rule', formula: 'a/sinA = b/sinB = c/sinC', variables: 'a, b, c: sides, A, B, C: angles', application: 'Non-right triangle sides/angles' },
  { domain: 'Mathematics', concept: 'Trigonometry: Cosine Rule', formula: 'c^2 = a^2 + b^2 - 2ab cosC', variables: 'a, b, c: sides, C: angle', application: 'Non-right triangle sides/angles' },
  { domain: 'Mathematics', concept: 'Coordinate Geometry', formula: 'm = (y2-y1)/(x2-x1); d = sqrt((x2-x1)^2 + (y2-y1)^2)', variables: 'm: gradient, d: distance', application: 'Cartesian plane analysis' },
  { domain: 'Mathematics', concept: 'Calculus Differentiation', formula: 'd/dx(ax^n) = anx^(n-1)', variables: 'a, n: constants', application: 'Slope/Rates of change' },
  { domain: 'Mathematics', concept: 'Calculus Integration', formula: '∫ x^n dx = (x^(n+1))/(n+1) + C', variables: 'n: power, C: constant', application: 'Area under curves' },

  // Physics
  { domain: 'Physics', concept: 'Equations of Motion', formula: 'v = u + at; s = ut + 0.5at^2; v^2 = u^2 + 2as', variables: 'u: initial, v: final, a: acc, t: time, s: disp', application: 'Kinematics' },
  { domain: 'Physics', concept: 'Centripetal Force', formula: 'Fc = mv^2 / r = mω^2r', variables: 'm: mass, v: vel, r: radius, ω: ang vel', application: 'Circular motion' },
  { domain: 'Physics', concept: 'Wave Speed', formula: 'v = fλ = λ/T', variables: 'f: freq, λ: wavelength, T: period', application: 'Wave mechanics' },
  { domain: 'Physics', concept: 'Snell\'s Law', formula: 'n1 sin(θ1) = n2 sin(θ2)', variables: 'n: refr index, θ: angle', application: 'Light refraction' },
  { domain: 'Physics', concept: 'Ohm\'s Law', formula: 'V = IR', variables: 'V: pot, I: cur, R: res', application: 'Circuit electricity' },
  { domain: 'Physics', concept: 'Photoelectric Equation', formula: 'hf = W + Kmax', variables: 'h: Planck, f: freq, W: work fn, Kmax: max KE', application: 'Quantum physics' },
  { domain: 'Physics', concept: 'Frictional Force on Incline', formula: 'Fpull = mg(sinθ + μcosθ)', variables: 'm: mass, g: gravity, θ: angle, μ: friction', application: 'Mechanics' },

  // Chemistry
  { domain: 'Chemistry', concept: 'Mole Definition', formula: 'n = mass / MolarMass = N / Na = Volume / 22.4', variables: 'n: moles, N: particles, Na: Avogadro', application: 'Stoichiometry' },
  { domain: 'Chemistry', concept: 'Ideal Gas Law', formula: 'PV = nRT', variables: 'P: press, V: vol, n: moles, R: const, T: temp', application: 'Gas behavior' },
  { domain: 'Chemistry', concept: 'Molarity', formula: 'M = moles / Vol(dm^3)', variables: 'M: concentration', application: 'Solution chemistry' },
  { domain: 'Chemistry', concept: 'pH Calculation', formula: 'pH = -log[H+]', variables: '[H+]: molar concentration', application: 'Acidity' },
  { domain: 'Chemistry', concept: 'Salt Hydrolysis pH', formula: 'pH = 7 - 0.5 * (pKb + log10(C))', variables: 'pKb: base constant, C: concentration', application: 'Salt hydrolysis' },
  { domain: 'Chemistry', concept: 'Faraday\'s First Law', formula: 'm = (MIt) / (zF)', variables: 'm: mass, I: cur, t: time, z: val, F: Faraday', application: 'Electrolysis' },
  { domain: 'Chemistry', concept: 'Thermodynamics', formula: 'ΔG = ΔH - TΔS', variables: 'ΔG: Gibbs free, ΔH: Enthalpy, T: temp, ΔS: Entropy', application: 'Reaction spontaneity' },

  // Accounting
  { domain: 'Accounting', concept: 'Accounting Equation', formula: 'Assets = Liabilities + Equity', variables: 'A, L, E', application: 'Bookkeeping' },
  { domain: 'Accounting', concept: 'Working Capital', formula: 'Working Capital = CurrAssets - CurrLiab', variables: 'CA, CL', application: 'Liquidity' },
  { domain: 'Accounting', concept: 'Depreciation (Straight-Line)', formula: 'AnnualDep = (Cost - Residual) / UsefulLife', variables: 'Cost, Residual, Life', application: 'Fixed asset accounting' },
  { domain: 'Accounting', concept: 'Gross Margin', formula: 'Margin = (GrossProfit / Revenue) * 100', variables: 'GP, Rev', application: 'Profitability analysis' },
  { domain: 'Accounting', concept: 'Incomplete Records (Debtors)', formula: 'ClosingDebtors = OpeningDebtors + CreditSales - CashReceived - DiscountAllowed - BadDebts', variables: 'Debtors, Sales, Cash, Discount, BadDebts', application: 'Accounting adjustments' },
  { domain: 'Accounting', concept: 'Incomplete Records (Creditors)', formula: 'ClosingCreditors = OpeningCreditors + CreditPurchases - CashPaid - DiscountReceived', variables: 'Creditors, Purchases, Cash, Discount', application: 'Accounting adjustments' },

  // Economics
  { domain: 'Economics', concept: 'Price Elasticity (PED)', formula: 'PED = (%ΔQd) / (%ΔP)', variables: 'Qd: Quant dem, P: Price', application: 'Elasticity' },
  { domain: 'Economics', concept: 'Point Elasticity', formula: 'Ep = (dQ/dP) * (P/Q)', variables: 'Q: Quantity, P: Price', application: 'Elasticity' },
  { domain: 'Economics', concept: 'National Income', formula: 'GDP = C + I + G + (X - M)', variables: 'C: Cons, I: Inv, G: Gov, X: Exp, M: Imp', application: 'Macroeconomics' },
  { domain: 'Economics', concept: 'Multiplier Effect', formula: 'K = 1 / (1 - MPC)', variables: 'MPC: Marg Prop to Cons', application: 'Income change' },
  { domain: 'Economics', concept: 'Margin-Markup Conversion', formula: 'M = K / (1+K); K = M / (1-M)', variables: 'M: Margin, K: Markup', application: 'Profit conversion' },

  // Agriculture & Biology
  { domain: 'Agriculture', concept: 'Plant Population', formula: 'Pop = (AreaField / (SpacingR * SpacingP)) * StandsPerHill', variables: 'AreaField, SpacingR: Row, SpacingP: Plant', application: 'Agronomy' },
  { domain: 'Agriculture', concept: 'Seed Rate', formula: 'SeedRate = (Pop * MassSeed) / GerminationRate', variables: 'Pop, MassSeed, GerminationRate', application: 'Planting' },
  { domain: 'Biology', concept: 'Mark-Recapture Population', formula: 'N = (n1 * n2) / m2', variables: 'n1: initial marked, n2: second sample, m2: marked recaptured', application: 'Ecology' },
  
  // Administration
  { domain: 'Administration', concept: 'Institutional Aggregate Score', formula: 'Aggregate = (UTME_Scaled * 0.7) + (OLevel_Points + Bonus * 0.3)', variables: 'UTME_Scaled: Score/100, OLevel: Points, Bonus: Contextual', application: 'Admission screening' }
];
