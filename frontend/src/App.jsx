// src/App.jsx
// Root component — with Suspense fallback

import { Suspense } from 'react';
import AppRoutes from '@/routes/AppRoutes';
import FullPageLoader from '@/components/common/FullPageLoader';

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader message="Loading application..." />}>
      <AppRoutes />
    </Suspense>
  );
}