# Projet Web
Ce projet réalisé dans le cadre du cours de web du second semetres de mon master 1, est une application web full-stack en node js/angular qui gère la création, la consultation, la modification et la suppression d’assignments. L’application intègre un système d’authentification sécurisé et propose une interface qui permet à des administrateurs et des utilisateurs de consulter et d’interagir avec les assignments.
## Description du Projet
L’application se divise en deux parties complémentaires :

- **Back-End** : développé avec Node.js et Express,  offre des API REST pour gérer les utilisateurs et les assignments. La persistance des données est assurée par MongoDB (via Mongoose), et la sécurité  grâce à l’utilisation des tokens JWT pour l’authentification et de bcrypt pour le hachage des mots de passe.

- **Front-End** : réalisé avec Angular, propose l'interface utilisateur. Il se compose de plusieurs composants (comme la navigation latérale, le carousel pour l’affichage des assignments, les modales d’ajout/édition, etc.) et de services dédiés à la communication avec le back-end. L’interface s’adapte selon que l’utilisateur est connecté ou non et administrateur ou non et offre un formulaire de connexion et d’inscription.

Pour tester l’application, il est nécessaire de lancer le back-end et le front-end en parallèle. L’application utilise ma base de données MongoDB.
Pour tester le front-end, vous pouvez vous connecter avec les identifiants suivants : admin/admin pour un compte administrateur, ou vous pouver vous inscrire pour un compte utilisateur ou/et administrateur via le formulaire d'inscription.
Attention, quand vous ajoutez un assignment, il faut réactualiser la page pour le voir dans le carousel.

## Language et Technologies
**Back-End :**

- **Langage** : JavaScript (Node.js)

- **Framework** : Express.js

- **Base de données** : MongoDB (via Mongoose)

- Authentification : JSON Web Token (JWT), bcrypt


**Front-End :**

- **Framework** : Angular

- **Technologies Web** : HTML, CSS, TypeScript

- **Autre bibliothèques et composants**  : PrimeNG (pour le carousel notamment)


## Installation
Pré-requis
- Node.js et npm doivent être installés.

- MongoDB : une instance locale ou une connexion à un cluster MongoDB.
## Fonctionnalités

### Pré-requis

- **Node.js** et **npm**.

### Installation du Back-End

Après avoir cloné le dépôt, suivez les étapes suivantes pour installer le back-end :

1. **Installer les dépendances :**
   ```bash
   cd backend
   npm install
   ```

2. **Lancer le serveur :**
   ```bash
   npm run start
   ```

### Installation du Front-End

1. **Se placer dans le dossier front-end :**
   ```bash
   cd ../frontend-angular
   ```

2. **Installer les dépendances Angular :**
   ```bash
   npm install 
   ```

3. **Lancer le serveur de développement Angular :**
   ```bash
   ng serve --open
   ```
## Fonctionnalités

### Back-End
- **Gestion des Assignments :**
    - **Liste paginée :** L’endpoint `GET /api/assignments` permet de récupérer les assignments avec un système de pagination (paramètres `page` et `limit`).
    - **Consultation détaillée :** L’endpoint `GET /api/assignments/:id` permet de récupérer un assignment spécifique.
    - **Création :** Via `POST /api/assignments`, un nouvel assignment est créé avec un identifiant unique généré automatiquement.
    - **Modification :** L’endpoint `PUT /api/assignments/:id` permet de mettre à jour un assignment existant.
    - **Suppression :** L’endpoint `DELETE /api/assignments/:id` supprime l’assignment concerné.

- **Gestion des Utilisateurs et Authentification :**
    - **Inscription :** `POST /api/register` permet de créer un nouvel utilisateur en stockant un mot de passe haché avec bcrypt.
    - **Connexion :** `POST /api/login` vérifie les identifiants et retourne un token JWT.

### Front-End

- **Authentification et Navigation :**
    - **Page de connexion :** Le composant `login-component.component.html` affiche un formulaire de connexion. En cas d’erreur (mauvais identifiants), un message d’erreur s’affiche.
    - **Modale d’inscription :** Le composant `register-modal.component.html` permet aux nouveaux utilisateurs de créer un compte. Un champ « Admin » optionnel permet de créer un compte administrateur.

- **Gestion des Assignments :**
    - **Carousel d’affichage :** Le composant `carousel.component.html` affiche les assignments dans un carousel interactif. Chaque carte présente des informations (nom, date, département, nombre, statut) et inclut des boutons pour supprimer ou éditer l’assignement (fonctionnalité réservée aux administrateurs).
    - **Ajouter un Assignment :** `add-assignment-modal.component.html` présente un formulaire pour ajouter un nouvel assignment (fonctionnalité réservée aux administrateurs).
    - **Éditer un Assignment :** `edit-assignment-modal.component.html` permet de modifier les informations d’un assignment existant.
    - **Filtrage des Assignments :** Le composant `filter.component.html` offre un formulaire permettant de filtrer la liste des assignments selon différents critères (nom, date, nombre, département, statut).
    - **Navigation latérale :** Le composant `side-navigation.component.html` offre des boutons pour la déconnexion, l’ajout d’assignments (pour les administrateurs) et la gestion de la navigation (collapse/expand).

## Problèmes Rencontrés
je ne suis pas sur la dernière version d'anuglar, donc je n'ai pas pu utiliser la syntaxe que vous recommandez d'utiliser pour les for et les if.