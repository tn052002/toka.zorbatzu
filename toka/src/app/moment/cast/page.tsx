import CastRitual from '@/components/CastRitual';
import ScreenLayout from '@/components/ScreenLayout';

export default function CastPage() {
  return (
    <ScreenLayout
      eyebrow="Moment"
      title="Cast the moment"
      description="Choose a quick cast or slow down into a ritual."
    >
      <CastRitual />
    </ScreenLayout>
  );
}
