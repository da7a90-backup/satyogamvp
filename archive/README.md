# Archive Directory

This directory contains files that were moved from the project root during cleanup on December 1, 2025.

## Structure

### `/temp/` - Temporary & Auto-Generated Files (19 files)
**Safe to delete if needed, but kept for safety:**

- **Log files (4):** `backend_server.log`, `frontend.log`, `frontend_dev.log`, `frontend_restart.log`
- **PID files (4):** `backend_server.pid`, `frontend_dev.pid`, `frontend_pid.txt`, `frontend_restart.pid`
- **Vercel env files (9):** `.env.production.check`, `.env.production.final`, `.env.production.fixed`, `.env.production.verify`, `.env.production.verify2`, `.env.vercel.check`, `.env.production.local`, `.env.vercel.local`
  - All contain expired VERCEL_OIDC_TOKEN JWTs and old Cloudflare tunnel URLs
  - No unique secrets - all values already in active `.env` files
- **System files (2):** `.DS_Store`, `tsconfig.tsbuildinfo`

### `/docs/` - Historical Documentation (12 files)
**Historical reference - completed migration and implementation docs:**

- **Migration docs (5):** `ABOUT_PAGES_MIGRATION_COMPLETE.md`, `MIGRATION_STATUS.md`, `MIGRATION_PROGRESS_UPDATE.md`, `static_data_migration.md`, `ACCORDION_FIX.md`
- **Implementation docs (3):** `IMPLEMENTATION_PROGRESS.md`, `IMPLEMENTATION_SUMMARY.md`, `LAST_TOUCHED.md`
- **Technical docs (3):** `ARCHITECTURE.md`, `IMAGE_VIDEO_FIXES.md`, `PRISMA_POSTGRES_SETUP.md`
- **Data file (1):** `server_paths.txt` - Old WordPress server paths

### `/content/` - Downloaded Content
**Large content files from old WordPress migration:**

- `downloaded_pdfs/` (53 PDF files, ~200MB) - Retreat audio/video package PDFs from old site

### `/database/` - Database Exports
**SQL backups from November 4, 2025:**

- `database_export/` - PostgreSQL schema and data dumps
  - `complete_export.sql`, `data.sql`, `schema.sql`, `table_counts.txt`

## Notes

- **Nothing deleted** - All files moved here for safety
- **Active environment files** remain in root (`.env`, `backend/.env`)
- **Tilopay tokens** safely stored in `backend/.env` (NOT hardcoded)
- Root directory now contains only active configuration and current documentation

## Cleanup Recommendations

After confirming everything works:
- `/temp/` can be deleted (all auto-generated or expired)
- `/docs/` can be compressed or moved to external storage
- `/content/downloaded_pdfs/` can be deleted if content migrated to Cloudflare CDN
- `/database/` should be kept as backup
