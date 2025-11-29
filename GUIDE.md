# Guide d'Utilisation - Learning Platform

## Structure de la Plateforme

```
learning-platform/
├── index.html              # Page principale
├── styles.css             # Styles (mode clair/sombre)
├── app.js                 # Logique de l'application
├── courses.json           # Configuration des formations
└── courses/               # Contenu des formations
    ├── python-bootcamp.json
    ├── sql-bootcamp.json
    ├── powerbi-bootcamp.json
    └── python-projects.json
```

## Ajouter une Nouvelle Formation

### Méthode 1 : À partir d'un Jupyter Notebook

1. Préparez votre Jupyter Notebook (.ipynb)
2. Uploadez-le moi
3. Je le convertis en JSON
4. Placez le fichier JSON dans le dossier `courses/`
5. Mettez à jour `courses.json`

### Méthode 2 : Créer le JSON Manuellement

Structure du fichier JSON pour une formation :

```json
{
  "1": {
    "title": "Semaine 1 : Titre",
    "cells": [
      {
        "cell_type": "markdown",
        "source": "# Votre contenu Markdown ici"
      },
      {
        "cell_type": "code",
        "source": "# Votre code Python/SQL ici\nprint('Hello')",
        "outputs": [
          {
            "output_type": "stream",
            "text": "Hello\n"
          }
        ]
      }
    ]
  },
  "2": {
    "title": "Semaine 2 : Titre",
    "cells": [...]
  }
}
```

### Étape 1 : Créer le fichier JSON

Créez un fichier dans `courses/` avec le contenu de votre formation.

Exemple : `courses/ma-nouvelle-formation.json`

### Étape 2 : Mettre à jour courses.json

Ajoutez votre formation dans le fichier `courses.json` :

```json
{
  "platform": {
    "name": "Learning Platform",
    "tagline": "Formations professionnelles en développement et data"
  },
  "courses": [
    {
      "id": "ma-nouvelle-formation",
      "title": "Ma Nouvelle Formation",
      "description": "Description de la formation",
      "duration": "4 semaines",
      "level": "Débutant",
      "icon": "code",
      "color": "#3776AB",
      "weeks": 4,
      "totalSections": 100,
      "status": "active",
      "contentFile": "courses/ma-nouvelle-formation.json"
    }
  ]
}
```

**Paramètres :**
- `id` : Identifiant unique (sans espaces)
- `title` : Titre affiché
- `description` : Description courte
- `duration` : Durée estimée
- `level` : Débutant / Intermédiaire / Avancé
- `color` : Couleur de la carte (code hexa)
- `status` : "active" (accessible) ou "coming-soon" (bientôt)
- `contentFile` : Chemin vers le fichier JSON

### Étape 3 : Déployer

1. Téléversez les fichiers mis à jour sur GitHub
2. La nouvelle formation apparaît automatiquement

## Modifier une Formation Existante

1. Ouvrez le fichier JSON de la formation dans `courses/`
2. Modifiez le contenu
3. Sauvegardez
4. Déployez

## Activer/Désactiver une Formation

Dans `courses.json`, changez le `status` :
- `"status": "active"` → Formation accessible
- `"status": "coming-soon"` → Formation grisée

## Exemples de Contenu

### Cellule Markdown
```json
{
  "cell_type": "markdown",
  "source": [
    "# Titre Principal\n",
    "\n",
    "Votre contenu texte ici.\n",
    "\n",
    "## Sous-titre\n",
    "\n",
    "- Point 1\n",
    "- Point 2\n"
  ]
}
```

### Cellule Code Python
```json
{
  "cell_type": "code",
  "source": [
    "# Exemple de code\n",
    "x = 10\n",
    "y = 20\n",
    "print(x + y)\n"
  ],
  "outputs": [
    {
      "output_type": "stream",
      "text": ["30\n"]
    }
  ]
}
```

### Cellule Code SQL
```json
{
  "cell_type": "code",
  "source": [
    "-- Exemple SQL\n",
    "SELECT * FROM users\n",
    "WHERE age > 18;\n"
  ]
}
```

## Personnalisation

### Changer le Nom de la Plateforme

Dans `courses.json` :
```json
"platform": {
  "name": "Votre Nom",
  "tagline": "Votre slogan"
}
```

### Modifier les Couleurs

Dans `courses.json`, pour chaque formation :
```json
"color": "#3776AB"
```

Couleurs suggérées :
- Python : `#3776AB`
- SQL : `#F29111`
- Power BI : `#F2C811`
- JavaScript : `#F7DF1E`
- Data Science : `#4B8BBE`

## Déploiement

### Sur GitHub Pages

1. Créez un dépôt GitHub
2. Téléversez tous les fichiers
3. Activez GitHub Pages
4. URL : `https://votre-nom.github.io/repo-name/`

### Fichiers à téléverser

```
✓ index.html
✓ styles.css
✓ app.js
✓ courses.json
✓ courses/
  ✓ python-bootcamp.json
  ✓ sql-bootcamp.json
  ✓ powerbi-bootcamp.json
  ✓ python-projects.json
```

## FAQ

**Q : Comment mettre à jour le contenu Python ?**
R : Modifiez votre notebook .ipynb, convertissez-le en JSON, remplacez `courses/python-bootcamp.json`

**Q : Peut-on avoir plus de 4 formations ?**
R : Oui, ajoutez autant de formations que vous voulez dans `courses.json`

**Q : Comment changer l'ordre des formations ?**
R : Réorganisez l'ordre dans le tableau `courses` de `courses.json`

**Q : Les apprenants peuvent-ils exécuter le code ?**
R : Non, le code est en lecture seule. C'est par design pour la sécurité.

**Q : Comment ajouter des images ?**
R : Dans le Markdown, utilisez : `![Description](url-de-l-image)`

**Q : Peut-on avoir des quiz ?**
R : Pas encore implémenté. Vous pouvez ajouter des questions dans le Markdown.

## Support

Pour toute question, consultez ce guide ou modifiez directement le code source.
