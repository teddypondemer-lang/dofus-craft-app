// Exemple de correction pour NavigationHeader.jsx
export default function NavigationHeader({ title, currentView, onNavigate }) {
  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
      <h1 className="text-xl font-black text-amber-400">{title}</h1>
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate('equipments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentView === 'equipments' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
        >
          Calcul
        </button>
        <button
          onClick={() => onNavigate('favoris')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentView === 'favoris' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
        >
          Favoris
        </button>
        <button
          onClick={() => onNavigate('ingredients')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${currentView === 'ingredients' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
        >
          Ressources
        </button>
      </div>
    </div>
  );
}