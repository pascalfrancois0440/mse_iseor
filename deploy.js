#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Script de déploiement MSE Diagnostic');
console.log('=====================================');

// Vérifier si Git est initialisé
if (!fs.existsSync('.git')) {
  console.log('📁 Initialisation de Git...');
  execSync('git init', { stdio: 'inherit' });
}

// Vérifier si .gitignore existe
if (!fs.existsSync('.gitignore')) {
  console.log('⚠️  Fichier .gitignore manquant !');
  process.exit(1);
}

// Ajouter tous les fichiers
console.log('📦 Ajout des fichiers...');
execSync('git add .', { stdio: 'inherit' });

// Commit initial
try {
  execSync('git commit -m "Initial commit - MSE Diagnostic Application"', { stdio: 'inherit' });
  console.log('✅ Commit initial créé');
} catch (error) {
  console.log('ℹ️  Aucun changement à commiter ou commit déjà effectué');
}

console.log('\n🎯 Prochaines étapes :');
console.log('1. Créer un dépôt sur GitHub.com');
console.log('2. Exécuter : git remote add origin https://github.com/USERNAME/REPO.git');
console.log('3. Exécuter : git branch -M main');
console.log('4. Exécuter : git push -u origin main');
console.log('\n📖 Voir DEPLOYMENT.md pour les détails complets');
