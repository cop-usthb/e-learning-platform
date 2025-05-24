import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function executeProfileUpdate(trigger: string = 'manual') {
  try {
    // Log the trigger type
    console.log(`Profile update triggered by: ${trigger} at ${new Date().toISOString()}`);
    
    // Définir les chemins absolus des fichiers requis
    const projectRoot = process.cwd();
    const scriptPath = path.join(projectRoot, 'userprofil2.py');
    const dataPath = path.join(projectRoot, 'item_vectors_onehot.csv');
    
    // Vérifier si les fichiers existent
    if (!fs.existsSync(scriptPath)) {
      console.error(`Erreur: Le script Python n'existe pas à l'emplacement: ${scriptPath}`);
      return { 
        success: false, 
        message: `Le script Python n'a pas été trouvé: ${scriptPath}` 
      };
    }
    
    if (!fs.existsSync(dataPath)) {
      console.error(`Erreur: Le fichier de données n'existe pas à l'emplacement: ${dataPath}`);
      return { 
        success: false, 
        message: `Le fichier de données n'a pas été trouvé: ${dataPath}` 
      };
    }

    console.log(`Script Python trouvé: ${scriptPath}`);
    console.log(`Fichier de données trouvé: ${dataPath}`);
    console.log(`Exécution du script avec le déclencheur: ${trigger}...`);
    
    // Exécuter le script Python
    const { stdout, stderr } = await execAsync(`python "${scriptPath}" --trigger ${trigger}`);
    
    if (stderr && !stderr.includes('WARNING:')) {
      console.error(`Erreur lors de l'exécution du script: ${stderr}`);
      return { success: false, message: `Erreur d'exécution: ${stderr}` };
    }
    
    console.log(`Script exécuté avec succès. Réponse: ${stdout.trim()}`);
    return { 
      success: true, 
      message: `Profils mis à jour avec succès (${trigger})` 
    };
  } catch (error) {
    console.error(`Erreur système lors de l'exécution du script:`, error);
    
    // Essayer avec python3 si python échoue
    try {
      console.log("Tentative avec python3...");
      const scriptPath = path.join(process.cwd(), 'userprofil2.py');
      const { stdout, stderr } = await execAsync(`python3 "${scriptPath}" --trigger ${trigger}`);
      
      if (stderr && !stderr.includes('WARNING:')) {
        console.error(`Erreur lors de l'exécution avec python3: ${stderr}`);
        return { success: false, message: `Erreur avec python3: ${stderr}` };
      }
      
      console.log(`Script exécuté avec succès via python3. Réponse: ${stdout.trim()}`);
      return { success: true, message: `Profils mis à jour avec succès (${trigger})` };
    } catch (python3Error) {
      console.error("Échec avec python et python3:", python3Error);
      return { 
        success: false, 
        message: `Impossible d'exécuter le script avec python ou python3. Vérifiez votre installation Python.` 
      };
    }
  }
}