import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, 'public', 'stats');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const downloadImage = async (url, filename) => {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(outputDir, filename);
    
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Téléchargé : ${filename}`);
    return true;
  } catch (err) {
    console.error(`❌ Échec pour ${filename}:`, err.message);
    return false;
  }
};

async function main() {
  console.log('🚀 Récupération de la liste des équipements sur DofusDude...');
  
  try {
    const res = await fetch('https://api.dofusdu.de/dofus3/v1/fr/items/equipment/all');
    const data = await res.json();

    // S'assure de récupérer le tableau, que ce soit un tableau direct ou dans data.items
    const items = Array.isArray(data) ? data : data.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      console.error('❌ Impossible de trouver la liste des objets dans la réponse API.');
      return;
    }

    const downloadedTypes = new Set();

    for (const item of items) {
      if (!item.effects) continue;

      for (const eff of item.effects) {
        const typeId = eff.type?.id;
        if (typeId && !downloadedTypes.has(typeId)) {
          downloadedTypes.add(typeId);
          
          const iconUrl = `https://api.dofusdu.de/dofus3/v1/fr/items/equipment/effects/${typeId}/icon`;
          await downloadImage(iconUrl, `${typeId}.png`);
        }
      }
    }

    console.log('\n🎉 Téléchargement terminé ! Les icônes sont enregistrées dans public/stats/');
  } catch (err) {
    console.error('Erreur lors de la récupération des données :', err);
  }
}

main();