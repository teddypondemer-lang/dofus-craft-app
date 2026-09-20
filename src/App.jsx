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
            <div>
              <h1 className="text-3xl font-extrabold text-amber-400">⚔️ Dofus Craft & HDV</h1>
              <p className="text-sm text-slate-400 mt-2">
                Sélectionne un outil pour commencer :
              </p>
            </div>

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