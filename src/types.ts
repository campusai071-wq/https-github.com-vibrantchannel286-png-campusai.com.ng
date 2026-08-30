
export type UserRole = 'Pre-Admission' | 'In-Campus' | 'Graduate/Alumni' | 'School/Institution';

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
  type: 'calculation' | 'news_read' | 'profile_update' | 'install_click';
  title: string;
  description: string;
  timestamp: any; // Firebase Timestamp or string
  metadata?: any; // Added for structured data
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
  daily_requests?: number;
  daily_last_reset?: string;
  daily_chats?: number;
  daily_chat_last_reset?: string;
  is_premium?: boolean;
  meritUsageCount?: number;
  scholarCredits?: number;
  university?: string;
  targetCourse?: string;
  premium_activated_at?: string;
  referral_code?: string;
  referral_count?: number;
  registration_reward_granted?: boolean;
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


