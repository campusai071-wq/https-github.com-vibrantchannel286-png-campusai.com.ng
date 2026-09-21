
export type UserRole = 'Pre-Admission' | 'In-Campus' | 'Graduate/Alumni' | 'School/Institution' | 'Super Admin' | 'Admin';

export type UniversityCategory = 'All' | 'Federal' | 'State' | 'Private' | 'JAMB' | 'Polytechnic' | 'COE' | 'National' | 'Jobs' | 'Scholarships' | 'NYSC' | 'WAEC' | 'NECO';

export type OLevelGrade = 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';

export interface NewsItem {
  id: string;
  slug?: string;
  title: string;
  category: UniversityCategory;
  date: string;
  author?: string;
  image: string;
  images?: string[];
  excerpt: string;
  fullContent?: string; 
  relatedNews?: { title: string, url: string }[];
  sourceUrl?: string;
  isLive?: boolean;
  hasVideo?: boolean;
  videoUrl?: string;
  videoScript?: string;
  tags?: string[];
  isImportant?: boolean;
  views?: number;
  likes?: number;
  shares?: number;
  likedBy?: string[];
  createdAt?: any;
  updatedAt?: any;
  archivedAt?: any;
}

export interface NewsVideo {
  id: string;
  newsId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  views: number;
  likes: number;
  engagement: number;
  postedTo: ('TikTok' | 'YouTube')[];
  createdAt: any;
}

export interface Comment {
  id: string;
  newsId: string;
  uid: string;
  displayName: string;
  photoURL?: string;
  text: string;
  createdAt: any;
}

export interface BillboardAd {
  id: string;
  title: string;
  description: string;
  category: 'Hostels' | 'Gadgets' | 'Services' | 'Tutorials';
  price?: string;
  imageUrl?: string;
  link: string;
  whatsapp?: string; 
  isVerified: boolean;
  isSponsored?: boolean;
  status: 'pending' | 'active';
  submittedBy?: string;
  paidAmount?: string;
  createdAt?: any;
}

export interface AdPackage {
  id: string;
  name: string;
  price: string;
  amountKobo: number;
  duration: string;
  features: string[];
  color: string;
}

export interface SocialLink {
  platform: 'Facebook' | 'Instagram' | 'Linkedin' | 'Twitter' | 'Youtube' | 'TikTok' | 'Nairaland' | 'WhatsApp';
  url: string;
}

export interface ContactConfig {
  email: string;
  whatsapp: string;
  address: string;
  supportHours: string;
}

export interface AdminState {
  isLoggedIn: boolean;
  email: string | null;
  whatsapp?: string;
}

export interface BroadcastEmail {
  id: string;
  subject: string;
  headline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  urgency: 'normal' | 'high' | 'critical';
  targetRole?: UserRole | 'All';
  sentAt: any;
  recipientCount: number;
}

export interface Settings {
  firebaseConfig: string;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
  googleAdsEnabled: boolean;
  geminiKeys: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
  [key: string]: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string; 
  groundingChunks?: GroundingChunk[];
  photoURL?: string; 
}

export interface AdmissionTimeline {
  university: string;
  stages: {
    stage: string;
    status: string;
    details?: string;
    likelyDate?: string;
    confidence?: string;
  }[];
  lastUpdated: string;
  predictionNote?: string;
}

export interface JobOpening {
  id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
  description: string;
  applyUrl: string;
}

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  deadline: string;
  description: string;
  applyUrl: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'calculation' | 'news_read' | 'profile_update' | 'install_click' | 'cbt_exam' | 'cbt_attempt' | 'cgpa_calculation';
  title: string;
  description: string;
  timestamp: any; // Firebase Timestamp or string
  metadata?: any; // Added for structured data
}

export interface AcademicProfile {
  targetInstitution?: string;
  targetInstitutionSlug?: string;
  targetCourse?: string;
  targetCourseCode?: string;
  targetUTMEScore?: number;
  targetAggregate?: number;
  jambScore?: number;
  utmeSubjects?: string[];
  stateOfOrigin?: string;
  olevelGrades?: Array<{ subject: string; grade: string }>;
}

export interface AdmissionStatusSummary {
  capsStatus?: string;
  lastCapsStatus?: string;
  lastSuccessfulCapsSync?: string;
  capsDataFreshness?: 'FRESH' | 'CACHED' | 'UNAVAILABLE';
  eligibilityState?: 'eligible' | 'not_eligible' | 'incomplete' | 'unverified';
  eligibilitySummary?: string;
  lastEligibilityVerdict?: string;
  targetSchool?: string;
  targetCourse?: string;
  lastVerifiedAt?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role: UserRole;
  age?: string;
  gender?: string;
  last_active?: string;
  lifetime_calculations?: number;
  lifetime_cbt_tests?: number;
  lifetime_cgpa_calculations?: number;
  daily_requests?: number;
  daily_last_reset?: string;
  daily_chats?: number;
  daily_chat_last_reset?: string;
  is_premium?: boolean;
  meritUsageCount?: number;
  scholarCredits?: number;
  
