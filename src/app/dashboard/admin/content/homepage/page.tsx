import StaticContentEditor from '@/components/dashboard/content/StaticContentEditor';

export const dynamic = 'force-dynamic';

export default function HomepageContentPage() {
  return <StaticContentEditor pageSlug="homepage" title="Edit Homepage Content" />;
}
