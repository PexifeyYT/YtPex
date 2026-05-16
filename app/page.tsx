import { Suspense } from 'react';
import MainApp from '@/components/MainApp';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <MainApp />
    </Suspense>
  );
}
