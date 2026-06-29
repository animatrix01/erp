# Implementation Plan: Employee Profile Management Module

## Overview

This implementation plan breaks down the Employee Profile Management Module into discrete, incremental tasks. Each task builds on previous work, starting with project setup, then core infrastructure, followed by individual feature pages, and finally integration and testing.

## Tasks

- [x] 1. Project Setup and Configuration
  - Initialize Next.js 14/15 project with TypeScript and App Router
  - Install and configure Tailwind CSS with institutional color palette (Slate/Zinc)
  - Install Shadcn UI and initialize required components
  - Install React Hook Form and Zod for form management
  - Install fast-check for property-based testing
  - Configure ESLint and Prettier
  - Set up project directory structure (app/, components/ui/, components/custom/, lib/)
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 2. Core Type Definitions and Validation Schemas
  - [x] 2.1 Create TypeScript type definitions in lib/types/index.ts
    - Define UserRole, Profile, Qualification, EmploymentRecord, Publication, MedicalData types
    - Define all supporting interfaces (EmergencyContact, Dependent, DashboardStatistics)
    - _Requirements: 11.3_
  
  - [x] 2.2 Create Zod validation schemas in lib/validations/
    - Create profile.ts with profileSchema (Employee ID regex, email, phone validation)
    - Create qualification.ts with qualificationSchema (year range, percentage range, Ph.D. conditional)
    - Create employment.ts with employmentSchema (date range validation)
    - Create research.ts with publicationSchema (DOI format, impact factor validation)
    - Create medical.ts with medicalSchema (emergency contact validation)
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.5, 4.6, 5.3, 6.2, 6.3, 7.5, 10.1_
  
  - [ ]* 2.3 Write property tests for validation schemas
    - **Property 5: Employee ID Format Validation**
    - **Property 7: Email Format Validation**
    - **Property 8: Phone Number Format Validation**
    - **Property 12: Passing Year Range Validation**
    - **Property 13: Percentage Range Validation**
    - **Property 14: Date Range Validation**
    - **Property 16: DOI Format Validation**
    - **Property 17: Impact Factor Positivity Validation**
    - _Requirements: 3.2, 3.4, 3.5, 4.5, 4.6, 5.3, 6.2, 6.3_

- [ ] 3. Mock Data Providers and State Management
  - [x] 3.1 Create mock data in lib/mock-data/
    - Create employees.ts with sample employee profiles
    - Create qualifications.ts with sample qualification records
    - Create employment.ts with sample employment history
    - Create publications.ts with sample research publications
    - Create medical.ts with sample medical/family data
    - Create dashboard.ts with sample statistics
    - _Requirements: 11.2_
  
  - [x] 3.2 Create role management context and hook
    - Create hooks/use-role.ts with RoleContext and useRole hook
    - Implement role state management (default to 'employee')
    - Provide role switching functionality
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 3.3 Write property tests for role management
    - **Property 2: Role State Synchronization**
    - _Requirements: 2.2, 2.4_

- [ ] 4. Global Layout Components
  - [x] 4.1 Create Sidebar navigation component
    - Create components/custom/sidebar.tsx
    - Implement navigation links to all sections (Dashboard, Profile Master, Qualifications, Employment History, Research & Publications, Certifications, Medical & Family)
    - Style with institutional aesthetic (compact, Slate/Zinc colors)
    - Use Next.js Link for client-side navigation
    - _Requirements: 1.1, 1.5_
  
  - [x] 4.2 Create Header with Role Switcher
    - Create components/custom/header.tsx with application title
    - Create components/custom/role-switcher.tsx with dropdown for role selection
    - Integrate useRole hook for state management
    - Style with institutional aesthetic
    - _Requirements: 1.2, 2.1_
  
  - [x] 4.3 Create root layout with persistent navigation
    - Update app/layout.tsx to include Sidebar and Header
    - Wrap with RoleProvider for global role state
    - Ensure layout persists across route changes
    - _Requirements: 1.3_
  
  - [ ]* 4.4 Write unit tests for layout components
    - Test Sidebar renders all navigation links
    - Test Header renders Role Switcher
    - Test Role Switcher displays all four role options
    - _Requirements: 1.1, 1.2, 2.1_
  
  - [ ]* 4.5 Write property test for navigation persistence
    - **Property 1: Navigation Persistence Across Routes**
    - _Requirements: 1.3_

