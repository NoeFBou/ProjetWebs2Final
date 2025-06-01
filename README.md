# Projet Web
Projet finale réalisé dans le cadre du cours de web du second semestre de mon master 1, est une application web full-stack en Node.js/Angular qui gère la création, la consultation, la modification et la suppression d’assignments. L’application intègre un système d’authentification sécurisé et propose une interface qui permet à des administrateurs et des utilisateurs de consulter et d’interagir avec les assignments.

## Description du Projet
L’application se divise en deux parties complémentaires :

- **Back-End** : développé avec Node.js et Express, offre des API REST pour gérer les utilisateurs et les assignments. La persistance des données est assurée par MongoDB (via Mongoose), et la sécurité grâce à l’utilisation des tokens JWT pour l’authentification et de bcrypt pour le hachage des mots de passe.

- **Front-End** : réalisé avec Angular, propose l'interface utilisateur. Il se compose de plusieurs composants (comme la navigation latérale, le carrousel pour l’affichage des assignments, les modales d’ajout/édition/détail, etc.) et de services dédiés à la communication avec le back-end. L’interface s’adapte selon que l’utilisateur est connecté ou non et administrateur ou non et offre un formulaire de connexion et d’inscription. Le chargement et l'affichage des assignments dans le carrousel sont optimisés grâce à la pagination et au filtrage côté serveur.


Pour tester l’application, il est nécessaire de lancer le back-end et le front-end en parallèle. L’application utilise ma base de données MongoDB.
Pour tester le front-end, vous pouvez vous connecter avec les identifiants suivants : admin/admin pour un compte administrateur, ou vous pouvez vous inscrire pour un compte utilisateur ou/et administrateur via le formulaire d'inscription.
Vous pouvez également tester de vous connecter avec un des identifiants suivants situé daans le fichier `backend/data/users.json` :
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

