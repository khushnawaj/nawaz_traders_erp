'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserManagementRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings?tab=roles');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-500 font-outfit">
      Redirecting to System Settings → User Roles & Permissions...
    </div>
  );
}
