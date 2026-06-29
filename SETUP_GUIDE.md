# 🎓 Employee Profile Management System - Setup Guide

## Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/installer/)
3. Any code editor (VS Code recommended)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup MySQL Database
Create a new database in MySQL:
```sql
CREATE DATABASE hrms_erp;
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hrms_erp
DB_PORT=3306
```

**⚠️ Replace `your_mysql_password` with your actual MySQL password**

### 4. Create Database Tables
```bash
npm run db:push
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Credentials

This system uses a **mock authentication** system (for demo purposes).

Use the role switcher in the top-right corner to switch between:
- **Employee** - Basic access
- **HR Admin** - Department management access
- **Super Admin** - Full access
- **Medical Staff** - Medical records access

## Project Structure

```
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend API endpoints
│   └── [pages]/           # Frontend pages
├── components/            # Reusable React components
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schema and connection
│   ├── validations/      # Zod validation schemas
│   └── types/            # TypeScript type definitions
├── public/               # Static files
└── drizzle/              # Database migrations

```

## Features

✅ Employee Profile Management (with photo upload)
✅ Educational Qualifications
✅ Employment History
✅ Research Publications & Certifications
✅ Medical & Family Information
✅ Document Management (upload/download)
✅ Department Management
✅ Address & Identity Documents
✅ Role-based Access Control

## Database Schema

The system includes 22 tables covering:
- Employee core information
- Qualifications and certifications
- Employment history
- Publications
- Medical records
- Emergency contacts and dependents
- Departments and hierarchy
- File uploads
- Audit logs

## Troubleshooting

### "npm not found"
- Install Node.js and restart your terminal

### "MySQL connection failed"
- Verify MySQL is running
- Check credentials in `.env` file
- Test connection: `mysql -u root -p`

### "Port 3000 already in use"
- Close other applications using port 3000
- Or run on different port: `npm run dev -- -p 3001`

### "Module not found"
- Delete `node_modules` folder
- Run `npm install` again

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Update database schema
npm run lint         # Run ESLint
```

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Database:** MySQL 8.0
- **ORM:** Drizzle ORM
- **Validation:** Zod
- **Forms:** React Hook Form

## Support

For issues or questions, contact the development team.

## License

This project is developed for [Your College Name] internal use.

---

**Version:** 1.0.0  
**Academic Year:** 2025
