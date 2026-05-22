'use client';

import { useAppContext } from '@/context/AppContext';
import { Users, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function AdminView() {
  const { employees, inventory, leads } = useAppContext();

  const activeAgentsCount = employees.filter(e => e.isActive).length;
  const totalAgentsCount = employees.length;

  // Mock 'Today's Orders' by using won leads (or just static count for demo, but we'll use won leads)
  const todaysOrdersCount = leads.filter(l => l.status === 'Won').length + 45; // Base 45 + dynamic

  const lowStockAlertsCount = inventory.filter(i => i.stock < 5).length;

  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Command Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Agents</p>
            <p className="text-2xl font-bold text-gray-900">{activeAgentsCount} / {totalAgentsCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Today's Orders</p>
            <p className="text-2xl font-bold text-gray-900">{todaysOrdersCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{lowStockAlertsCount}</p>
          </div>
        </div>
      </div>

      {/* Master Inventory Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Master Inventory</h2>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Product Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Current Stock</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.stock < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {item.stock} Units
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Tracking Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Employee Tracking</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Agent Name</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Last Check-In</th>
                <th className="px-4 py-3 font-semibold rounded-tr-lg">Last Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {emp.isActive ? 'Active' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{emp.lastCheckIn || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{emp.lastAction || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
