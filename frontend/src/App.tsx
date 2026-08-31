import { useState } from 'react';
import { PropertiesAdmin } from './screens/PropertiesAdmin';
import { ResidentSubmit } from './screens/ResidentSubmit';
import { AdminDashboard } from './screens/AdminDashboard';
import './App.css';

type Tab = 'properties' | 'submit' | 'dashboard';

const TABS: { id: Tab; label: string }[] = [
  { id: 'properties', label: 'Properties (Admin)' },
  { id: 'submit', label: 'Submit Ticket (Resident)' },
  { id: 'dashboard', label: 'Dashboard (Admin)' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('properties');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Strata Query App</h1>
        <p className="muted">Residents submit issues · admins triage and respond</p>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'tab active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="content">
        {tab === 'properties' && <PropertiesAdmin />}
        {tab === 'submit' && <ResidentSubmit />}
        {tab === 'dashboard' && <AdminDashboard />}
      </main>
    </div>
  );
}
