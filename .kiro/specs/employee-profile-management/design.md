# Design Document: Employee Profile Management Module

## Overview

The Employee Profile Management Module is a Next.js 14/15 application built with TypeScript, Tailwind CSS, Shadcn UI, and React Hook Form with Zod validation. The system provides a comprehensive institutional ERP interface for managing employee profiles with role-based access controls, dynamic form fields, and export capabilities.

The design emphasizes:
- Institutional, clean, compact administrative aesthetic (Slate/Zinc color palette)
- Strict client-side validation using Zod schemas
- Modular state management for easy API integration
- Component-based architecture with clear separation of concerns
- Accessibility and form usability best practices

## Architecture

### Application Structure

```
employee-profile-management/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Dashboard page
│   ├── profile-master/
│   │   └── page.tsx              # Profile master form page
│   ├── qualifications/
│   │   └── page.tsx              # Qualifications management page
│   ├── employment-history/
│   │   └── page.tsx              # Employment history page
│   ├── research-publications/
│   │   └── page.tsx              # Research & publications page
│   ├── certifications/
│   │   └── page.tsx              # Certifications page
│   └── medical-family/
│       └── page.tsx              # Medical & family info page
├── components/
│   ├── ui/                        # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   └── custom/                    # Business logic components
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── role-switcher.tsx
│       ├── profile-form.tsx
│       ├── qualifications-table.tsx
│       ├── employment-table.tsx
│       ├── research-form.tsx
│       ├── medical-form.tsx
│       ├── restriction-banner.tsx
│       ├── dashboard-stats.tsx
│       └── export-panel.tsx
├── lib/
│   ├── validations/               # Zod schemas
│   │   ├── profile.ts
│   │   ├── qualification.ts
│   │   ├── employment.ts
│   │   ├── research.ts
│   │   └── medical.ts
│   ├── mock-data/                 # Mock data providers
│   │   ├── employees.ts
│   │   ├── qualifications.ts
│   │   └── ...
│   ├── types/                     # TypeScript types
│   │   └── index.ts
│   └── utils.ts                   # Utility functions
└── hooks/
    ├── use-role.ts                # Role management hook
    └── use-mock-data.ts           # Mock data hook
```

### Technology Stack

- **Framework**: Next.js 14/15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Slate/Zinc color palette
- **UI Components**: Shadcn UI
- **Form Management**: React Hook Form
- **Validation**: Zod
- **State Management**: React Context + hooks for role and mock data
- **Future Export**: ExcelJS (prepared interface)

### Design Patterns

1. **Container/Presentational Pattern**: Separate data fetching/state management from UI rendering
2. **Provider Pattern**: Use React Context for global state (role, theme)
3. **Composition Pattern**: Build complex forms from reusable field components
4. **Factory Pattern**: Mock data providers that can be swapped with API clients

## Components and Interfaces

### Layout Components

#### RootLayout
```typescript
interface RootLayoutProps {
  children: React.ReactNode;
}

// Wraps entire application with providers
// Includes Sidebar and Header as persistent elements
```

#### Sidebar
```typescript
interface SidebarProps {
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
}

// Navigation items:
// - Dashboard
// - Profile Master
// - Qualifications
// - Employment History
// - Research & Publications
// - Certifications
// - Medical & Family
```

#### Header
```typescript
interface HeaderProps {
  className?: string;
}

// Contains:
// - Application title
// - RoleSwitcher component
// - Optional user info display
```

#### RoleSwitcher
```typescript
interface RoleSwitcherProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

type UserRole = 'super-admin' | 'hr-admin' | 'employee' | 'medical-staff';

// Dropdown select for switching mock roles
```

### Form Components

#### ProfileForm
```typescript
interface ProfileFormProps {
  defaultValues?: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
}

interface ProfileFormData {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
}
```

#### QualificationsTable
```typescript
interface QualificationsTableProps {
  qualifications: Qualification[];
  onAdd: () => void;
  onUpdate: (index: number, data: Qualification) => void;
  onRemove: (index: number) => void;
}

interface Qualification {
  id: string;
  degreeName: string;
  institution: string;
  passingYear: number;
  percentage: number;
  // Conditional Ph.D. fields
  thesisTitle?: string;
  researchGuide?: string;
  researchArea?: string;
}
```

