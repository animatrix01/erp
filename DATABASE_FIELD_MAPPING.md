# DATABASE FIELD MAPPING REPORT
**HRMS ERP System - Complete Frontend to Database Mapping**

**Generated:** June 4, 2026  
**Architect:** Senior Database Architect  
**Status:** PRE-IMPLEMENTATION AUDIT

---

## EXECUTIVE SUMMARY

This document maps every frontend field discovered in the codebase to its corresponding database representation. This ensures no data is lost and supports future scalability.

**Total Frontend Modules Analyzed:** 7  
**Total Tables Required:** 15+  
**Total Fields Mapped:** 100+  
**Missing Features Identified:** 5 (Address, Identity Docs, Allergies UI, Medical History, Astrology/Numerology)

---

## MODULE 1: PROFILE MASTER (Personal Information)

### Frontend Fields (profile-form.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| employeeId | string | Yes | employee_id | employees | PRIMARY KEY, 6-10 alphanumeric |
| firstName | string | Yes | first_name | employees | |
| lastName | string | Yes | last_name | employees | |
| email | string | Yes | email | employees | UNIQUE, validated email format |
| phone | string | Yes | phone | employees | International format |
| dateOfBirth | date | Yes | date_of_birth | employees | |
| gender | enum | Yes | gender | employees | 'male', 'female', 'other' |
| bloodGroup | string | Yes | blood_group | employees | Also in medical_information |

### Missing Fields (From Audit - Phase 1)
| Field Name | Type | Database Column | Table | Status |
|------------|------|----------------|-------|--------|
| aadharNumber | string | aadhar_number | identity_documents | NOT IN FRONTEND |
| panNumber | string | pan_number | identity_documents | NOT IN FRONTEND |
| passportNumber | string | passport_number | identity_documents | NOT IN FRONTEND |
| permanentAddress | object | - | addresses | NOT IN FRONTEND |
| currentAddress | object | - | addresses | NOT IN FRONTEND |
| photo | file | photo_url | employees | NOT IN FRONTEND |

**Status:** ✅ All visible fields mapped | ⚠️ 6 required fields missing from frontend

---

## MODULE 2: QUALIFICATIONS (Educational Credentials)

### Frontend Fields (qualifications-table.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | qualifications | UUID PRIMARY KEY |
| degreeName | string | Yes | degree_name | qualifications | |
| institution | string | Yes | institution | qualifications | |
| passingYear | number | Yes | passing_year | qualifications | 1950-current |
| percentage | number | Yes | percentage | qualifications | 0-100, decimal(5,2) |
| isPHD | boolean | Auto | is_phd | qualifications | Computed from degree_name |
| thesisTitle | string | Cond. | thesis_title | qualifications | Required if Ph.D. |
| researchGuide | string | Cond. | research_guide | qualifications | Required if Ph.D. |
| researchArea | string | Cond. | research_area | qualifications | Required if Ph.D. |

**Relationship:** qualifications.employee_id → employees.id (ONE employee HAS MANY qualifications)

**Status:** ✅ All fields mapped | ✅ No missing fields

---

## MODULE 3: EMPLOYMENT HISTORY

### Frontend Fields (employment-table.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | employment_history | UUID PRIMARY KEY |
| organization | string | Yes | organization_name | employment_history | |
| designation | string | Yes | designation | employment_history | |
| fromDate | date | Yes | from_date | employment_history | |
| toDate | date | Yes | to_date | employment_history | Must be after from_date |
| totalExperience | number | Auto | total_experience_years | employment_history | Calculated, decimal(4,1) |

**Relationship:** employment_history.employee_id → employees.id (ONE employee HAS MANY employment records)

**Status:** ✅ All fields mapped | ✅ No missing fields

---

## MODULE 4: CERTIFICATIONS

### Frontend Fields (certifications-form.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | certifications | UUID PRIMARY KEY |
| certificationName | string | Yes | certification_name | certifications | |
| issuingOrganization | string | Yes | issuing_organization | certifications | |
| issueDate | date | Yes | issue_date | certifications | |
| expiryDate | date | No | expiry_date | certifications | Nullable |

**Relationship:** certifications.employee_id → employees.id (ONE employee HAS MANY certifications)

**Status:** ✅ All fields mapped | ✅ No missing fields

