# Learning Platform

Plateforme de formations professionnelles en développement et data science.

## Caractéristiques

- Interface moderne avec mode clair/sombre
- Multi-formations (Python, SQL, Power BI, Projets)
- Suivi de progression par formation
- Design responsive
- Aucun backend requis
- Hébergement gratuit

## Installation

### Prérequis
- Aucun prérequis technique
- Un navigateur web moderne

### Déploiement Local

1. Téléchargez tous les fichiers
2. Ouvrez `index.html` dans votre navigateur

### Déploiement GitHub Pages

1. Créez un dépôt GitHub
2. Téléversez tous les fichiers
3. Activez GitHub Pages dans Settings → Pages
4. Sélectionnez la branche `main` et le dossier `/root`
5. Votre site sera accessible à : `https://username.github.io/repo-name/`

## Structure

```
learning-platform/
├── index.html           # Application principale
├── styles.css          # Styles (clair/sombre)
├── app.js              # Logique JavaScript
├── courses.json        # Configuration des formations
├── courses/            # Contenu des formations
│   ├── python-bootcamp.json
│   ├── sql-bootcamp.json
│   ├── powerbi-bootcamp.json
│   └── python-projects.json
├── GUIDE.md            # Guide d'utilisation
└── README.md           # Ce fichier
```

## Ajouter une Nouvelle Formation

1. Créez un fichier JSON dans `courses/`
2. Ajoutez la configuration dans `courses.json`
3. Déployez

Voir `GUIDE.md` pour plus de détails.

## Technologies

- HTML5
- CSS3 (Variables CSS pour les thèmes)
- JavaScript Vanilla
- Marked.js (rendu Markdown)
- Highlight.js (coloration syntaxique)
- LocalStorage (sauvegarde progression)

## Licence

Libre d'utilisation pour des fins éducatives.
# formation
