import { z } from 'zod';

export const AcademicProfileSchema = z.object({
  targetInstitution: z.string().optional(),
  targetInstitutionSlug: z.string().optional(),
  targetCourse: z.string().optional(),
  targetCourseCode: z.string().optional(),
  targetUTMEScore: z.number().optional(),
  targetAggregate: z.number().optional(),
  jambScore: z.number().optional(),
  utmeSubjects: z.array(z.string()).optional(),
  stateOfOrigin: z.string().optional(),
  olevelGrades: z.array(z.object({
    subject: z.string(),
    grade: z.string()
  })).optional()
}).optional();

export const AdmissionStatusSummarySchema = z.object({
  capsStatus: z.string().optional(),
  lastSuccessfulCapsSync: z.string().optional(),
  capsDataFreshness: z.enum(['FRESH', 'CACHED', 'UNAVAILABLE']).optional(),
  eligibilityState: z.enum(['eligible', 'not_eligible', 'incomplete', 'unverified']).optional(),
  eligibilitySummary: z.string().optional()
}).optional();

export const UserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return 'Scholar';
    return val;
  }, z.string()),
  email: z.preprocess((val) => {
    if (typeof val !== 'string' || val.trim() === '') return undefined;
    return val;
  }, z.string().email().optional()),
  photoURL: z.string().optional(),
  role: z.preprocess((val) => {
    if (typeof val !== 'string') return 'Pre-Admission';
    const clean = val.trim().toLowerCase();
    if (clean.includes('super admin')) {
      return 'Super Admin';
    }
    if (clean.includes('admin')) {
      return 'Admin';
    }
    if (clean.includes('pre-admission') || clean.includes('preadmission') || clean.includes('student')) {
      return 'Pre-Admission';
    }
    if (clean.includes('in-campus') || clean.includes('incampus') || clean.includes('campus') || clean.includes('university') || clean.includes('undergraduate')) {
      return 'In-Campus';
    }
    if (clean.includes('graduate') || clean.includes('alumni')) {
      return 'Graduate/Alumni';
    }
    if (clean.includes('school') || clean.includes('institution') || clean.includes('educator')) {
      return 'School/Institution';
    }
    return 'Pre-Admission';
  }, z.enum(['Pre-Admission', 'In-Campus', 'Graduate/Alumni', 'School/Institution', 'Super Admin', 'Admin'])),
  age: z.string().optional(),
  gender: z.string().optional(),
  last_active: z.string().optional(),
  lifetime_calculations: z.number().optional(),
  daily_requests: z.number().optional(),
  daily_last_reset: z.string().optional(),
  daily_chats: z.number().optional(),
  daily_chat_last_reset: z.string().optional(),
  is_premium: z.boolean().optional(),
  meritUsageCount: z.number().optional(),
  scholarCredits: z.number().optional(),
  university: z.string().optional(),
  targetCourse: z.string().optional(),
  targetUTMEScore: z.number().optional(),
  jambScore: z.number().optional(),
  stateOfOrigin: z.string().optional(),
  utmeSubjects: z.array(z.string()).optional(),
  olevelGrades: z.array(z.object({
    subject: z.string(),
    grade: z.string()
  })).optional(),
  academicProfile: AcademicProfileSchema,
  admissionStatus: AdmissionStatusSummarySchema,
  premium_activated_at: z.string().optional(),
  referral_code: z.string().optional(),
  referral_count: z.number().optional(),
  registration_reward_granted: z.boolean().optional(),
});

export const validateUserProfile = (data: any) => {
    return UserProfileSchema.safeParse(data);
};
