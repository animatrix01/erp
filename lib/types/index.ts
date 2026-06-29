// User Role Types
export type UserRole = 'super-admin' | 'hr-admin' | 'employee' | 'medical-staff';

// Profile Types
export interface Profile {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  personalEmail?: string;
  officeExtension?: string;
  fax?: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  maritalStatus?: string;
  nationality?: string;
  religion?: string;
  category?: string;
  bloodGroup: string;
  languagesKnown?: string;
  permanentSameAsCurrent?: boolean;
  // Job / institutional fields
  role?: string;
  designation?: string;
  department?: string;
  dateOfJoining?: string;   // YYYY-MM-DD
}

// Qualification Types
export type QualificationLevel = '10th' | '12th' | 'UG' | 'PG' | 'PhD';

export interface Qualification {
  id?: string;
  level: QualificationLevel;       // strict 5-tier value
  degreeName: string;
  educationLevel?: string;         // kept for backwards compat
  specialization?: string;
  boardUniversity?: string;
  institution: string;
  passingYear: number;
  scoreType?: 'percentage' | 'cgpa' | 'grade' | 'awarded' | 'other';
  scoreValue?: string;
  percentage: number;
  studyMode?: string;
  isPHD: boolean;
  thesisTitle?: string;
  researchGuide?: string;
  researchArea?: string;
  vivaDate?: string;
  documentUrl?: string;            // stored path from backend
  documentFile?: File;             // new upload (frontend only)
}

// Employment Record Types
export interface EmploymentRecord {
  id?: string;
  organizationName: string;
  designation: string;
  department?: string;
  employmentType?: string;
  fromDate: Date;
  toDate: Date | null;
  isCurrent?: boolean;
  totalExperienceYears: number;
}

// Publication Types
export interface Publication {
  id?: string;
  publicationType?: 'journal' | 'conference' | 'book' | 'book_chapter' | 'other';
  journalTitle: string;
  authors?: string;
  publisherVenue?: string;
  conferenceDetails?: string;
  doi?: string;
  impactFactor?: number;
  publicationYear?: number;
  volumeIssuePages?: string;
  citationCount?: number;
}

// Research Profile Types
export interface ResearchProfile {
  orcid?: string;
  scopusId?: string;
  googleScholarUrl?: string;
  researchgateUrl?: string;
  linkedinUrl?: string;
  personalWebsite?: string;
}

// Certification Types
export interface Certification {
  id?: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: Date;
  expiryDate?: Date;
  doesNotExpire?: boolean;     // Checkbox: certificate has no expiry
  certificateNumber?: string;
  credentialUrl?: string;      // Public verification URL
  documentFilePath?: string;   // For existing file from backend
  documentFile?: File;         // For new file upload
}

// Identity Document Types
export interface IdentityDocument {
  aadharNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  passportExpiryDate?: Date | string;
  drivingLicenseNumber?: string;
  voterId?: string;
  // File paths from backend
  aadharFilePath?: string;
  panFilePath?: string;
  passportFilePath?: string;
  voterIdFilePath?: string;
  drivingLicenseFilePath?: string;
  // Verification status
  aadharStatus?: 'missing' | 'pending' | 'verified';
  panStatus?: 'missing' | 'pending' | 'verified';
  passportStatus?: 'missing' | 'pending' | 'verified';
  voterIdStatus?: 'missing' | 'pending' | 'verified';
  drivingLicenseStatus?: 'missing' | 'pending' | 'verified';
}

// Medical Data Types
export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  priority?: number;
  bloodGroup?: string;
  contactType?: 'general' | 'medical';
}

export interface Dependent {
  id?: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
  gender?: 'male' | 'female' | 'other' | '';
  isDependent?: boolean;
  aadharNumber?: string;
  occupation?: string;
  contactNumber?: string;
}

export interface MedicalData {
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  bloodGroup: string;
  dependents: Dependent[];
  lastMedicalCheckup?: string;
  disability?: string;
  physicallyHandicapped?: boolean;
  knownAllergies?: string;
  medicalNotes?: string;
}

// Dashboard Statistics Types
export interface DashboardStatistics {
  totalFaculty: number;
  phdHolders: number;
  facultyDistribution: Record<string, number>;
}

// Astrology Profile Types
export interface AstrologyProfile {
  id?: string;
  employeeId?: string;
  birthTime?: string;
  birthPlace?: string;
  zodiacSign?: string;
  moonSign?: string;
  ascendant?: string;
  nakshatra?: string;
  gotra?: string;
  pada?: string;
  chineseZodiac?: string;
  chineseElement?: string;
  vedicElement?: string;
}

// Numerology Profile Types
export interface NumerologyProfile {
  id?: string;
  employeeId?: string;
  lifePathNumber?: number;
  destinyNumber?: number;
  soulUrgeNumber?: number;
  personalityNumber?: number;
  birthdayNumber?: number;
  kuaNumber?: number;
  luckyNumbers?: string;
  luckyColours?: string;
  luckyGemstone?: string;
  favourableDays?: string;
  notes?: string;
}