#### EmploymentTable
```typescript
interface EmploymentTableProps {
  records: EmploymentRecord[];
  onAdd: () => void;
  onUpdate: (index: number, data: EmploymentRecord) => void;
  onRemove: (index: number) => void;
}

interface EmploymentRecord {
  id: string;
  organization: string;
  designation: string;
  fromDate: Date;
  toDate: Date;
  totalExperience: number; // Calculated field
}
```

#### ResearchForm
```typescript
interface ResearchFormProps {
  publications: Publication[];
  onAdd: () => void;
  onUpdate: (index: number, data: Publication) => void;
  onRemove: (index: number) => void;
}

interface Publication {
  id: string;
  journalTitle: string;
  conferenceDetails?: string;
  doi: string;
  impactFactor?: number;
}
```

#### MedicalForm
```typescript
interface MedicalFormProps {
  data: MedicalData;
  onSubmit: (data: MedicalData) => void;
  isRestricted: boolean;
}

interface MedicalData {
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  bloodGroup: string;
  dependents: Dependent[];
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface Dependent {
  name: string;
  relationship: string;
  dateOfBirth: Date;
}
```

### Utility Components

#### RestrictionBanner
```typescript
interface RestrictionBannerProps {
  message: string;
  className?: string;
}

// Displays when user lacks permissions
// Styled with warning colors (amber/yellow)
```

#### DashboardStats
```typescript
interface DashboardStatsProps {
  stats: DashboardStatistics;
}

interface DashboardStatistics {
  totalFaculty: number;
  phdHolders: number;
  facultyDistribution: Record<string, number>;
}

// Card-based layout showing key metrics
```

#### ExportPanel
```typescript
interface ExportPanelProps {
  onExport: () => void;
  isLoading?: boolean;
}

// Contains export button
// Shows toast notification on click
// Prepared for ExcelJS integration
```

## Data Models

### Core Types

```typescript
// User Role
type UserRole = 'super-admin' | 'hr-admin' | 'employee' | 'medical-staff';

// Profile
interface Profile {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  bloodGroup: string;
}

// Qualification
interface Qualification {
  id: string;
  degreeName: string;
  institution: string;
  passingYear: number;
  percentage: number;
  isPHD: boolean;
  thesisTitle?: string;
  researchGuide?: string;
  researchArea?: string;
}

// Employment Record
interface EmploymentRecord {
  id: string;
  organization: string;
  designation: string;
  fromDate: Date;
  toDate: Date;
  totalExperience: number;
}

// Publication
interface Publication {
  id: string;
  journalTitle: string;
  conferenceDetails?: string;
  doi: string;
  impactFactor?: number;
}

// Medical Data
interface MedicalData {
  emergencyContacts: EmergencyContact[];
  allergies: string[];
  bloodGroup: string;
  dependents: Dependent[];
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
}

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: Date;
}

// Dashboard Statistics
interface DashboardStatistics {
  totalFaculty: number;
  phdHolders: number;
  facultyDistribution: Record<string, number>;
}
```

### Zod Validation Schemas