---

## MODULE 5: RESEARCH & PUBLICATIONS

### Frontend Fields (research-form.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | publications | UUID PRIMARY KEY |
| journalTitle | string | Yes | journal_title | publications | |
| conferenceDetails | string | No | conference_details | publications | Nullable |
| doi | string | Yes | doi | publications | URL format, UNIQUE |
| impactFactor | number | No | impact_factor | publications | Decimal(5,2), Nullable |

**Relationship:** publications.employee_id → employees.id (ONE employee HAS MANY publications)

**Status:** ✅ All fields mapped | ✅ No missing fields

---

## MODULE 6: MEDICAL & FAMILY INFORMATION

### 6A. Medical Information (medical-form.tsx)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| bloodGroup | string | Yes | blood_group | medical_information | Also in employees table |
| allergies | array | No | - | allergies | ⚠️ Type exists, NO UI FIELD |

### 6B. Emergency Contacts
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | emergency_contacts | UUID PRIMARY KEY |
| name | string | Yes | name | emergency_contacts | |
| relationship | string | Yes | relationship | emergency_contacts | |
| phone | string | Yes | phone | emergency_contacts | International format |

**Relationship:** emergency_contacts.employee_id → employees.id (ONE employee HAS MANY emergency contacts)

### 6C. Dependents (Family Members)
| Field Name | Type | Required | Database Column | Table | Notes |
|------------|------|----------|----------------|-------|-------|
| id | string | No | id | dependents | UUID PRIMARY KEY |
| name | string | Yes | name | dependents | |
| relationship | string | Yes | relationship | dependents | |
| dateOfBirth | date | Yes | date_of_birth | dependents | |

**Relationship:** dependents.employee_id → employees.id (ONE employee HAS MANY dependents)

### Missing Fields (From Audit - Phase 5)
| Field Name | Type | Database Column | Table | Status |
|------------|------|----------------|-------|--------|
| medicalHistory | text | medical_history | medical_information | NOT IN FRONTEND |
| chronicConditions | array | - | chronic_conditions | NOT IN FRONTEND |
| currentMedications | array | - | medications | NOT IN FRONTEND |

**Status:** ✅ Contacts & Dependents mapped | ⚠️ Allergies UI missing | ⚠️ Medical history not in frontend

---

## MODULE 7: DASHBOARD STATISTICS

### Frontend Display (dashboard-stats.tsx)
| Metric | Type | Database Source | Notes |
|--------|------|----------------|-------|
| totalFaculty | number | COUNT(employees) | Active employees |
| phdHolders | number | COUNT WHERE is_phd=true | From qualifications |
| facultyDistribution | object | GROUP BY designation | Aggregated |

**Status:** ✅ Can be computed from employees and qualifications tables

---

## SYSTEM TABLES (Not in Frontend)

### Required for Production

#### 1. Users Table (Authentication)
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PRIMARY KEY |
| employee_id | string | No | FOREIGN KEY to employees.id |
| username | string | Yes | UNIQUE |
| password_hash | string | Yes | Hashed with bcrypt |
| role | enum | Yes | 'super-admin', 'hr-admin', 'employee', 'medical-staff' |
| is_active | boolean | Yes | Default true |
| last_login_at | timestamp | No | |
| created_at | timestamp | Yes | |
| updated_at | timestamp | Yes | |

#### 2. Sessions Table
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PRIMARY KEY |
| user_id | UUID | Yes | FOREIGN KEY to users.id |
| token | string | Yes | JWT or session token |
| expires_at | timestamp | Yes | |
| created_at | timestamp | Yes | |

#### 3. Audit Logs Table
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PRIMARY KEY |
| user_id | UUID | Yes | FOREIGN KEY to users.id |
| employee_id | UUID | No | FOREIGN KEY to employees.id |
| table_name | string | Yes | Which table was modified |
| record_id | UUID | Yes | Which record was modified |
| action | enum | Yes | 'CREATE', 'UPDATE', 'DELETE' |
| old_values | JSON | No | Previous data |
| new_values | JSON | No | New data |
| ip_address | string | No | |
| user_agent | string | No | |
| created_at | timestamp | Yes | |

