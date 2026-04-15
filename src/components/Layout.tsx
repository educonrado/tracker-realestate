import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardCheck, Database } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex flex-col h-[100dvh] w-full relative bg-slate-900 pb-20">
      {/* Top Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700/50 p-4 sticky top-0 z-50">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            RematesTracker
          </h1>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 z-50 px-2 sm:px-6 py-2">
        <ul className="flex justify-between items-center max-w-5xl mx-auto h-16">
          <NavItem to="/" icon={<Home size={24} />} label="Inicio" />
          <NavItem to="/inspeccion" icon={<ClipboardCheck size={24} />} label="Inspección" />
          <NavItem to="/import" icon={<Database size={24} />} label="Consola" />
        </ul>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <li className="flex-1">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
            isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </NavLink>
    </li>
  );
}
