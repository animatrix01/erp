'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, CreditCard, GraduationCap, Briefcase, BookOpen, Award, Heart, Sparkles, Mail, Phone, Calendar, FileText, ExternalLink, Edit } from 'lucide-react';

const BACKEND = 'http://localhost/hrms-backend';

export default function EmployeeProfileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const [activeTab, setActiveTab] = useState('basic');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) return;
    const fetchData = async () => {
      try {
        const [basicRes, identityRes, qualificationsRes, employmentRes, researchRes, certificationsRes, dependentsRes, astrologyRes, numerologyRes] = await Promise.all([
          fetch(`${BACKEND}/employees.php?id=${employeeId}`),
          fetch(`${BACKEND}/identity_documents.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/qualifications.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/employment_history.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/research_profiles.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/certifications.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/dependents.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/astrology_profiles.php?employeeId=${employeeId}`),
          fetch(`${BACKEND}/numerology_profiles.php?employeeId=${employeeId}`)
        ]);
        const [basic, identity, qualifications, employment, research, certifications, dependents, astrology, numerology] = await Promise.all([
          basicRes.json(), identityRes.json(), qualificationsRes.json(), employmentRes.json(),
          researchRes.json(), certificationsRes.json(), dependentsRes.json(), astrologyRes.json(), numerologyRes.json()
        ]);
        setData({ basic, identity, qualifications: Array.isArray(qualifications) ? qualifications : [], employment: Array.isArray(employment) ? employment : [],
          research, certifications: Array.isArray(certifications) ? certifications : [], dependents: Array.isArray(dependents) ? dependents : [], astrology, numerology });
      } catch (error) {
        console.error('Error fetching employee data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!data || !data.basic) {
    return <div className="flex flex-col items-center justify-center min-h-screen"><p className="text-slate-500">Employee not found</p><button onClick={() => router.back()} className="mt-4 text-blue-600 hover:text-blue-700">Go Back</button></div>;
  }

  const fullName = `${data.basic.firstName || ''} ${data.basic.lastName || ''}`.trim();
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User, count: null },
    { id: 'identity', label: 'Identity Docs', icon: CreditCard, count: null },
    { id: 'qualifications', label: 'Qualifications', icon: GraduationCap, count: data.qualifications.length },
    { id: 'employment', label: 'Employment', icon: Briefcase, count: data.employment.length },
    { id: 'research', label: 'Research', icon: BookOpen, count: null },
    { id: 'certifications', label: 'Certifications', icon: Award, count: data.certifications.length },
    { id: 'family', label: 'Medical & Family', icon: Heart, count: data.dependents.length },
    { id: 'astrology', label: 'Astrology', icon: Sparkles, count: null }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back</span>
            </button>
            <div className="h-6 w-px bg-slate-300" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
              <p className="text-sm text-slate-500">{data.basic.employeeId} • {data.basic.designation || 'No designation'}</p>
            </div>
            <button onClick={() => router.push(`/profile-master?id=${employeeId}`)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Edit className="w-4 h-4" />Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 overflow-x-auto">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}>
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && tab.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-bold">{tab.count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && <BasicInfoTab data={data.basic} />}
            {activeTab === 'identity' && <IdentityDocsTab data={data.identity} />}
            {activeTab === 'qualifications' && <QualificationsTab data={data.qualifications} />}
            {activeTab === 'employment' && <EmploymentTab data={data.employment} />}
            {activeTab === 'research' && <ResearchTab data={data.research} />}
            {activeTab === 'certifications' && <CertificationsTab data={data.certifications} />}
            {activeTab === 'family' && <FamilyTab data={data.dependents} />}
            {activeTab === 'astrology' && <AstrologyTab astrology={data.astrology} numerology={data.numerology} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tab Components
function BasicInfoTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoField icon={Mail} label="Email" value={data.email} />
        <InfoField icon={Phone} label="Mobile" value={data.mobile} />
        <InfoField icon={Calendar} label="Date of Birth" value={data.dateOfBirth} />
        <InfoField label="Gender" value={data.gender} />
        <InfoField label="Blood Group" value={data.bloodGroup} />
        <InfoField label="Marital Status" value={data.maritalStatus} />
        <InfoField label="Nationality" value={data.nationality} />
        <InfoField label="Religion" value={data.religion} />
        <InfoField label="Category" value={data.category} />
      </div>
    </div>
  );
}

function IdentityDocsTab({ data }: { data: any }) {
  if (!data) return <p className="text-slate-500 text-center py-8">No identity documents found</p>;
  return (
    <div className="space-y-4">
      <DocRow label="Aadhar" number={data.aadharNumber} status={data.aadharStatus} filePath={data.aadharFilePath} />
      <DocRow label="PAN" number={data.panNumber} status={data.panStatus} filePath={data.panFilePath} />
      <DocRow label="Passport" number={data.passportNumber} status={data.passportStatus} filePath={data.passportFilePath} expiry={data.passportExpiryDate} />
      <DocRow label="Driving License" number={data.drivingLicenseNumber} status={data.drivingLicenseStatus} filePath={data.drivingLicenseFilePath} />
      <DocRow label="Voter ID" number={data.voterId} status={data.voterIdStatus} filePath={data.voterIdFilePath} />
    </div>
  );
}

function QualificationsTab({ data }: { data: any[] }) {
  if (data.length === 0) return <p className="text-slate-500 text-center py-8">No qualifications found</p>;
  return (
    <div className="space-y-4">
      {data.map((qual, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{qual.degreeName}</h3>
              {qual.specialization && <p className="text-sm text-slate-600">{qual.specialization}</p>}
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{qual.passingYear}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-slate-600">Institution: <span className="font-medium text-slate-900">{qual.institution}</span></p>
            {qual.boardUniversity && <p className="text-slate-600">Board/University: <span className="font-medium text-slate-900">{qual.boardUniversity}</span></p>}
            {qual.percentage && <p className="text-slate-600">Score: <span className="font-medium text-slate-900">{qual.percentage}%</span></p>}
            {qual.studyMode && <p className="text-slate-600">Mode: <span className="font-medium text-slate-900">{qual.studyMode}</span></p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmploymentTab({ data }: { data: any[] }) {
  if (data.length === 0) return <p className="text-slate-500 text-center py-8">No employment history found</p>;
  return (
    <div className="space-y-4">
      {data.map((emp, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{emp.designation}</h3>
              <p className="text-sm text-slate-600">{emp.organizationName}</p>
            </div>
            {emp.isCurrent && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Current</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-slate-600">From: <span className="font-medium text-slate-900">{emp.fromDate}</span></p>
            <p className="text-slate-600">To: <span className="font-medium text-slate-900">{emp.toDate || 'Present'}</span></p>
            {emp.department && <p className="text-slate-600">Department: <span className="font-medium text-slate-900">{emp.department}</span></p>}
            {emp.totalExperienceYears && <p className="text-slate-600">Experience: <span className="font-medium text-slate-900">{emp.totalExperienceYears} years</span></p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResearchTab({ data }: { data: any }) {
  if (!data) return <p className="text-slate-500 text-center py-8">No research profile found</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoField label="ORCID" value={data.orcid} />
      <InfoField label="Scopus ID" value={data.scopusId} />
      <InfoField label="Google Scholar" value={data.googleScholarUrl} isLink />
      <InfoField label="ResearchGate" value={data.researchgateUrl} isLink />
      <InfoField label="LinkedIn" value={data.linkedinUrl} isLink />
      <InfoField label="Personal Website" value={data.personalWebsite} isLink />
    </div>
  );
}

function CertificationsTab({ data }: { data: any[] }) {
  if (data.length === 0) return <p className="text-slate-500 text-center py-8">No certifications found</p>;
  return (
    <div className="space-y-4">
      {data.map((cert, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{cert.certificationName}</h3>
              <p className="text-sm text-slate-600">{cert.issuingOrganization}</p>
            </div>
            {cert.doesNotExpire && <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">No Expiry</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-slate-600">Issue Date: <span className="font-medium text-slate-900">{cert.issueDate}</span></p>
            {cert.expiryDate && <p className="text-slate-600">Expiry: <span className="font-medium text-slate-900">{cert.expiryDate}</span></p>}
            {cert.certificateNumber && <p className="text-slate-600">Certificate #: <span className="font-medium text-slate-900">{cert.certificateNumber}</span></p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function FamilyTab({ data }: { data: any[] }) {
  if (data.length === 0) return <p className="text-slate-500 text-center py-8">No family members found</p>;
  return (
    <div className="space-y-4">
      {data.map((dep, idx) => (
        <div key={idx} className="border border-slate-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900">{dep.name}</h3>
              <p className="text-sm text-slate-600">{dep.relationship}</p>
            </div>
            {dep.isDependent && <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">Dependent</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p className="text-slate-600">DOB: <span className="font-medium text-slate-900">{dep.dateOfBirth}</span></p>
            {dep.gender && <p className="text-slate-600">Gender: <span className="font-medium text-slate-900">{dep.gender}</span></p>}
            {dep.occupation && <p className="text-slate-600">Occupation: <span className="font-medium text-slate-900">{dep.occupation}</span></p>}
            {dep.contactNumber && <p className="text-slate-600">Contact: <span className="font-medium text-slate-900">{dep.contactNumber}</span></p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AstrologyTab({ astrology, numerology }: { astrology: any; numerology: any }) {
  if (!astrology && !numerology) return <p className="text-slate-500 text-center py-8">No astrology/numerology data found</p>;
  return (
    <div className="space-y-6">
      {astrology && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Astrology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Birth Time" value={astrology.birthTime} />
            <InfoField label="Birth Place" value={astrology.birthPlace} />
            <InfoField label="Zodiac Sign" value={astrology.zodiacSign} />
            <InfoField label="Moon Sign" value={astrology.moonSign} />
            <InfoField label="Ascendant" value={astrology.ascendant} />
            <InfoField label="Nakshatra" value={astrology.nakshatra} />
            <InfoField label="Gotra" value={astrology.gotra} />
            <InfoField label="Chinese Zodiac" value={astrology.chineseZodiac} />
          </div>
        </div>
      )}
      {numerology && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Numerology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoField label="Life Path Number" value={numerology.lifePathNumber} />
            <InfoField label="Destiny Number" value={numerology.destinyNumber} />
            <InfoField label="Lucky Numbers" value={numerology.luckyNumbers} />
            <InfoField label="Lucky Colours" value={numerology.luckyColours} />
            <InfoField label="Lucky Gemstone" value={numerology.luckyGemstone} />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function InfoField({ icon: Icon, label, value, isLink }: { icon?: any; label: string; value?: any; isLink?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <div className="flex items-start gap-2">
        {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          {isLink ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline break-all">{value}</a>
          ) : (
            <p className="text-sm font-medium text-slate-900 break-words">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DocRow({ label, number, status, filePath, expiry }: { label: string; number?: string; status?: string; filePath?: string; expiry?: string }) {
  if (!number && !filePath) return null;
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <div>
            <h4 className="font-semibold text-slate-900">{label}</h4>
            {number && <p className="text-sm text-slate-600">{number}</p>}
            {expiry && <p className="text-xs text-slate-500">Expires: {expiry}</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {status && (
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            status === 'verified' ? 'bg-green-100 text-green-700' :
            status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-slate-100 text-slate-600'
          }`}>{status}</span>
        )}
        {filePath && (
          <a href={`${BACKEND}/${filePath}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            View
          </a>
        )}
      </div>
    </div>
  );
}