  // PRIORITY 6A: UNIFIED ACADEMIC STUDENT PROFILE (Optional fields)
  university?: string;
  targetCourse?: string;
  targetScore?: number;        // Added specifically for 6A
  targetUTMEScore?: number;    // Legacy, kept for compatibility
  jambScore?: number;
  stateOfOrigin?: string;
  utmeSubjects?: string[];
  oLevelGrades?: Record<string, string>; // Added specifically for 6A
  olevelGrades?: Array<{ subject: string; grade: string }>; // Legacy array format

  academicProfile?: AcademicProfile;
  admissionStatus?: AdmissionStatusSummary;
  premium_activated_at?: string;
  referral_code?: string;
  referral_count?: number;
  registration_reward_granted?: boolean;
  createdAt?: string;
  updated_at?: string;
  journey_progress?: number[];
}

export interface PostUtmeInfo {
  status: 'Released' | 'Estimated' | 'Unknown';
  date: string;
  previousYearDate?: string;
  registrationLink?: string;
  requirements?: string;
}

export interface SchoolUgcPost {
  id: string;
  schoolSlug: string;
  userId: string;
  userName: string;
  photoURL?: string;
  content: string;
  category: 'tip' | 'question' | 'review' | 'experience';
  rating?: number; // 1-5 difficulty rating, campus rating etc.
  likes: number;
  likedBy: string[]; // List of user IDs who liked it
  createdAt: any;
}

export interface MasterCourse {
  id: string;
  courseName: string;
  utmeSubjects: string[];
  olevelRequirements: string[];
  directEntryRequirements: string;
  faculty: string;
  keywords?: string[]; // Indexed for fast search retrieval
  version?: number; // Keep version history
  lastVerified?: any;
  nextReview?: any;
  updatedAt: any;
}

export interface AdmissionInstitution {
  id: string;
  name: string;
  type: 'University' | 'Polytechnic' | 'College of Education' | 'Innovation Enterprise Institution';
  category: 'Federal' | 'State' | 'Private';
  state: string;
  courses: string[];
  keywords?: string[]; // Indexed for fast search retrieval
  version?: number; // Keep version history
  lastVerified?: any;
  nextReview?: any;
  updatedAt: any;
}

export interface AdmissionRequirementOverride {
  id: string;
  institutionId: string;
  courseId: string;
  type: 'utme' | 'olevel' | 'de';
  requirementText: string;
  updatedAt: any;
}

export interface AdmissionArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  institution?: string;
  course?: string;
  summary: string;
  content: string;
  requirements?: string[];
  steps?: string[];
  documents_required?: string[];
  important_dates?: any[];
  fees?: any[];
  official_sources?: string[];
  related_topics?: string[];
  keywords?: string[];
  faq?: any[];
  last_verified?: any;
  next_review?: any;
  version?: string | number;
  notes?: string;
  updatedAt?: any;
}

export type AdPackageType = 'starter_7d' | 'growth_14d' | 'pro_30d' | 'custom';
export type AdPlacementType = 'all' | 'calculator' | 'cbt' | 'banner' | 'native';
export type AdStatusType = 'pending' | 'active' | 'paused' | 'expired' | 'rejected';
export type AdPaymentStatus = 'pending' | 'paid' | 'waived';

export interface SponsoredAd {
  id: string;
  brandName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp?: string;
  packageType: AdPackageType;
  packageName: string;
  amount: number;
  durationDays: number;
  placement: AdPlacementType;
  title: string;
  description: string;
  ctaText: string;
  targetUrl: string;
  imageUrl?: string;
  badgeText?: string;
  status: AdStatusType;
  paymentStatus: AdPaymentStatus;
  paymentMethod?: 'paystack' | 'flutterwave' | 'bank_transfer' | 'admin';
  paymentReference?: string;
  impressions: number;
  clicks: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PartnerCategory = 'cbt_centre' | 'tutorial_academy' | 'school' | 'hostel_housing' | 'predegree_consult' | 'student_union' | 'other';
export type PartnerTier = 'verified_directory' | 'cbt_institutional' | 'strategic';
export type PartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PartnerOrganization {
  id: string;
  institutionName: string;
  category: PartnerCategory;
  tier: PartnerTier;
  state: string;
  city: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  whatsapp?: string;
  websiteUrl?: string;
  cacNumber?: string;
  jambCentreCode?: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  verified: boolean;
  featured: boolean;
  rating?: number;
  studentCapacity?: number;
  servicesOffered?: string[];
  status: PartnerStatus;
  paymentStatus: 'pending' | 'paid' | 'waived';
  amountPaid?: number;
  createdAt: string;
  approvedAt?: string;
}

export interface PlatformPricingConfig {
  adStarterPrice: number;       // e.g. 5000 (7 days)
  adGrowthPrice: number;        // e.g. 9000 (14 days)
  adProPrice: number;           // e.g. 18000 (30 days)
  partnerListingPrice: number;  // e.g. 25000 (Annual)
  partnerCbtPrice: number;      // e.g. 75000 (Annual)
  adminWhatsApp: string;
  adminEmail: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  allowNegotiation: boolean;
  updatedAt?: string;
}


