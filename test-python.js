const { exec } = require('child_process');

console.log("Test de l'exécution Python...");
exec('python --version', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erreur: ${error.message}`);
    console.log("Essai avec python3...");
    
    exec('python3 --version', (error2, stdout2, stderr2) => {
      if (error2) {
        console.error(`Erreur: ${error2.message}`);
        console.log("Python n'est pas correctement configuré dans le PATH.");
      } else {
        console.log(`Python3 version: ${stdout2.trim()}`);
        console.log("Votre système utilise 'python3' au lieu de 'python'");
      }
    });
  } else {
    console.log(`Python version: ${stdout.trim()}`);
    console.log("Python est correctement configuré.");
  }
});