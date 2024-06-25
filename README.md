# Raved
Raved est une application pour Android/iOS, permettant d'enregistrer des audios, de les sauvegarder, de les écouter, de les supprimer, de les télécharger et de les importer.
Il sera possible de se connecter sur un serveur Python fournissant des modèles de conversion pour encoder les audios enregistrés dans un style tel que : Jazz, Darbouka, Parole, Chats, Chiens...
Il sera également possible de gérer les audios convertis

### Structure
##### App.js
Structure des tabs et de la navigation
##### store.js
Gestion des actions redux, sauvegarde en mémoire des données
##### ConnectScreen.js
Connexion au serveur Python fournissant les modèles, sauvegarde et connexion rapide aux serveurs précédents, feedback en cas de connexion échouée
##### Tab1Screen.js
Enregistrement audio, lecture, suppression et sauvegarde avec un nom personnalisé de l'aperçu
##### RecordingGraph.js
Affichage en temps réel du son enregistré une courbe vectorielle pour un feedback de l'enregistrement
##### Tab2Screen.js
Affichage du menu des sous-tab
##### SousTab1Screen.js
Liste des audios enregistrés sauvegardés en mémoire, possibilité d'écouter, de supprimer ou de télécharger l'audio sur le téléphone
Bouton de sélection de l'audio à convertir dans la SousTab2, possibilité d'importer un fichier depuis le téléphone
##### SousTab2Screen.js
Import des modèles du serveur si existant, vérification qu'un enregistrement a été selectionné, transfert au serveur et affichage des aperçus, possibilité de sauvegarde l'audio converti en mémoire
##### LoadingOverlay.js
Affichage d'un écran de chargement pour informer l'utilisateur que le serveur traite l'audio
##### SousTab3Screen.js
Liste des audios convertis sauvegardés en mémoire, possibilité d'écouter, de supprimer ou de télécharger l'audio sur le téléphone