- **Autres bibliothèques et composants** : PrimeNG (pour le carrousel, les dialogues, le paginator, les modales, et de nombreux composants d'interface)


## Installation
Pré-requis
- Node.js et npm doivent être installés.

## Fonctionnalités

### Pré-requis

-   Node.js et npm  doivent être installés.
-   Une instance MongoDB accessible (locale ou cloud comme MongoDB Atlas). Configurez l'URI de connexion dans `backend/config/db.js` ou via une variable d'environnement `MONGO_URI`.

### Installation du Back-End

Après avoir cloné le dépôt, suivez les étapes suivantes pour installer le back-end :

1.  **Se placer dans le dossier backend :**
    ```bash
    cd backend
    ```
2.  **Installer les dépendances :**
    ```bash
    npm install
    ```
3.  **(Optionnel mais recommandé) Lancer le script de seeding pour peupler la base avec des données initiales :**
    Créez des utilisateurs et assignments d'exemple en exécutant le script (assurez-vous que le serveur MongoDB est accessible).
    ```bash
    node scripts/seedDB.js
    ```
4.  **Lancer le serveur :**
    ```bash
    npm run start
    ```
    Le serveur devrait démarrer sur `http://localhost:5000` (ou le port configuré).

### Installation du Front-End

1.  **Se placer dans le dossier front-end :**
    ```bash
    cd ../frontend-angular
    ```
2.  **Installer les dépendances Angular :**
    ```bash
    npm install
    ```
3.  **Lancer le serveur de développement Angular :**
    ```bash
    ng serve --open
    ```
    L'application devrait s'ouvrir sur `http://localhost:4200`.

## Fonctionnalités

### Back-End
- **Gestion des Assignments :**
    - **Liste paginée et filtrée :** L’endpoint `GET /api/assignments` permet de récupérer les assignments avec un système de pagination (paramètres `page` et `limit`) et de filtrage avancé basé sur de multiples critères (nom, dates, tags, notes, statut, matière, professeur, élève, mots-clés dans l'exercice).
    - **Consultation détaillée :** L’endpoint `GET /api/assignments/:id` permet de récupérer un assignment spécifique.
    - **Création :** Via `POST /api/assignments`, un nouvel assignment est créé avec un identifiant unique généré automatiquement.
    - **Modification :** L’endpoint `PUT /api/assignments/:id` permet de mettre à jour un assignment existant.
    - **Suppression :** L’endpoint `DELETE /api/assignments/:id` supprime l’assignment concerné.
    - **Remplissage filtre :** Endpoints pour récupérer les valeurs distinctes pour les filtres (ex: `GET /api/assignments/distinct/tags`, `GET /api/assignments/distinct/matieres`).

- **Gestion des Utilisateurs et Authentification :**
    - **Inscription :** `POST /api/register` permet de créer un nouvel utilisateur en stockant un mot de passe haché avec bcrypt.
    - **Connexion :** `POST /api/login` vérifie les identifiants et retourne un token JWT.
    - **Gestion des photos de profil :** Upload et récupération via `POST /api/users/:userId/profile-picture` et service statique.
    - **Récupération d'utilisateurs :** `GET /api/users` et `GET /api/users/:id` avec filtres optionnels.

- **Statistiques :**
    - Multiples endpoints sous `GET /api/stats` pour fournir des données agrégées sur les assignments (par statut, moyenne des notes, par professeur, par matière, tendances, distribution des notes) et une structure pour organigramme.


### Front-End

* **Pages Protégées :** Utilisation de `AuthGuard` pour protéger les routes nécessitant une authentification.
    * **Page de connexion (`login-component`) :** Formulaire de connexion avec gestion des erreurs.
    * **Modale d’inscription (`register-modal`) :** Processus en 3 étapes (informations, photo de profil optionnelle, récapitulatif) pour la création de compte.
    * **Navigation latérale (`side-navigation`) :** Affiche les informations de l'utilisateur connecté (avatar, nom, rôle), des liens de navigation avec icônes, et des actions contextuelles (ajout d'assignment, import, déconnexion). S'adapte en mode replié/déplié.
    * **Page Non Trouvée (`page-not-found`) :** S'affiche pour les routes inexistantes.

-   **Tableau de Bord (`home-page`) :**
    * Affiche diverses statistiques sur les assignments sous forme de graphiques (donut, barres, lignes, etc.) utilisant PrimeNG Charts (Chart.js).

-   **Gestion des Assignments :**
    * **Vue "Mes Assignments" (`assignment2`) :** Affiche les assignments de l'utilisateur connecté (en tant que professeur ou élève) dans un composant `p-table` paginé et triable. Chaque ligne permet de voir les détails, modifier ou supprimer l'assignment (selon les droits).
    * **Vue "Assignments (Carousel d’affichage et Paginator)" (`assignment1` via `carousel-component`) :** Affiche les assignments chargés depuis le serveur de manière paginée. Chaque carte présente des informations détaillées (nom, matière, date de rendu, note, statut, professeur et élève avec avatars, tags, visibilité, verrouillage).
    * **Consultation détaillée en dialogue (`assignment-detail-modal`) :** Un bouton "Voir les détails" sur chaque assignment ouvre une boîte de dialogue affichant toutes les informations de l'assignment sélectionné (accessible à tous).
    * **Ajout d'Assignment (`add-assignment-modal`) :** Formulaire complet utilisant divers composants PrimeNG pour ajouter un nouvel assignment (fonctionnalité réservée aux administrateurs/professeurs). Le professeur connecté est sélectionné par défaut.
    * **Édition d'Assignment (`edit-assignment-modal`) :** Permet de modifier les informations d’un assignment existant. L'accès est conditionné : un assignment verrouillé ne peut être modifié que par le professeur qui lui est assigné.
    * **Filtrage des Assignments (`filter-component`) :** Formulaire avancé permettant de filtrer la liste des assignments. Les critères de filtre (nom, plage de dates de rendu, tags, plage de notes, statut de verrouillage, matières, professeurs, élèves, statuts d'assignment, mots-clés dans l'exercice) sont envoyés au backend pour récupérer une liste de résultats optimisée.

-   **Profil Utilisateur (`user-profile-view-modal`) :**
    * Accessible depuis les cartes d'assignment (carousel, table).
    * Affiche les détails d'un utilisateur (professeur ou élève).
    * Permet à l'utilisateur connecté de mettre à jour sa propre photo de profil, ou à un admin de modifier celle des autres.

-   **Organisation (`organisation-component`) :**
    * Affiche un organigramme (`p-organization-chart`) centré sur l'utilisateur connecté, montrant ses relations avec les professeurs/élèves et les assignments associés.

-   **UX Améliorée :**
    * Utilisation de `ConfirmPopup` pour les confirmations de suppression.
    * Utilisation de `Toast` pour les feedbacks d'opérations (succès, erreur, information).
    * Intercepteur HTTP pour attacher automatiquement les tokens JWT aux requêtes API.
    
## Problèmes Rencontrés
Je ne suis pas sur la dernière version d'Angular, donc je n'ai pas pu utiliser la syntaxe que vous recommandez d'utiliser pour les `for` et les `if` (@-syntax).
