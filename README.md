# Application de Diagnostic MSE - Méthodologie ISEOR

## Présentation

Application de terrain destinée aux consultants/Fellows MSE pour conduire des entretiens de diagnostic socio-économique selon la méthodologie ISEOR. L'objectif est d'identifier, classifier et valoriser les coûts cachés afin de sensibiliser les dirigeants et accompagner la transformation managériale.

## Fonctionnalités principales

- **Authentification sécurisée** avec gestion des rôles (Administrateur/Consultant)
- **Mode Libre** : saisie spontanée des dysfonctionnements
- **Mode Guidé** : navigation structurée par les 6 domaines ISEOR
- **Calculs automatiques** PRISM et valorisation des coûts cachés
- **Référentiel ISEOR** complet (domaines 101→608)
- **Exports** PDF, Excel, Slides
- **Fonctionnement offline** avec synchronisation

## Architecture technique

- **Frontend** : React.js + TailwindCSS + React Query
- **Backend** : Node.js + Express + Sequelize ORM
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Authentification** : JWT + bcrypt
- **Exports** : PDFKit (PDF) + XLSX (Excel)
- **Sécurité** : Helmet, CORS, Rate limiting

## Installation

```bash
# Installation des dépendances
npm run install-all

# Lancement en mode développement
npm run dev
```

## Structure du projet

```
├── client/          # Application React
├── server/          # API Node.js
├── docs/           # Documentation
└── exports/        # Templates d'export
```

## Critères de succès

✅ Diagnostic ≤ 1h30  
✅ Sécurité conforme aux bonnes pratiques  
✅ Export directement exploitable  
✅ Calculs ISEOR 100% conformes  

## Licence

MIT - MSE Team
