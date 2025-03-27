# ColocMBDS - Application de Colocation

Une application mobile et web pour faciliter la recherche de colocation pour les étudiants de MBDS.

## 🚀 Fonctionnalités

### 👤 Gestion des Utilisateurs
- Inscription et connexion sécurisées
- Profil utilisateur personnalisable
- Upload de photos de profil et de carte étudiante
- Gestion des favoris

### 🏠 Gestion des Annonces
- Publication d'annonces de colocation
- Recherche avancée avec filtres :
  - Prix du loyer
  - Type de logement (Studio, Appartement, Maison)
  - Surface
  - Localisation
- Système de favoris
- Photos multiples pour chaque annonce
- Géolocalisation des annonces sur la carte

### 🗺️ Fonctionnalités Cartographiques
- Affichage des annonces sur une carte interactive
- Filtrage des annonces par zone géographique
- Géocodage des adresses pour un positionnement précis
- Support multiplateforme (Web, iOS, Android)

### 🔍 Recherche et Filtres
- Recherche par mots-clés
- Filtres avancés :
  - Budget
  - Type de logement
  - Surface
  - Localisation
- Tri des résultats par pertinence

## 🛠️ Technologies Utilisées

- **Frontend** : React Native / Expo
- **Backend** : Firebase
  - Firestore pour la base de données
  - Firebase Authentication pour l'authentification
  - Firebase Storage pour le stockage des images
- **Maps** : 
  - react-native-maps pour mobile
  - Google Maps Embed API pour web
- **État** : Context API
- **Navigation** : React Navigation
- **UI Components** : React Native Paper

## 📱 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Expo CLI
- Compte Firebase
- Clé API Google Maps

## 🔧 Installation

1. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

2. Configurer les variables d'environnement :
Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```env
EXPO_PUBLIC_FIREBASE_API_KEY=votre_clé_api
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_domaine
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=votre_measurement_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=votre_clé_maps
EXPO_PUBLIC_API_URL=votre_url_api
```

## 🚀 Lancement de l'Application

### Pour le développement local (Web) :
```bash
npx expo start
```

### Pour tester sur un appareil mobile (iOS/Android) :
```bash
npx expo start --tunnel
```
Puis scanner le QR code avec :
- iOS : Appareil photo
- Android : Expo Go

### Pour construire l'application :
```bash
npx expo build:android  # Pour Android
npx expo build:ios      # Pour iOS
```

## 📱 Fonctionnalités par Plateforme

### Web
- Interface responsive
- Carte Google Maps embarquée
- Optimisé pour les navigateurs modernes

### Mobile (iOS/Android)
- Interface native
- Carte interactive avec marqueurs
- Accès à la caméra et à la galerie
- Notifications push
- Géolocalisation

## 🔒 Sécurité

- Authentification sécurisée via Firebase
- Validation des données côté serveur
- Protection contre les injections
- Gestion sécurisée des fichiers