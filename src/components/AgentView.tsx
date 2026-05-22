'use client';

import { useState } from 'react';
import { useAppContext, Lead } from '@/context/AppContext';
import { MapPin, X } from 'lucide-react';

export default function AgentView() {
  const { leads, setLeads, inventory } = useAppContext();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleCheckIn = () => {
    setIsCheckedIn(true);
    // In a real app this would call GPS API
  };

  const handleUpdateLeadStatus = (status: 'Won' | 'Lost') => {
    if (!selectedLead) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === selectedLead.id ? { ...l, status } : l))
    );
    setSelectedLead(null);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>

      {/* Check-In Button */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center">
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg shadow-md transition-all ${
            isCheckedIn
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <MapPin className="w-6 h-6" />
          {isCheckedIn ? 'Checked In' : 'Check-In Location'}
        </button>
        {isCheckedIn && <p className="text-sm text-gray-500 mt-3">Logged location successfully.</p>}
      </div>

      {/* My Leads */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">My Leads</h2>
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
              onClick={() => setSelectedLead(lead)}
            >
              <div>
                <p className="font-semibold text-gray-900">{lead.name}</p>
                <p className="text-sm text-gray-500">{lead.address}</p>
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                lead.status === 'Won' ? 'bg-green-100 text-green-700' :
                lead.status === 'Lost' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {lead.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Viewer */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Viewer</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Item</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Available Stock</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    <span className={`px-2 py-1 rounded-full ${item.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.stock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Lead Update */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Update Lead</h3>
            <p className="text-gray-600 mb-6">{selectedLead.name}</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Used</label>
              <input
                type="number"
                placeholder="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleUpdateLeadStatus('Won')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-md transition-colors"
              >
                Mark Won
              </button>
              <button
                onClick={() => handleUpdateLeadStatus('Lost')}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition-colors"
              >
                Mark Lost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
