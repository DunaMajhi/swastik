'use client';

import { useAppContext } from '@/context/AppContext';

export default function Navbar() {
  const { mode, setMode } = useAppContext();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm z-50 sticky top-0">
      <div className="font-bold text-xl text-gray-900 tracking-tight">
        FieldTrack <span className="text-blue-600">Pro</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${mode === 'Admin' ? 'text-blue-600' : 'text-gray-500'}`}>Admin</span>
        <button
          onClick={() => setMode(mode === 'Admin' ? 'Agent' : 'Admin')}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span
            className={`${
              mode === 'Agent' ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md`}
          />
        </button>
        <span className={`text-sm font-medium ${mode === 'Agent' ? 'text-blue-600' : 'text-gray-500'}`}>Agent</span>
      </div>
    </nav>
  );
}