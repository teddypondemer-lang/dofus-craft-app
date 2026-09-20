import React from 'react';

export default function NavigationHeader({ currentView, onNavigate, title, subtitle }) {
  const navItems = [
    { id: 'equipments', label: 'Calcul', icon: '🧮' },
    { id: 'favoris', label: 'Ventes', icon: '💸' },
    { id: 'ingredients', label: 'Ressources', icon: '🪵' },
  ];

  return (
    <div className="border-b border-slate-800 pb-4 space-y-3">
      {/* Titre de la page */}
      <div>
        <h1 className="text-2xl font-bold text-amber-400">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {/* Les 3 boutons étalés sur toute la largeur */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}