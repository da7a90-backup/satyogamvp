// DISABLED: Reports page has XLSX dependency issues with Vercel build
// TypeError: t.hasOwnProperty is not a function
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ReportsPage() {
  // Disabled until XLSX compatibility issues are resolved
  return notFound();
}
