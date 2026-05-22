'use client';

import { useAppContext } from '@/context/AppContext';
import AdminView from '@/components/AdminView';
import AgentView from '@/components/AgentView';

export default function Home() {
  const { mode } = useAppContext();

  return (
    <div className="w-full">
      {mode === 'Admin' ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <AdminView />
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <AgentView />
        </div>
      )}
    </div>
  );
}
