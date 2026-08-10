import institutionFormulas from '../data/institutionFormulas.json';

export interface InstitutionFormula {
  institution_name: string;
  slug: string;
  formula_description: string;
  utme_weighting: number;
  post_utme_weighting?: number;
  olevel_weighting?: number;
}

export const getInstitutionFormula = (slug: string): InstitutionFormula | undefined => {
  return institutionFormulas.find((f) => f.slug === slug);
};

export const calculateAggregate = (
  jamb: number,
  postUtme: number,
  oLevelPoints: number,
  formula: InstitutionFormula
): number => {
  const jambPart = (jamb / 400) * formula.utme_weighting;
  const postPart = (postUtme / 100) * (formula.post_utme_weighting || 0);
  const oLevelPart = (oLevelPoints / 100) * (formula.olevel_weighting || 0); // Assuming oLevelPoints are already max 100 or need normalization
  
  return jambPart + postPart + oLevelPart;
};
