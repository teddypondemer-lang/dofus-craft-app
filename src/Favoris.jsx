import React, { useState, useEffect } from 'react';
import NavigationHeader from './NavigationHeader';

const getName = (obj) => {
  if (!obj) return 'Inconnu';
  if (typeof obj === 'string') return obj;
  const raw = obj.item_name || obj.name || obj.title || (obj.item && (obj.item.name || obj.item.item_name));
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null) return raw.fr || raw.en || raw.name || 'Inconnu';
  return obj.fr || obj.en || 'Inconnu';
};

const getItemIcon = (obj) => {
  if (!obj) return null;
  return (
    obj.item_icon_url ||
    obj.image_urls?.icon ||
    obj.image_url ||
    obj.icon_url ||
    obj.img ||
    obj.image ||
    (obj.item && (obj.item.item_icon_url || obj.item.image_urls?.icon)) ||
    null
  );
};

const getIngredientId = (ing) => {
  if (!ing) return null;
  return ing.item_ankama_id || ing.ankama_id || ing.id || ing.item_id;
};

export default function FavoritesTable({ onNavigate }) {
  const [favorites, setFavorites] = useState([]);
  const [equipmentPrices, setEquipmentPrices] = useState({});
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    // 1. Charger les favoris
    const savedFavs = localStorage.getItem('dofus_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (err) {
        console.error('Erreur favoris :', err);
      }
    }

    // 2. Charger les prix HDV des équipements
    const savedEqPrices = localStorage.getItem('dofus_equipment_prices');
    if (savedEqPrices) {
      try {
        setEquipmentPrices(JSON.parse(savedEqPrices));
      } catch (err) {
        console.error('Erreur prix équipements :', err);
      }
    }

    // 3. Charger les prix des ressources (ingrédients)
    const savedIngPrices = localStorage.getItem('dofus_ingredient_prices');
    if (savedIngPrices) {
      try {
        const parsed = JSON.parse(savedIngPrices);
        const pricesMap = {};
        Object.keys(parsed).forEach((key) => {
          pricesMap[key] = parsed[key]?.price || 0;
        });
        setIngredientPrices(pricesMap);
      } catch (err) {
        console.error('Erreur prix ingrédients :', err);
      }
    }
  }, []);

  // Mettre à jour le prix HDV d'un équipement directement depuis les favoris
  const handlePriceChange = (itemId, val) => {
    const num = val === '' ? 0 : Number(val);
    const updated = { ...equipmentPrices, [itemId]: num };
    setEquipmentPrices(updated);
    localStorage.setItem('dofus_equipment_prices', JSON.stringify(updated));
  };

  // Copier le nom de l'équipement dans le presse-papier pour la recherche en jeu
  const copyToClipboard = (name, id) => {
    navigator.clipboard.writeText(name);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const removeFavorite = (itemId) => {
    const updated = favorites.filter((item) => (item.ankama_id || item.id) !== itemId);
    setFavorites(updated);
    localStorage.setItem('dofus_favorites', JSON.stringify(updated));
  };

  // Calculer le coût du craft d'un équipement
  const calculateCraftCost = (item) => {
    const recipe = Array.isArray(item.recipe)
      ? item.recipe
      : Array.isArray(item.recipe?.ingredients)
        ? item.recipe.ingredients
        : Array.isArray(item.ingredients)
          ? item.ingredients
          : [];

    return recipe.reduce((acc, ing) => {
      const id = getIngredientId(ing);
      const unitP = ingredientPrices[id] || 0;
      const qty = ing.quantity || 1;
      return acc + unitP * qty;
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <NavigationHeader
          title="💸 Suivi des Ventes & Rentabilité"
          currentView="favoris"
          onNavigate={onNavigate}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
            ▸ ÉQUIPEMENTS SUIVIS
          </div>

          {favorites.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-lg">
              Aucun équipement favori. Ajoutez-en depuis l'onglet Calcul.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3 font-semibold">Équipement</th>
                    <th className="py-2 px-3 font-semibold text-center w-20">Niveau</th>
                    <th className="py-2 px-3 font-semibold text-right w-36">Prix HDV</th>
                    <th className="py-2 px-3 font-semibold text-right w-36">Coût Craft</th>
                    <th className="py-2 px-3 font-semibold text-right w-40">Bénéfice Net (2%)</th>
                    <th className="py-2 px-3 text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {favorites.map((item, idx) => {
                    const itemId = item.ankama_id || item.id || idx;
                    const itemName = getName(item);
                    const itemIcon = getItemIcon(item);

                    const priceHDV = equipmentPrices[itemId] || 0;
                    const craftCost = calculateCraftCost(item);
                    const tax2 = Math.round(priceHDV * 0.02);
                    const benefit = priceHDV - craftCost - tax2;

                    return (
                      <tr key={itemId} className="hover:bg-slate-800/40 transition">
                        {/* Nom + Copier */}
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 p-0.5">
                              {itemIcon ? (
                                <img src={itemIcon} alt={itemName} className="w-5 h-5 object-contain" />
                              ) : (
                                <span className="text-[10px]">🛡️</span>
                              )}
                            </div>
                            <span className="font-bold">{itemName}</span>
                            <button
                              onClick={() => copyToClipboard(itemName, itemId)}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded transition cursor-pointer"
                              title="Copier le nom pour chercher en jeu"
                            >
                              {copiedId === itemId ? '✓ Copié' : '📋 Copier'}
                            </button>
                          </div>
                        </td>

                        {/* Niveau */}
                        <td className="py-2.5 px-3 text-center text-amber-500 font-bold">
                          {item.level || '?'}
                        </td>

                        {/* Prix HDV modifiable */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={equipmentPrices[itemId] || ''}
                              onChange={(e) => handlePriceChange(itemId, e.target.value)}
                              placeholder="0"
                              className="w-28 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded px-2 py-1 text-right text-xs text-amber-400 focus:outline-none font-bold"
                            />
                            <span className="text-slate-500 text-[10px]">k</span>
                          </div>
                        </td>

                        {/* Coût Craft calculé automatiquement */}
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {craftCost.toLocaleString()} k
                        </td>

                        {/* Bénéfice avec code couleur */}
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold ${
                              benefit > 0
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : benefit < 0
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {benefit > 0 ? '+' : ''}
                            {benefit.toLocaleString()} k
                          </span>
                        </td>

                        {/* Supprimer */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => removeFavorite(itemId)}
                            className="text-rose-400 hover:text-rose-300 transition text-xs cursor-pointer"
                            title="Retirer des favoris"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}