- [ ] 5. Restriction Banner Component
  - [x] 5.1 Create RestrictionBanner component
    - Create components/custom/restriction-banner.tsx
    - Display warning message with amber/yellow styling
    - Accept message prop for customization
    - _Requirements: 2.3, 7.2_
  
  - [ ]* 5.2 Write property tests for access control
    - **Property 3: Access Control Banner Display**
    - **Property 4: Privileged Access Enablement**
    - _Requirements: 2.3, 7.2, 7.3, 7.4_

- [ ] 6. Dashboard Page
  - [x] 6.1 Create Dashboard statistics component
    - Create components/custom/dashboard-stats.tsx
    - Display total faculty count, Ph.D. holders count, faculty distribution
    - Use Card components for clean, compact layout
    - Style with institutional aesthetic
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 6.2 Create Export Panel component
    - Create components/custom/export-panel.tsx
    - Add "Export Master Data to Excel" button
    - Implement onClick handler with toast notification
    - Log export action to console
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [x] 6.3 Create Dashboard page
    - Create app/page.tsx
    - Integrate DashboardStats and ExportPanel components
    - Load mock dashboard data
    - _Requirements: 8.1, 8.2, 8.3, 9.1_
  
  - [ ]* 6.4 Write unit tests for Dashboard
    - Test Dashboard displays statistics correctly
    - Test Export button exists and is clickable
    - _Requirements: 8.1, 8.2, 8.3, 9.1_
  
  - [ ]* 6.5 Write property test for export notification
    - **Property 18: Export Notification Display**
    - _Requirements: 9.2, 9.4_

- [ ] 7. Profile Master Form
  - [x] 7.1 Create Profile form component
    - Create components/custom/profile-form.tsx
    - Implement form with React Hook Form and Zod validation
    - Add fields: Employee ID, First Name, Last Name, Email, Phone, DOB, Gender, Blood Group
    - Implement real-time validation feedback
    - Display inline error messages
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 10.5_
  
  - [x] 7.2 Create Profile Master page
    - Create app/profile-master/page.tsx
    - Integrate ProfileForm component
    - Load mock employee data
    - Handle form submission
    - _Requirements: 3.1_
  
  - [ ]* 7.3 Write unit tests for Profile form
    - Test all required fields are rendered
    - Test form submission with valid data succeeds
    - Test form submission with invalid Employee ID fails
    - Test email validation with invalid format
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [ ]* 7.4 Write property tests for Profile validation
    - **Property 6: Required Field Validation**
    - **Property 9: Validation Error Display**
    - **Property 19: Pre-Submission Validation Execution**
    - **Property 20: Simultaneous Error Display**
    - **Property 21: Real-Time Validation Feedback**
    - _Requirements: 3.3, 3.6, 10.2, 10.3, 10.4, 10.5_

- [ ] 8. Qualifications Management
  - [x] 8.1 Create Qualifications table component
    - Create components/custom/qualifications-table.tsx
    - Display table with columns: Degree Name, Institution, Passing Year, Percentage
    - Implement "Add Row" button to append new qualification entries
    - Implement conditional Ph.D. fields (Thesis Title, Research Guide, Research Area)
    - Show/hide Ph.D. fields based on degree selection
    - Integrate React Hook Form with field arrays
    - Apply Zod validation for year range and percentage
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 8.2 Create Qualifications page
    - Create app/qualifications/page.tsx
    - Integrate QualificationsTable component
    - Load mock qualification data
    - Handle form submission
    - _Requirements: 4.1_
  
  - [ ]* 8.3 Write unit tests for Qualifications
    - Test table displays all required columns
    - Test Add Row button adds new entry
    - Test Ph.D. fields appear when Ph.D. is selected
    - Test Ph.D. fields hide when non-Ph.D. degree is selected
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 8.4 Write property tests for Qualifications
    - **Property 10: Dynamic Row Addition**
    - **Property 11: Conditional Ph.D. Field Display**
    - _Requirements: 4.2, 4.3, 4.4_

- [ ] 9. Employment History Management
  - [x] 9.1 Create Employment History table component
    - Create components/custom/employment-table.tsx
    - Display table with columns: Previous Organization, Designation, From Date, To Date, Total Experience
    - Implement "Add Row" button to append new employment records
    - Calculate Total Experience automatically from date range
    - Integrate React Hook Form with field arrays
    - Apply Zod validation for date range
    - Display error when To Date is before From Date
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 9.2 Create Employment History page
    - Create app/employment-history/page.tsx
    - Integrate EmploymentTable component
    - Load mock employment data
    - Handle form submission
    - _Requirements: 5.1_
  
  - [ ]* 9.3 Write unit tests for Employment History
    - Test table displays all required columns
    - Test Add Row button adds new entry
    - Test date validation rejects invalid ranges
    - Test experience calculation with specific dates
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 9.4 Write property test for experience calculation
    - **Property 15: Experience Calculation Accuracy**
    - _Requirements: 5.4_

