#!/bin/bash

# Script d'initialisation Git et déploiement
# Usage: ./init-git.sh VOTRE-USERNAME VOTRE-REPO

echo "=========================================="
echo "  Learning Platform - Git Setup"
echo "=========================================="
echo ""

# Vérifier les arguments
if [ $# -ne 2 ]; then
    echo "Usage: $0 <github-username> <repo-name>"
    echo "Example: $0 johndoe learning-platform"
    exit 1
fi

USERNAME=$1
REPO=$2

echo "Configuration:"
echo "  GitHub Username: $USERNAME"
echo "  Repository Name: $REPO"
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Installez-le d'abord."
    exit 1
fi

echo "✓ Git est installé"
echo ""

# Initialiser Git si nécessaire
if [ ! -d .git ]; then
    echo "Initialisation du dépôt Git..."
    git init
    echo "✓ Dépôt Git initialisé"
else
    echo "✓ Dépôt Git déjà initialisé"
fi

echo ""

# Configurer Git (si nécessaire)
if [ -z "$(git config user.name)" ]; then
    echo "Configuration de Git..."
    read -p "Votre nom: " git_name
    read -p "Votre email: " git_email
    git config user.name "$git_name"
    git config user.email "$git_email"
    echo "✓ Git configuré"
fi

echo ""

# Créer le fichier .gitignore s'il n'existe pas
if [ ! -f .gitignore ]; then
    echo "⚠️  Fichier .gitignore manquant. Créez-le d'abord."
fi

echo "Ajout des fichiers..."
git add .

echo ""
echo "État du dépôt:"
git status

echo ""
read -p "Voulez-vous continuer avec le commit ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    git commit -m "Initial commit: Learning Platform with CI/CD"
    echo "✓ Commit créé"
    
    echo ""
    echo "Configuration du remote..."
    git branch -M main
    
    # Vérifier si le remote existe déjà
    if git remote | grep -q "origin"; then
        echo "✓ Remote 'origin' déjà configuré"
        git remote set-url origin "https://github.com/$USERNAME/$REPO.git"
    else
        git remote add origin "https://github.com/$USERNAME/$REPO.git"
        echo "✓ Remote 'origin' ajouté"
    fi
    
    echo ""
    echo "=========================================="
    echo "  Prochaines étapes:"
    echo "=========================================="
    echo ""
    echo "1. Créez le dépôt sur GitHub:"
    echo "   https://github.com/new"
    echo "   Nom: $REPO"
    echo "   Visibilité: Public"
    echo "   ⚠️  NE PAS initialiser avec README, .gitignore ou license"
    echo ""
    echo "2. Une fois le dépôt créé, exécutez:"
    echo "   git push -u origin main"
    echo ""
    echo "3. Activez GitHub Pages:"
    echo "   Settings > Pages > Source: GitHub Actions"
    echo ""
    echo "4. Votre site sera disponible à:"
    echo "   https://$USERNAME.github.io/$REPO/"
    echo ""
    echo "=========================================="
    
else
    echo "❌ Commit annulé"
    exit 1
fi
