import React, { useState, useEffect } from 'react';
import NavigationHeader from './NavigationHeader';

// Formate la date de mise à jour au format JJ/MM à HH:mm
const formatDate = (isoString) => {
  if (!isoString) return 'Jamais';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Jamais';
  }
};

// Extraction sécurisée du nom
const getName = (obj) => {
  if (!obj) return 'Ressource inconnue';
  if (typeof obj === 'string') return obj;

  const raw =
    obj.item_name ||
    obj.name ||
    obj.title ||
    (obj.item && (obj.item.name || obj.item.item_name));

  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object' && raw !== null) {
    return raw.fr || raw.en || raw.de || raw.es || raw.name || 'Ressource inconnue';
  }

  if (obj.fr || obj.en) return obj.fr || obj.en;
  return 'Ressource inconnue';
};

// Extraction sécurisée de l'icône
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

// Extraction de l'ID d'un ingrédient
const getIngredientId = (ing) => {
  if (!ing) return null;
  return ing.item_ankama_id || ing.ankama_id || ing.id || ing.item_id;
};

export default function IngredientsManager({ onNavigate }) {
  const [ingredientsList, setIngredientsList] = useState([]);
  const [ingredientData, setIngredientData] = useState({});
  const [fetchedResources, setFetchedResources] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Récupération des prix enregistrés
    const savedPrices = localStorage.getItem('dofus_ingredient_prices');
    if (savedPrices) {
      try {
        setIngredientData(JSON.parse(savedPrices));
      } catch (err) {
        console.error('Erreur lecture dofus_ingredient_prices:', err);
      }
    }

    // 2. Extraction des ressources uniques à partir des favoris
    const savedFavs = localStorage.getItem('dofus_favorites');
    if (savedFavs) {
      try {
        const favs = JSON.parse(savedFavs);
        const uniqueIngredientsMap = new Map();

        favs.forEach((item) => {
          if (!item) return;

          const recipe = Array.isArray(item.recipe)
            ? item.recipe
            : Array.isArray(item.recipe?.ingredients)
              ? item.recipe.ingredients
              : Array.isArray(item.ingredients)
                ? item.ingredients
                : [];

          recipe.forEach((ing) => {
            if (!ing) return;
            const ingId = getIngredientId(ing);
            if (ingId && !uniqueIngredientsMap.has(ingId)) {
              uniqueIngredientsMap.set(ingId, ing);
            }
          });
        });

        const list = Array.from(uniqueIngredientsMap.values());
        setIngredientsList(list);

        // Si certaines ressources n'ont pas de nom/icône complets, charger l'API ressources
        const hasMissingInfo = list.some((ing) => getName(ing) === 'Ressource inconnue' || !getItemIcon(ing));

        if (hasMissingInfo) {
          fetch('https://api.dofusdu.de/dofus3/v1/fr/items/resources/all')
            .then((res) => res.json())
            .then((data) => {
              const resList = Array.isArray(data) ? data : data.items || [];
              const map = {};
              resList.forEach((resItem) => {
                if (resItem.ankama_id) map[resItem.ankama_id] = resItem;
              });
              setFetchedResources(map);
              setLoading(false);
            })
            .catch((err) => {
              console.error('Erreur chargement ressources API:', err);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }

      } catch (err) {
        console.error('Erreur lecture dofus_favorites:', err);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Mise à jour du prix d'un ingrédient + stockage de la date
  const handlePriceChange = (ingId, newPrice) => {
    const val = newPrice === '' ? 0 : Number(newPrice);
    const updated = {
      ...ingredientData,
      [ingId]: {
        price: val,
        updatedAt: new Date().toISOString()
      }
    };

    setIngredientData(updated);
    localStorage.setItem('dofus_ingredient_prices', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Passage à max-w-5xl pour correspondre exactement au composant Favoris */}
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* BARRE DE NAVIGATION ET TITRE */}
        <NavigationHeader
          title="📦 Gestion des Prix des Ressources"
          subtitle="Les prix saisis ici sont automatiquement synchronisés sur la page Favoris."
          currentView="ingredients"
          onNavigate={onNavigate}
        />

        {/* CONTENU PRINCIPAL */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-amber-400 font-semibold animate-pulse">
            Chargement des ressources...
          </div>
        ) : ingredientsList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center text-slate-500 italic">
            Aucune ressource à afficher. Ajoutez d'abord des équipements à vos favoris.
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-2">
            <div className="divide-y divide-slate-800/80">
              {ingredientsList.map((ing, idx) => {
                if (!ing) return null;
                const ingId = getIngredientId(ing) || idx;
                const fallbackRes = fetchedResources[ingId] || {};

                const displayName = getName(ing) !== 'Ressource inconnue'
                  ? getName(ing)
                  : getName(fallbackRes);

                const ingIcon = getItemIcon(ing) || getItemIcon(fallbackRes);

                const savedInfo = ingredientData[ingId] || {};
                const currentPrice = savedInfo.price !== undefined && savedInfo.price !== 0 ? savedInfo.price : '';

                return (
                  <div
                    key={ingId}
                    className="flex items-center justify-between p-4 hover:bg-slate-800/40 transition gap-4"
                  >
                    {/* Icône + Nom + Date de MAJ */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                        {ingIcon ? (
                          <img
                            src={ingIcon}
                            alt={displayName}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-xs text-slate-600">📦</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 text-sm truncate">{displayName}</div>
                        <div className="text-[11px] text-slate-500">
                          Dernière MAJ : <span className="text-slate-400 font-mono">{formatDate(savedInfo.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Saisie du prix */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => handlePriceChange(ingId, e.target.value)}
                        placeholder="Prix unitaire"
                        className="w-36 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg px-3 py-1.5 text-right text-xs text-amber-400 font-mono font-bold focus:outline-none transition"
                      />
                      <span className="text-xs text-slate-500 font-bold">k</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}