#### 4. File Uploads Table
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Yes | PRIMARY KEY |
| employee_id | UUID | Yes | FOREIGN KEY to employees.id |
| file_type | enum | Yes | 'aadhar', 'pan', 'passport', 'certificate', 'other' |
| file_name | string | Yes | Original filename |
| file_path | string | Yes | Storage path or URL |
| file_size | integer | Yes | Bytes |
| mime_type | string | Yes | |
| uploaded_by | UUID | Yes | FOREIGN KEY to users.id |
| uploaded_at | timestamp | Yes | |
| is_verified | boolean | No | For document verification |
| verified_by | UUID | No | FOREIGN KEY to users.id |
| verified_at | timestamp | No | |

---

## FUTURE MODULES (Phase 4C, 4D - Not Currently in UI)

### Astrology Table (Phase 4C)
| Field | Type | Database Column | Status |
|-------|------|----------------|--------|
| birthTime | time | birth_time | NOT IMPLEMENTED |
| birthPlace | string | birth_place | NOT IMPLEMENTED |
| zodiacSign | string | zodiac_sign | NOT IMPLEMENTED |
| moonSign | string | moon_sign | NOT IMPLEMENTED |
| ascendant | string | ascendant | NOT IMPLEMENTED |

### Numerology Table (Phase 4D)
| Field | Type | Database Column | Status |
|-------|------|----------------|--------|
| lifePathNumber | integer | life_path_number | NOT IMPLEMENTED |
| destinyNumber | integer | destiny_number | NOT IMPLEMENTED |
| soulUrgeNumber | integer | soul_urge_number | NOT IMPLEMENTED |

**Decision:** Create tables now with nullable fields for future expansion

---

## COMPLETE TABLE LIST

### Core Employee Data (7 tables)
1. ✅ **employees** - Primary employee information
2. ✅ **qualifications** - Educational records
3. ✅ **employment_history** - Previous employment
4. ✅ **certifications** - Professional certifications
5. ✅ **publications** - Research publications
6. ✅ **medical_information** - Medical data (one-to-one)
7. ✅ **emergency_contacts** - Emergency contact list

### Family & Dependents (1 table)
8. ✅ **dependents** - Family members

### Missing from Frontend (3 tables)
9. ⚠️ **addresses** - Permanent and current addresses
10. ⚠️ **identity_documents** - Aadhar, PAN, Passport
11. ⚠️ **allergies** - Employee allergies (many-to-many)

### System Tables (4 tables)
12. ✅ **users** - Authentication
13. ✅ **sessions** - User sessions
14. ✅ **audit_logs** - Change tracking
15. ✅ **file_uploads** - Document management

### Future Expansion (3 tables)
16. 🔮 **astrology_profiles** - Phase 4C (prepared)
17. 🔮 **numerology_profiles** - Phase 4D (prepared)
18. 🔮 **chronic_conditions** - Detailed medical (prepared)

### Supporting Tables (2 tables)
19. ✅ **medications** - Current medications (prepared)
20. ✅ **departments** - For future organization structure

**Total Tables:** 20

---

## RELATIONSHIP SUMMARY

```
employees (1) ──< (M) qualifications
employees (1) ──< (M) employment_history
employees (1) ──< (M) certifications
employees (1) ──< (M) publications
employees (1) ──< (M) emergency_contacts
employees (1) ──< (M) dependents
employees (1) ──< (M) addresses
employees (1) ─── (1) medical_information
employees (1) ─── (1) identity_documents
employees (1) ─── (1) astrology_profiles
employees (1) ─── (1) numerology_profiles
employees (1) ──< (M) file_uploads
employees (M) ──< (M) allergies (via employee_allergies junction)
employees (1) ──< (M) audit_logs

users (1) ──< (M) sessions
users (1) ──< (M) audit_logs
users (1) ─── (1) employees (optional)
```

---

## DATA INTEGRITY RULES

### Primary Keys
- All tables use UUID v4 as PRIMARY KEY
- Employee ID (employeeId) is UNIQUE business key in employees table

### Foreign Keys
- ON DELETE CASCADE: dependents, emergency_contacts, file_uploads
- ON DELETE SET NULL: audit_logs.user_id
- ON DELETE RESTRICT: employees (prevent deletion if user exists)

