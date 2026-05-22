'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Employee {
  id: string;
  name: string;
  lastCheckIn: string | null;
  lastAction: string | null;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
}

export interface Lead {
  id: string;
  name: string;
  status: 'Pending' | 'Won' | 'Lost';
  address: string;
}

export interface AppContextType {
  mode: 'Admin' | 'Agent';
  setMode: (mode: 'Admin' | 'Agent') => void;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const initialEmployees: Employee[] = [
  { id: '1', name: 'John Doe', lastCheckIn: '10:00 AM', lastAction: 'Logged order at Sector 14', isActive: true },
  { id: '2', name: 'Jane Smith', lastCheckIn: '11:30 AM', lastAction: 'Checked in at Main St', isActive: true },
  { id: '3', name: 'Mike Johnson', lastCheckIn: null, lastAction: null, isActive: false },
];

const initialInventory: InventoryItem[] = [
  { id: '1', name: 'Product A', category: 'Electronics', stock: 15 },
  { id: '2', name: 'Product B', category: 'Hardware', stock: 2 },
  { id: '3', name: 'Product C', category: 'Software', stock: 100 },
];

const initialLeads: Lead[] = [
  { id: '1', name: 'Acme Corp', status: 'Pending', address: '123 Business Rd' },
  { id: '2', name: 'Globex', status: 'Pending', address: '456 Innovation Way' },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'Admin' | 'Agent'>('Admin');
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  return (
    <AppContext.Provider value={{ mode, setMode, employees, setEmployees, inventory, setInventory, leads, setLeads }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};