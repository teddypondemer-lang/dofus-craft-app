import React from 'react';

export default function NavigationHeader({ currentView, onNavigate, title, subtitle }) {
  const navItems = [
    { id: 'equipments', label: 'Calcul', icon: '🧮' },
    { id: 'favoris', label: 'Ventes', icon: '💸' },
    { id: 'ingredients', label: 'Ressources', icon: '🪵' },
  ];

  return (
    <div className="border-b border-slate-800 pb-4 space-y-4 w-full">
      {/* Zone Header : Hauteur minimale fixée pour éviter les décalages de layout */}
      <div className="flex items-center gap-3 min-h-[52px]">
        {/* LOGO SVG DOFUS (Taille fixe 48x48) */}
        <div 
          onClick={() => onNavigate && onNavigate('menu')}
          className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-md group cursor-pointer hover:border-amber-500/50 transition"
          title="Retour au menu principal"
        >
          <svg 
            viewBox="0 0 100 100" 
            className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M50 10 C30 10, 15 35, 15 60 C15 85, 30 90, 50 90 C70 90, 85 85, 85 60 C85 35, 70 10, 50 10 Z" className="fill-amber-500/20"/>
            <path d="M50 20 C35 20, 25 38, 25 60 C25 80, 35 83, 50 83 C65 83, 75 80, 75 60 C75 38, 65 20, 50 20 Z" className="fill-amber-500"/>
            <ellipse cx="50" cy="52" rx="12" ry="18" className="fill-amber-300"/>
          </svg>
        </div>

        {/* Titre & Sous-titre : Zone de texte à hauteur fixe pour stabiliser la navigation */}
        <div className="flex flex-col justify-center min-h-[40px]">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent leading-none">
            {title}
          </h1>
          <p className="text-xs text-slate-400 mt-1 h-4">
            {subtitle || ''}
          </p>
        </div>
      </div>

      {/* Les 3 boutons : Grille stricte à 3 colonnes et hauteur égale pour stabiliser l'affichage */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full h-10 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer shrink-0 ${
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