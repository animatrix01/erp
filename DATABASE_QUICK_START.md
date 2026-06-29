# Database Quick Start Guide
**HRMS ERP System - Developer Setup**

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- Basic understanding of Drizzle ORM

## 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install drizzle-orm mysql2 drizzle-kit bcryptjs
npm install --save-dev @types/bcryptjs
```

### Step 2: Create Database

```sql
CREATE DATABASE hrms_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Configure Environment

```bash
# Copy the example file
copy .env.example .env

# Edit .env and update these values:
# DB_USER=your_mysql_username
# DB_PASSWORD=your_mysql_password
# JWT_SECRET=generate_a_random_secret_key
```

### Step 4: Generate Migration

```bash
npx drizzle-kit generate:mysql
```

### Step 5: Apply to Database

```bash
npx drizzle-kit push:mysql
```

### Step 6: Verify Setup

```bash
# Connect to MySQL
mysql -u root -p hrms_erp

# List tables
SHOW TABLES;

# Should see 20 tables
```

## Common Commands

```bash
# Generate new migration after schema changes
npx drizzle-kit generate:mysql

# Push changes to database
npx drizzle-kit push:mysql

# Check database schema
npx drizzle-kit introspect:mysql

# Run seed data (after implementing connection)
npx ts-node lib/db/seed.ts
```

## Database Connection

Update `lib/db/index.ts`:

```typescript
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const db = drizzle(connection);
```

## Quick Query Examples

```typescript
import { db } from '@/lib/db';
import { employees, qualifications } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Get all employees
const allEmployees = await db.select().from(employees);

// Get employee by ID
const employee = await db.select()
  .from(employees)
  .where(eq(employees.employeeId, 'EMP001'));

// Get employee with qualifications
const empWithQuals = await db.select()
  .from(employees)
  .leftJoin(qualifications, eq(employees.id, qualifications.employeeId))
  .where(eq(employees.id, 'some-uuid'));

// Insert new employee
const newEmployee = await db.insert(employees).values({
  employeeId: 'EMP999',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@college.edu',
  phone: '+919876543210',
  dateOfBirth: new Date('1990-01-01'),
  gender: 'male',
  bloodGroup: 'O+',
});

// Update employee
await db.update(employees)
  .set({ phone: '+919999999999' })
  .where(eq(employees.id, 'some-uuid'));

// Soft delete
await db.update(employees)
  .set({ deletedAt: new Date() })
  .where(eq(employees.id, 'some-uuid'));
```

## Troubleshooting

### "Can't connect to MySQL server"
- Check MySQL is running: `mysql --version`
- Verify credentials in `.env`
- Check DB_HOST and DB_PORT

### "Unknown database 'hrms_erp'"
- Create database first: `CREATE DATABASE hrms_erp;`

### "Access denied for user"
- Check MySQL user has permissions
- Run: `GRANT ALL PRIVILEGES ON hrms_erp.* TO 'your_user'@'localhost';`

### Migration fails
- Check `drizzle.config.ts` has correct credentials
- Ensure database exists
- Check MySQL version is 8.0+

## Next Steps

1. ✅ Database setup complete
2. 📝 Create API routes in `app/api/`
3. 🔐 Implement authentication
4. 📊 Connect frontend forms to database
5. 🧪 Write tests

## Documentation

- **Full Schema Details:** See `DATABASE_IMPLEMENTATION_REPORT.md`
- **Field Mapping:** See `DATABASE_FIELD_MAPPING.md`
- **Drizzle Docs:** https://orm.drizzle.team/docs/overview

## Support

If you encounter issues:
1. Check the logs in terminal
2. Review `DATABASE_IMPLEMENTATION_REPORT.md`
3. Consult Drizzle ORM documentation
4. Contact the database team

---

**Ready to code!** 🚀
