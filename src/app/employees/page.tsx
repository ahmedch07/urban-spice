'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { UserCheck, Plus, Shield, Mail, Phone, Edit2 } from 'lucide-react';

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create employee');
        return;
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (e) {
      setErrorMsg('Network error');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Staff & Employee Role Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-base">Store Employee Accounts</h3>
            </div>

            <button
              onClick={() => {
                setName('');
                setEmail('');
                setPhone('');
                setPassword('');
                setRole('CASHIER');
                setErrorMsg('');
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Account</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Total Orders Handled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40">
                    <td className="p-4 font-bold text-slate-100">{emp.name}</td>
                    <td className="p-4 text-slate-300 font-mono">{emp.email}</td>
                    <td className="p-4 text-slate-400 font-mono">{emp.phone || '-'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        emp.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400">{emp._count?.orders || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Add New Staff Account</h3>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                >
                  <option value="CASHIER">CASHIER (POS & Billing only)</option>
                  <option value="ADMIN">ADMIN (Full Control)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