```typescript
// Profile Schema
const profileSchema = z.object({
  employeeId: z.string()
    .regex(/^[A-Z0-9]{6,10}$/, 'Employee ID must be 6-10 alphanumeric characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string().min(1, 'Blood group is required'),
});

// Qualification Schema
const qualificationSchema = z.object({
  degreeName: z.string().min(1, 'Degree name is required'),
  institution: z.string().min(1, 'Institution is required'),
  passingYear: z.number()
    .int()
    .min(1950)
    .max(new Date().getFullYear()),
  percentage: z.number()
    .min(0)
    .max(100),
  thesisTitle: z.string().optional(),
  researchGuide: z.string().optional(),
  researchArea: z.string().optional(),
}).refine(
  (data) => {
    if (data.degreeName.toLowerCase().includes('ph.d')) {
      return data.thesisTitle && data.researchGuide && data.researchArea;
    }
    return true;
  },
  {
    message: 'Ph.D. qualifications require thesis title, research guide, and research area',
  }
);

// Employment Schema
const employmentSchema = z.object({
  organization: z.string().min(1, 'Organization is required'),
  designation: z.string().min(1, 'Designation is required'),
  fromDate: z.date(),
  toDate: z.date(),
}).refine(
  (data) => data.toDate > data.fromDate,
  {
    message: 'To date must be after from date',
    path: ['toDate'],
  }
);

// Publication Schema
const publicationSchema = z.object({
  journalTitle: z.string().min(1, 'Journal title is required'),
  conferenceDetails: z.string().optional(),
  doi: z.string()
    .url('DOI must be a valid URL')
    .regex(/10\.\d{4,}\//, 'Invalid DOI format'),
  impactFactor: z.number()
    .positive()
    .optional(),
});

// Medical Schema
const medicalSchema = z.object({
  emergencyContacts: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  })),
  allergies: z.array(z.string()),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  dependents: z.array(z.object({
    name: z.string().min(1, 'Name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    dateOfBirth: z.date(),
  })),
});
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Navigation Persistence Across Routes
*For any* navigation action between different sections (Dashboard, Profile Master, Qualifications, etc.), the Navigation_Sidebar and Top_Header components should remain visible and mounted in the DOM.
**Validates: Requirements 1.3**

### Property 2: Role State Synchronization
*For any* role selection change in the Role_Switcher, the active role state should immediately update and all UI components should reflect the new role's permissions without requiring a page refresh.
**Validates: Requirements 2.2, 2.4**

### Property 3: Access Control Banner Display
*For any* Mock_Role that is not 'super-admin' or 'medical-staff', the Medical & Family section should display a restriction banner and disable all form inputs.
**Validates: Requirements 2.3, 7.2, 7.3**

### Property 4: Privileged Access Enablement
*For any* Mock_Role that is 'super-admin' or 'medical-staff', the Medical & Family section should hide the restriction banner and enable all form inputs for data entry and editing.
**Validates: Requirements 7.4**

### Property 5: Employee ID Format Validation
*For any* submitted Profile_Master form, if the Employee ID does not match the pattern of 6-10 alphanumeric characters, the form submission should be prevented and an error message should be displayed.
**Validates: Requirements 3.2**

### Property 6: Required Field Validation
*For any* form submission with one or more missing required fields, the System should prevent submission and display field-specific error messages for each missing field.
**Validates: Requirements 3.3**

### Property 7: Email Format Validation
*For any* email address input across all forms, if the email does not conform to standard email format (user@domain.tld), validation should fail and display an appropriate error message.
**Validates: Requirements 3.4**

### Property 8: Phone Number Format Validation
*For any* phone number input across all forms (Profile, Medical emergency contacts), if the phone number does not match the pattern of 10-15 digits with optional country code, validation should fail and display an appropriate error message.
**Validates: Requirements 3.5, 7.5**

### Property 9: Validation Error Display
*For any* validation failure on any form field, an inline error message should be displayed adjacent to the invalid field indicating the specific validation constraint that was violated.
**Validates: Requirements 3.6, 5.5, 6.4**

### Property 10: Dynamic Row Addition
*For any* click on an "Add Row" button in dynamic tables (Qualifications, Employment History, Publications), a new empty form row should be appended to the table with all required input fields.
**Validates: Requirements 4.2, 5.2, 6.5**

### Property 11: Conditional Ph.D. Field Display
*For any* qualification entry where the degree name contains "Ph.D." or "PhD", additional fields for Thesis Title, Research Guide Name, and Research Area should be displayed; for any other degree type, these fields should be hidden.
**Validates: Requirements 4.3, 4.4**

### Property 12: Passing Year Range Validation
*For any* qualification entry, if the Passing Year is not a four-digit integer between 1950 and the current year, validation should fail and display an error message.
**Validates: Requirements 4.5**

### Property 13: Percentage Range Validation
*For any* qualification entry, if the Percentage is not a numeric value between 0 and 100 (inclusive), validation should fail and display an error message.
**Validates: Requirements 4.6**

### Property 14: Date Range Validation
*For any* employment record, if the To Date is not chronologically after the From Date, validation should fail and display an error message indicating the date constraint violation.
**Validates: Requirements 5.3**

### Property 15: Experience Calculation Accuracy
*For any* employment record with valid From Date and To Date, the Total Experience field should display the calculated difference in years, rounded to one decimal place.
**Validates: Requirements 5.4**

### Property 16: DOI Format Validation
*For any* publication entry, if the DOI does not follow the standard DOI URL format (containing "10." followed by digits and a slash), validation should fail and display an error message indicating invalid DOI format.
**Validates: Requirements 6.2, 6.4**

### Property 17: Impact Factor Positivity Validation
*For any* publication entry with an Impact Factor value, if the value is not a positive number, validation should fail and display an error message.
**Validates: Requirements 6.3**

### Property 18: Export Notification Display
*For any* click on the "Export Master Data to Excel" button, the System should display a notification message indicating "Compiling Multi-Sheet Employee Data Matrix..." and log the export action to the browser console.
**Validates: Requirements 9.2, 9.4**

### Property 19: Pre-Submission Validation Execution
*For any* form submission attempt, all field validations defined in the corresponding Zod schema should execute before any form processing occurs, and submission should be blocked if any validation fails.
**Validates: Requirements 10.2, 10.4**

### Property 20: Simultaneous Error Display
*For any* form submission with multiple validation errors, all error messages should be displayed simultaneously rather than one at a time, allowing users to see all issues at once.
**Validates: Requirements 10.3**

### Property 21: Real-Time Validation Feedback
*For any* user interaction with a form field (blur, change), validation should execute immediately and display feedback without requiring form submission.
**Validates: Requirements 10.5**

## Error Handling

### Validation Errors
- All form validation errors are handled client-side using Zod schemas
- Errors are displayed inline next to the relevant form field
- Multiple errors are shown simultaneously to improve user experience
- Error messages are clear and actionable (e.g., "Employee ID must be 6-10 alphanumeric characters")

### Form Submission Errors
- Form submission is prevented when validation errors exist
- Users receive immediate feedback on what needs to be corrected
- Form state is preserved during error correction

### Access Control Errors
- Restricted sections display a prominent banner explaining access limitations
- Form inputs are disabled (not hidden) to maintain layout consistency
- Users understand why they cannot access certain sections based on their role

### Data Loading Errors
- Mock data providers include error simulation capabilities
- Loading states are displayed during data fetching
- Error boundaries catch and display component-level errors gracefully

### Navigation Errors
- Invalid routes redirect to the Dashboard
- 404 pages maintain the application layout and navigation

## Testing Strategy

### Unit Testing
Unit tests verify specific examples, edge cases, and error conditions for individual components and functions.

**Focus Areas:**
- Zod schema validation with specific valid/invalid inputs
- Component rendering with various prop combinations
- Utility functions (date calculations, formatting)
- Mock data provider functions
- Individual form field behaviors

**Example Unit Tests:**
- Profile form renders all required fields
- Employee ID validation rejects IDs shorter than 6 characters
- Date range validation correctly identifies invalid ranges
- Role switcher displays all four role options
- Dashboard displays correct statistics from mock data

### Property-Based Testing
Property-based tests verify universal properties across all inputs using a PBT library.

**Testing Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: employee-profile-management, Property {number}: {property_text}`
- Tests generate random valid and invalid inputs to verify properties hold universally

