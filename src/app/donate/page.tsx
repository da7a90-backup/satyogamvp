// app/donate/page.tsx
import { Metadata } from 'next';
import { FriendOfSatYogaPage } from '@/components/donation/DonationComponents';

export const metadata: Metadata = {
  title: 'Donate - Sat Yoga',
  description: 'Support the Sat Yoga mission and help actualize a new way of life through your generous contribution.',
};

export default function DonatePage() {
  return <FriendOfSatYogaPage />;
}