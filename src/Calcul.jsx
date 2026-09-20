import React, { useState, useEffect } from 'react';
import NavigationHeader from './NavigationHeader';

const getName = (obj) => {
  if (!obj) return 'Inconnu';
  if (typeof obj === 'string') return obj;

  const raw =
    obj.item_name ||
    obj.name ||
    obj.title ||
    (obj.item && (obj.item.name || obj.item.item_name));

  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null) {
    return raw.fr || raw.en || raw.de || raw.es || raw.name || 'Inconnu';
  }

  if (obj.fr || obj.en) return obj.fr || obj.en;
  return 'Inconnu';
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

export default function Calcul({ onNavigate }) {
  const [equipments, setEquipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Prix unitaires des ingrédients
  const [ingredientPrices, setIngredientPrices] = useState({});

  // Paramètres de calcul
  const [desiredQuantity, setDesiredQuantity] = useState(1);
  const [marketPrice, setMarketPrice] = useState(0);
  const [fmCost, setFmCost] = useState(0);

  useEffect(() => {
    // 1. Favoris
    const savedFavs = localStorage.getItem('dofus_favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (err) {
        console.error('Erreur favoris :', err);
      }
    }

    // 2. Prix ingrédients
    const savedPrices = localStorage.getItem('dofus_ingredient_prices');
    if (savedPrices) {
      try {
        const parsed = JSON.parse(savedPrices);
        const pricesMap = {};
        Object.keys(parsed).forEach((key) => {
          pricesMap[key] = parsed[key]?.price || 0;
        });
        setIngredientPrices(pricesMap);
      } catch (err) {
        console.error('Erreur prix ingrédients :', err);
      }
    }

    // 3. Charger équipements
    fetch('https://api.dofusdu.de/dofus3/v1/fr/items/equipment/all')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.items || [];
        setEquipments(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erreur chargement équipements :', err);
        setLoading(false);
      });
  }, []);

  // Synchronisation du prix HDV lors du changement de sélection
  useEffect(() => {
    if (!selectedItem) {
      setMarketPrice(0);
      return;
    }

    const itemId = selectedItem.ankama_id || selectedItem.id;
    const savedEqPrices = JSON.parse(localStorage.getItem('dofus_equipment_prices') || '{}');
    if (savedEqPrices[itemId] !== undefined) {
      setMarketPrice(savedEqPrices[itemId]);
    } else {
      setMarketPrice(0);
    }
  }, [selectedItem]);

  // Enregistrement du prix HDV
  const handleMarketPriceChange = (val) => {
    const num = val === '' ? 0 : Number(val);
    setMarketPrice(num);

    if (selectedItem) {
      const itemId = selectedItem.ankama_id || selectedItem.id;
      const savedEqPrices = JSON.parse(localStorage.getItem('dofus_equipment_prices') || '{}');
      savedEqPrices[itemId] = num;
      localStorage.setItem('dofus_equipment_prices', JSON.stringify(savedEqPrices));
    }
  };

  const toggleFavorite = (item) => {
    if (!item) return;
    const itemId = item.ankama_id || item.id;
    const exists = favorites.some((fav) => (fav.ankama_id || fav.id) === itemId);

    let updated;
    if (exists) {
      updated = favorites.filter((fav) => (fav.ankama_id || fav.id) !== itemId);
    } else {
      updated = [...favorites, item];
    }

    setFavorites(updated);
    localStorage.setItem('dofus_favorites', JSON.stringify(updated));
  };

  const filteredEquipments = equipments.filter((item) => {
    const name = getName(item);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFmCost(0);
    setDesiredQuantity(1);
  };

  // Récupération de la liste des ingrédients de la recette
  const recipe = selectedItem
    ? Array.isArray(selectedItem.recipe)
      ? selectedItem.recipe
      : Array.isArray(selectedItem.recipe?.ingredients)
        ? selectedItem.recipe.ingredients
        : Array.isArray(selectedItem.ingredients)
          ? selectedItem.ingredients
          : []
    : [];

  // Calculs financiers
  const costX1 = recipe.reduce((acc, ing) => {
    const id = getIngredientId(ing);
    const unitP = ingredientPrices[id] || 0;
    const qty = ing.quantity || 1;
    return acc + unitP * qty;
  }, 0);

  const targetQty = desiredQuantity > 0 ? desiredQuantity : 1;
  const costXN = costX1 * targetQty;

  const reventeX1 = marketPrice;
  const margeBruteX1 = reventeX1 - costX1;
  const taxe2PercentX1 = Math.round(reventeX1 * 0.02);
  const margeNetteX1 = margeBruteX1 - fmCost - taxe2PercentX1;
  const tauxMargeX1 = costX1 > 0 ? ((margeNetteX1 / costX1) * 100).toFixed(0) : 0;

  const reventeXN = reventeX1 * targetQty;
  const margeBruteXN = margeBruteX1 * targetQty;
  const fmCostXN = fmCost * targetQty;
  const taxe2PercentXN = taxe2PercentX1 * targetQty;
  const margeNetteXN = margeNetteX1 * targetQty;
  const tauxMargeXN = costXN > 0 ? ((margeNetteXN / costXN) * 100).toFixed(0) : 0;

  const isCurrentFav = selectedItem
    ? favorites.some((fav) => (fav.ankama_id || fav.id) === (selectedItem.ankama_id || selectedItem.id))
    : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* BARRE DE NAVIGATION */}
        <NavigationHeader
          title="🛡️ Calculateur de Rentabilité"
          currentView="equipments"
          onNavigate={onNavigate}
        />

        {/* RECHERCHE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
            🔍 Rechercher un équipement
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tapez le nom d'un équipement..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none transition"
          />

          {searchQuery.trim() !== '' && (
            <div className="max-h-56 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950 mt-2">
              {filteredEquipments.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">Aucun équipement trouvé.</div>
              ) : (
                filteredEquipments.slice(0, 15).map((item, idx) => {
                  const itemId = item.ankama_id || item.id || idx;
                  const itemName = getName(item);
                  const itemIcon = getItemIcon(item);

                  return (
                    <button
                      key={itemId}
                      onClick={() => {
                        handleSelectItem(item);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-slate-800/60 transition flex items-center justify-between gap-3 text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 p-0.5">
                          {itemIcon ? (
                            <img src={itemIcon} alt={itemName} className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="text-[10px]">🛡️</span>
                          )}
                        </div>
                        <span className="font-semibold text-slate-200">{itemName}</span>
                      </div>
                      <span className="text-amber-500 font-mono">Niv. {item.level || '?'}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-amber-400 font-semibold animate-pulse">
            Chargement de la base d'équipements...
          </div>
        )}

        {/* ÉQUIPEMENT SÉLECTIONNÉ & RECETTE */}
        {selectedItem && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            
            {/* ENTÊTE DE L'ÉQUIPEMENT */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0">
                  {getItemIcon(selectedItem) ? (
                    <img src={getItemIcon(selectedItem)} alt={getName(selectedItem)} className="w-9 h-9 object-contain" />
                  ) : (
                    <span className="text-xl">🛡️</span>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{getName(selectedItem)}</h2>
                  <p className="text-xs text-amber-500 font-mono">Niveau {selectedItem.level || '?'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-slate-400 font-medium">Prix HDV :</span>
                  <input
                    type="number"
                    value={marketPrice || ''}
                    onChange={(e) => handleMarketPriceChange(e.target.value)}
                    placeholder="0"
                    className="w-24 bg-transparent text-right text-xs text-amber-400 font-bold focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">k</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                  <span className="text-xs text-slate-400 font-medium">Quantité :</span>
                  <input
                    type="number"
                    min="1"
                    value={desiredQuantity}
                    onChange={(e) => setDesiredQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-transparent text-center text-xs text-amber-400 font-bold focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => toggleFavorite(selectedItem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isCurrentFav
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {isCurrentFav ? '★ En favoris' : '☆ Ajouter aux favoris'}
                </button>
              </div>
            </div>

            {/* TABLEAU DES RECETTES (DÉTAILLÉ) */}
            <div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                ▸ RECETTE D'OBTENTION
              </div>

              {recipe.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-800 rounded-lg">
                  Aucune recette disponible pour cet équipement.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                        <th className="py-2 px-3 font-semibold">Ingrédient</th>
                        <th className="py-2 px-3 font-semibold text-center w-24">Quantité (x1)</th>
                        <th className="py-2 px-3 font-semibold text-center w-28">Total (x{targetQty})</th>
                        <th className="py-2 px-3 font-semibold text-right w-36">Prix unitaire</th>
                        <th className="py-2 px-3 font-semibold text-right w-36">Coût Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {recipe.map((ing, idx) => {
                        const ingId = getIngredientId(ing);
                        const ingName = getName(ing);
                        const ingIcon = getItemIcon(ing);
                        const unitQty = ing.quantity || 1;
                        const totalQty = unitQty * targetQty;
                        const unitPrice = ingredientPrices[ingId] || 0;
                        const totalPrice = unitPrice * totalQty;

                        return (
                          <tr key={ingId || idx} className="hover:bg-slate-800/40 transition">
                            <td className="py-2 px-3 font-sans text-slate-200">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 p-0.5">
                                  {ingIcon ? (
                                    <img src={ingIcon} alt={ingName} className="w-4 h-4 object-contain" />
                                  ) : (
                                    <span className="text-[10px]">🪵</span>
                                  )}
                                </div>
                                <span>{ingName}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-center text-slate-400">x{unitQty}</td>
                            <td className="py-2 px-3 text-center text-amber-400 font-bold">x{totalQty}</td>
                            <td className="py-2 px-3 text-right text-slate-400">
                              {unitPrice > 0 ? `${unitPrice.toLocaleString()} k` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-200 font-bold">
                              {totalPrice > 0 ? `${totalPrice.toLocaleString()} k` : '0 k'}
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
        )}

        {/* BILAN FINANCIER COMPLET */}
        {selectedItem && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              ▸ BILAN FINANCIER & RENTABILITÉ
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2 px-3 font-semibold">Indicateur</th>
                    <th className="py-2 px-3 font-semibold text-right w-44">Pour 1 unité (x1)</th>
                    <th className="py-2 px-3 font-semibold text-right w-44 text-amber-400 bg-amber-950/10">
                      Pour {targetQty} unité{targetQty > 1 ? 's' : ''} (x{targetQty})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  
                  {/* COÛT CRAFT */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans text-slate-300">Coût de Craft Total</td>
                    <td className="py-2.5 px-3 text-right text-slate-200 font-bold">{costX1.toLocaleString()} k</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400 bg-amber-950/10">{costXN.toLocaleString()} k</td>
                  </tr>

                  {/* REVENTE */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-200">Revente Total (HDV)</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-100">{reventeX1.toLocaleString()} k</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400 bg-amber-950/10">{reventeXN.toLocaleString()} k</td>
                  </tr>

                  {/* MARGE BRUTE */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans text-slate-400 italic">Marge Brute</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{margeBruteX1.toLocaleString()} k</td>
                    <td className="py-2.5 px-3 text-right text-slate-300 bg-amber-950/10">{margeBruteXN.toLocaleString()} k</td>
                  </tr>

                  {/* FM */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans text-slate-400">Coût Forgemagie (FM)</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={fmCost || ''}
                        onChange={(e) => setFmCost(Number(e.target.value))}
                        placeholder="0"
                        className="w-28 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded px-2 py-0.5 text-right text-xs text-amber-400 focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 bg-amber-950/10 font-bold">
                      {fmCostXN.toLocaleString()} k
                    </td>
                  </tr>

                  {/* TAXE 2% */}
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-sans text-slate-400">Taxe HDV (2%)</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{taxe2PercentX1.toLocaleString()} k</td>
                    <td className="py-2.5 px-3 text-right text-slate-400 bg-amber-950/10">{taxe2PercentXN.toLocaleString()} k</td>
                  </tr>

                  {/* BÉNÉFICE NET / PERTE (AVEC CODE COULEUR) */}
                  <tr className="bg-slate-950 font-bold border-t border-slate-800">
                    <td className="py-3 px-3 font-sans text-slate-100">Bénéfice Net (Marge Nette)</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded ${margeNetteX1 >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {margeNetteX1 >= 0 ? '+' : ''}{margeNetteX1.toLocaleString()} k
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right bg-amber-950/20">
                      <span className={`inline-block px-2 py-0.5 rounded ${margeNetteXN >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {margeNetteXN >= 0 ? '+' : ''}{margeNetteXN.toLocaleString()} k
                      </span>
                    </td>
                  </tr>

                  {/* TAUX DE MARGE */}
                  <tr className="bg-slate-950/80 font-bold">
                    <td className="py-3 px-3 font-sans text-slate-100">Taux de Marge</td>
                    <td className={`py-3 px-3 text-right ${margeNetteX1 >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tauxMargeX1}%
                    </td>
                    <td className={`py-3 px-3 text-right bg-amber-950/20 ${margeNetteXN >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tauxMargeXN}%
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}