**Property Test Coverage:**
- **Property 1-4**: Role and navigation behavior across all role combinations
- **Property 5-9**: Validation logic across all possible input variations
- **Property 10-17**: Dynamic form behavior and calculations with random data
- **Property 18-21**: Form submission and validation workflow with various scenarios

**Example Property Tests:**
```typescript
// Property 5: Employee ID Format Validation
test('Feature: employee-profile-management, Property 5: Employee ID Format Validation', () => {
  fc.assert(
    fc.property(
      fc.string(), // Generate random strings
      (employeeId) => {
        const result = profileSchema.safeParse({ employeeId, /* other required fields */ });
        const isValid = /^[A-Z0-9]{6,10}$/.test(employeeId);
        
        // Property: validation result should match format check
        expect(result.success).toBe(isValid);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 11: Conditional Ph.D. Field Display
test('Feature: employee-profile-management, Property 11: Conditional Ph.D. Field Display', () => {
  fc.assert(
    fc.property(
      fc.string(), // Generate random degree names
      (degreeName) => {
        const isPHD = degreeName.toLowerCase().includes('ph.d') || 
                      degreeName.toLowerCase().includes('phd');
        
        // Render component with this degree
        const { container } = render(<QualificationRow degreeName={degreeName} />);
        
        // Property: Ph.D. fields visible if and only if degree is Ph.D.
        const phdFields = container.querySelector('[data-testid="phd-fields"]');
        expect(phdFields !== null).toBe(isPHD);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 15: Experience Calculation Accuracy
test('Feature: employee-profile-management, Property 15: Experience Calculation Accuracy', () => {
  fc.assert(
    fc.property(
      fc.date(), // Generate random from date
      fc.date(), // Generate random to date
      (fromDate, toDate) => {
        fc.pre(toDate > fromDate); // Precondition: valid date range
        
        const experience = calculateExperience(fromDate, toDate);
        const expectedYears = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        
        // Property: calculated experience should match expected value (within rounding)
        expect(Math.abs(experience - expectedYears)).toBeLessThan(0.1);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing
- Test complete user flows (e.g., adding a qualification with Ph.D. fields)
- Test role switching and its effect on multiple components
- Test form submission workflows from start to finish
- Test navigation between sections with state preservation

### Accessibility Testing
- Keyboard navigation through all forms and interactive elements
- Screen reader compatibility for form labels and error messages
- ARIA attributes for dynamic content and validation states
- Color contrast compliance for institutional color palette
- Focus management during form interactions

### Visual Regression Testing
- Ensure institutional aesthetic is maintained across updates
- Verify table layouts remain compact and readable
- Check responsive behavior on different screen sizes
- Validate color palette consistency (Slate/Zinc tones)

## Implementation Notes

### Styling Approach
- Use Tailwind CSS utility classes for all styling
- Create custom color palette in `tailwind.config.ts`:
  ```typescript
  colors: {
    institutional: {
      50: '#f8fafc',  // slate-50
      100: '#f1f5f9', // slate-100
      200: '#e2e8f0', // slate-200
      300: '#cbd5e1', // slate-300
      400: '#94a3b8', // slate-400
      500: '#64748b', // slate-500
      600: '#475569', // slate-600
      700: '#334155', // slate-700
      800: '#1e293b', // slate-800
      900: '#0f172a', // slate-900
    }
  }
  ```
- Avoid flashy animations and gradients
- Use subtle borders and shadows for depth
- Maintain high information density with compact spacing

### State Management Strategy
- Use React Context for global state (role, theme)
- Use React Hook Form for form state management
- Keep component state local when possible
- Mock data providers return Promises to simulate async API calls

### Mock Data Structure
```typescript
// lib/mock-data/employees.ts
export const mockEmployees: Profile[] = [
  {
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@university.edu',
    phone: '+1234567890',
    dateOfBirth: new Date('1980-01-15'),
    gender: 'male',
    bloodGroup: 'O+',
  },
  // ... more mock employees
];

