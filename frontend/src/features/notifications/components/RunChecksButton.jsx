// src/features/notifications/components/RunChecksButton.jsx
// Admin-only manual trigger for system checks

import { Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { useRunSystemChecksMutation } from '../notificationsApi';

export default function RunChecksButton({ user }) {
  const [runChecks, { isLoading }] = useRunSystemChecksMutation();

  // ✅ Admin only
  const isAdmin = user?.role?.name === 'admin';
  if (!isAdmin) return null;

  const handleRun = async () => {
    try {
      const result = await runChecks({}).unwrap();
      const count = result?.data?.created || 0;
      if (count > 0) {
        toast.success(`${count} new notifications created`);
      } else {
        toast.success('No new alerts. All caught up! ✅');
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to run checks');
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleRun}
      disabled={isLoading}
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
    >
      <Zap className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isLoading ? 'Running...' : 'Run checks'}
      </span>
    </Button>
  );
}