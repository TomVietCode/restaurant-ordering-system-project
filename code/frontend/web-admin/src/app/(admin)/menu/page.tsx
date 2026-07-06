import { Suspense } from 'react';
import { MenuPage } from '@/components/features/Menu/MenuPage';

export default function Page() {
  return (
    <Suspense>
      <MenuPage />
    </Suspense>
  );
}