// Mock data provider with API-like interface
export const getEmployeeProfile = async (id: string): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  const employee = mockEmployees.find(e => e.employeeId === id);
  if (!employee) throw new Error('Employee not found');
  return employee;
};
```

### Future API Integration
When replacing mock data with real APIs:
1. Replace mock data provider functions in `lib/mock-data/` with API client functions
2. Update function signatures to match (already Promise-based)
3. Add error handling for network failures
4. Add loading states in components
5. No changes needed in UI components (they already consume Promises)

### Performance Considerations
- Use React.memo for expensive table row components
- Implement virtual scrolling for large qualification/employment lists
- Debounce real-time validation to avoid excessive re-renders
- Lazy load page components using Next.js dynamic imports

### Accessibility Requirements
- All form inputs must have associated labels
- Error messages must be announced to screen readers
- Tables must have proper semantic markup (thead, tbody, th, td)
- Interactive elements must be keyboard accessible
- Focus indicators must be visible and clear

## Deployment Considerations

### Build Configuration
- Next.js static export for institutional hosting environments
- Environment variables for future API endpoints
- TypeScript strict mode enabled
- ESLint and Prettier for code quality

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No IE11 support required
- Progressive enhancement for older browsers

### Security Considerations
- Client-side validation only (server-side validation required in production)
- No sensitive data in localStorage (use secure session storage)
- HTTPS required for production deployment
- Content Security Policy headers recommended