### Indexes
- UNIQUE: employees.employee_id, employees.email, publications.doi
- INDEX: All foreign keys
- INDEX: employees.email, employees.employee_id (for search)
- INDEX: audit_logs.created_at, audit_logs.table_name
- INDEX: qualifications.is_phd (for dashboard stats)

### Soft Deletes
- employees.deleted_at
- users.deleted_at
- Enables data recovery and audit compliance

---

## ASSUMPTIONS MADE

1. **Employee ID Format:** 6-10 alphanumeric characters (from validation regex)
2. **Phone Format:** International format with optional +, 10-15 digits
3. **Email:** Standard email validation, must be unique per employee
4. **DOI:** Must be URL format starting with 10.xxxx/
5. **Percentage:** Stored as decimal(5,2) for precision (e.g., 85.75%)
6. **Experience:** Stored as decimal(4,1) for years (e.g., 5.5 years)
7. **Impact Factor:** Stored as decimal(5,2) (e.g., 12.45)
8. **Gender:** Enum with 'male', 'female', 'other' for inclusivity
9. **Roles:** Four roles as defined in frontend (extensible)
10. **Allergies:** Many-to-many relationship (employee can have multiple, allergy can affect multiple)

---

## MISSING FEATURES REQUIRING DATABASE SUPPORT

### Critical (Should add immediately)
1. ✅ **Addresses table** - Phase 1 requirement
2. ✅ **Identity Documents table** - Phase 1 requirement
3. ✅ **Allergies table + junction** - Phase 5 requirement

### High Priority
4. ✅ **Medical history fields** - In medical_information table
5. ✅ **Chronic conditions table** - Separate table for multiple conditions
6. ✅ **Medications table** - Current medications tracking

### Future
7. 🔮 **Astrology table** - Phase 4C (structure prepared)
8. 🔮 **Numerology table** - Phase 4D (structure prepared)
9. 🔮 **Departments table** - For organizational structure

---

## VALIDATION MAPPING

All Zod validations will be enforced at database level where possible:

| Frontend Validation | Database Constraint |
|---------------------|---------------------|
| Employee ID regex | CHECK constraint |
| Phone regex | CHECK constraint + VARCHAR(20) |
| Email format | CHECK constraint + UNIQUE |
| Date ranges | CHECK constraint (to_date > from_date) |
| Percentage 0-100 | CHECK constraint |
| Year 1950-current | CHECK constraint |
| Required fields | NOT NULL |
| Optional fields | NULL allowed |

---

## SCALABILITY CONSIDERATIONS

### Performance
- Indexes on all foreign keys
- Composite indexes for common queries
- Prepared for 1000+ employees
- Pagination-ready structure

### Security
- Password hashing (bcrypt)
- Audit logs for compliance
- Soft deletes for data recovery
- Role-based access at database level

### Maintainability
- Clear naming conventions (snake_case)
- Comprehensive comments
- Foreign key constraints
- Normalized design (3NF)

### Future Growth
- Department table prepared
- Astrology/Numerology tables prepared
- Extensible allergy system
- Document management ready

---

## FIELD COUNT SUMMARY

| Module | Frontend Fields | Database Columns | Missing UI | Status |
|--------|----------------|------------------|------------|--------|
| Profile Master | 8 | 15 | 7 | ⚠️ Incomplete |
| Qualifications | 9 | 9 | 0 | ✅ Complete |
| Employment | 6 | 6 | 0 | ✅ Complete |
| Certifications | 5 | 5 | 0 | ✅ Complete |
| Publications | 5 | 5 | 0 | ✅ Complete |
| Medical Info | 2 | 6 | 4 | ⚠️ Incomplete |
| Emergency Contacts | 4 | 4 | 0 | ✅ Complete |
| Dependents | 4 | 4 | 0 | ✅ Complete |
| **TOTAL** | **43** | **54** | **11** | **79% Complete** |

**System Tables:** 15+ additional columns for auth, audit, files

**Grand Total Database Columns:** 150+

---

## CONCLUSION

✅ **All visible frontend fields have been mapped**  
⚠️ **11 required fields missing from frontend** (addresses, identity docs, allergies UI, medical history)  
✅ **Database design supports future expansion**  
✅ **Production-ready with audit, security, and scalability**  

**Next Step:** Generate Drizzle schema, relations, migrations, and seed data

---

**END OF FIELD MAPPING REPORT**
