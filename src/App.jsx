import React, { useState } from 'react';
import EquipmentsTable from './EquipmentsTable';
import Favoris from './Favoris';
import IngredientsManager from './IngredientsManager';

export default function App() {
  const [currentView, setCurrentView] = useState('menu');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* PAGE DU MENU D'ACCUEIL */}
      {currentView === 'menu' && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-2xl text-center">
            
            {/* EN-TÊTE AVEC LOGO SVG D'ŒUF DOFUS */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shadow-inner group transition-all hover:border-amber-500/50">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M50 10 C30 10, 15 35, 15 60 C15 85, 30 90, 50 90 C70 90, 85 85, 85 60 C85 35, 70 10, 50 10 Z" className="fill-amber-500/20"/>
                  <path d="M50 20 C35 20, 25 38, 25 60 C25 80, 35 83, 50 83 C65 83, 75 80, 75 60 C75 38, 65 20, 50 20 Z" className="fill-amber-500"/>
                  <ellipse cx="50" cy="52" rx="12" ry="18" className="fill-amber-300"/>
                </svg>
              </div>

              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent tracking-tight">
                  Dofus Craft & HDV
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Sélectionne un outil pour commencer :
                </p>
              </div>
            </div>

            {/* BOUTONS DU MENU */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setCurrentView('equipments')}
                className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl font-bold transition flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span> Équipements
                </span>
                <span className="text-amber-400 group-hover:translate-x-1 transition">→</span>
              </button>

              <button
                onClick={() => setCurrentView('favoris')}
                className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl font-bold transition flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">⭐️</span> Mes Favoris & Recettes
                </span>
                <span className="text-amber-400 group-hover:translate-x-1 transition">→</span>
              </button>

              <button
                onClick={() => setCurrentView('ingredients')}
                className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl font-bold transition flex items-center justify-between group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xl">📦</span> Gestionnaire de Prix
                </span>
                <span className="text-amber-400 group-hover:translate-x-1 transition">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VUES INDIVIDUELLES */}
      {currentView === 'equipments' && (
        <EquipmentsTable onNavigate={setCurrentView} />
      )}
      {currentView === 'favoris' && (
        <Favoris onNavigate={setCurrentView} />
      )}
      {currentView === 'ingredients' && (
        <IngredientsManager onNavigate={setCurrentView} />
      )}
    </div>
  );
}