- [ ] 10. Research & Publications Management
  - [x] 10.1 Create Research form component
    - Create components/custom/research-form.tsx
    - Add fields: Journal Title, Conference Details, DOI, Impact Factor
    - Implement dynamic array for multiple publications
    - Integrate React Hook Form with field arrays
    - Apply Zod validation for DOI format and Impact Factor
    - Display inline error messages
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 10.2 Create Research & Publications page
    - Create app/research-publications/page.tsx
    - Integrate ResearchForm component
    - Load mock publication data
    - Handle form submission
    - _Requirements: 6.1_
  
  - [ ]* 10.3 Write unit tests for Research form
    - Test all required fields are rendered
    - Test DOI validation with invalid format
    - Test Impact Factor validation with negative value
    - Test adding multiple publications
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 11. Certifications Page
  - [x] 11.1 Create Certifications form component
    - Create components/custom/certifications-form.tsx
    - Add fields for professional credentials (Certification Name, Issuing Organization, Issue Date, Expiry Date)
    - Implement dynamic array for multiple certifications
    - Apply appropriate validation
    - _Requirements: 1.1_
  
  - [x] 11.2 Create Certifications page
    - Create app/certifications/page.tsx
    - Integrate CertificationsForm component
    - Load mock certification data
    - _Requirements: 1.1_

- [ ] 12. Medical & Family Information Management
  - [x] 12.1 Create Medical form component
    - Create components/custom/medical-form.tsx
    - Create structured tables for emergency contacts, allergies, blood group, dependents
    - Integrate React Hook Form with nested field arrays
    - Apply Zod validation for phone numbers
    - Implement access control based on role
    - Show RestrictionBanner when role is not 'super-admin' or 'medical-staff'
    - Disable all inputs when restricted
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ] 12.2 Create Medical & Family page
    - Create app/medical-family/page.tsx
    - Integrate MedicalForm component
    - Integrate useRole hook for access control
    - Load mock medical data
    - Handle form submission
    - _Requirements: 7.1_
  
  - [ ]* 12.3 Write unit tests for Medical form
    - Test all required sections are rendered
    - Test restriction banner appears for non-privileged roles
    - Test form inputs are disabled when restricted
    - Test form inputs are enabled for privileged roles
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 12.4 Write property tests for Medical access control
    - **Property 3: Access Control Banner Display** (if not already tested)
    - **Property 4: Privileged Access Enablement** (if not already tested)
    - _Requirements: 7.2, 7.3, 7.4_

- [x] 13. Checkpoint - Ensure all tests pass
  - Run all unit tests and property-based tests
  - Verify all pages render correctly
  - Test navigation between all sections
  - Test role switching across different pages
  - Ensure all forms validate correctly
  - Ask the user if questions arise

- [ ] 14. Styling and Polish
  - [x] 14.1 Apply institutional aesthetic across all pages
    - Ensure consistent use of Slate/Zinc color palette
    - Verify compact, table-heavy layout
    - Remove any flashy animations or gradients
    - Ensure high information density
    - _Requirements: 1.4, 1.5_
  
  - [ ] 14.2 Implement responsive design
    - Test on different screen sizes
    - Ensure tables are scrollable on mobile
    - Adjust sidebar for mobile (collapsible or drawer)
    - _Requirements: 1.1, 1.2_
  
  - [ ] 14.3 Add accessibility improvements
    - Verify all form inputs have labels
    - Ensure keyboard navigation works
    - Add ARIA attributes for dynamic content
    - Test with screen reader
    - Verify focus indicators are visible
    - _Requirements: 3.6, 10.5_

- [ ] 15. Integration and Final Testing
  - [ ]* 15.1 Write integration tests
    - Test complete user flow: add qualification with Ph.D. fields
    - Test role switching and its effect on Medical page
    - Test form submission workflows
    - Test navigation with state preservation
    - _Requirements: 1.3, 2.4, 4.3, 4.4, 7.2, 7.3, 7.4_
  
  - [ ] 15.2 Manual testing and verification
    - Test all forms with various valid and invalid inputs
    - Verify all validation messages are clear and helpful
    - Test export button functionality
    - Verify dashboard statistics display correctly
    - Test all role combinations on all pages
    - _Requirements: All_

- [ ] 16. Final Checkpoint - Production Readiness
  - Ensure all tests pass
  - Verify build succeeds without errors
  - Check TypeScript compilation
  - Run ESLint and fix any issues
  - Verify all requirements are met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → components → pages → integration
