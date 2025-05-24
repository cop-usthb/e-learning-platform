from pymongo import MongoClient
import pandas as pd
import numpy as np
import argparse
import sys
import os
from datetime import datetime
import traceback

def update_user_profiles():
    try:
        print("====== DÉMARRAGE DE LA MISE À JOUR DES PROFILS UTILISATEURS ======")
        print(f"Répertoire courant: {os.getcwd()}")
        
        # Vérifier l'existence du fichier de données
        data_file = "item_vectors_onehot.csv"
        if not os.path.exists(data_file):
            print(f"ERREUR: Le fichier {data_file} n'existe pas dans {os.getcwd()}")
            print("Recherche dans le répertoire parent...")
            parent_dir = os.path.dirname(os.getcwd())
            parent_file = os.path.join(parent_dir, data_file)
            if os.path.exists(parent_file):
                print(f"Fichier trouvé dans: {parent_file}")
                data_file = parent_file
            else:
                print(f"ERREUR: Le fichier {data_file} est introuvable!")
                return False
        
        # Connexion à MongoDB
        print("Connexion à MongoDB...")
        client = MongoClient("mongodb+srv://Nazimouzaoui:N%40zim2002@cluster001.y4nrdvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001")
        db = client["Online_courses"]
        users_collection = db["users"]
        
        print("Récupération des utilisateurs...")
        users_count = users_collection.count_documents({})
        print(f"Nombre d'utilisateurs trouvés: {users_count}")

        # Chargement des vecteurs d'items
        print(f"Chargement du fichier {data_file}...")
        item_vectors_df = pd.read_csv(data_file)
        print(f"Dimensions du fichier: {item_vectors_df.shape}")
        
        if 'id' not in item_vectors_df.columns:
            print(f"ERREUR: La colonne 'id' est absente du fichier {data_file}")
            print(f"Colonnes disponibles: {item_vectors_df.columns.tolist()[:5]}...")
            return False
            
        item_vectors_df.set_index("id", inplace=True)
        vector_columns = list(item_vectors_df.columns)
        print(f"Nombre de dimensions: {len(vector_columns)}")

        # Liste pour stocker les profils utilisateurs
        user_profiles = []

        # Parcourir chaque utilisateur
        print("Traitement des profils utilisateurs...")
        user_count = 0
        for user in users_collection.find():
            user_id = str(user["_id"])
            user_courses = user.get("courses", [])
            interests = user.get("interests", [])
            
            user_count += 1
            if user_count % 10 == 0:  # Log pour chaque 10 utilisateurs
                print(f"Traitement de l'utilisateur {user_count}/{users_count}...")

            user_vector = np.zeros(item_vectors_df.shape[1])
            weighted_sum = np.zeros(len(vector_columns))
            total_weight = 0.0

            # Profil basé sur les cours achetés
            for course in user_courses:
                course_id = course.get("id")
                progress = course.get("progress", 0)
                rating = course.get("rating", None)

                if course_id is not None and course_id in item_vectors_df.index:
                    item_vector = item_vectors_df.loc[course_id].values.astype(float)
                    if rating is None or np.isnan(rating):
                        rating = 2.5  # Valeur par défaut
                    if progress == 0:
                        progress = 5  # On suppose 5% si non démarré
                    weight = (progress / 100.0) * (rating / 5.0)
                    weighted_sum += item_vector * weight
                    total_weight += weight

            # Profil basé sur les intérêts
            interest_vector = np.zeros(len(vector_columns))
            for interest in interests:
                if isinstance(interest, str):
                    interest_clean = interest.strip().lower()
                    target_column = f"theme_{interest_clean}"
                    for idx, col in enumerate(vector_columns):
                        if isinstance(col, str) and col.lower() == target_column:
                            interest_vector[idx] = 1


            # Fusion des deux vecteurs
            if total_weight > 0 and np.any(interest_vector):
                course_vector = weighted_sum / total_weight
                user_vector = (course_vector + interest_vector) / 2.0
            elif total_weight > 0:
                user_vector = weighted_sum / total_weight
            elif np.any(interest_vector):
                user_vector = interest_vector
            else:
                user_vector = np.zeros(len(vector_columns))

            user_profiles.append([user_id] + list(user_vector))

        # Sauvegarde CSV
        print(f"Création du fichier de profils pour {len(user_profiles)} utilisateurs...")
        columns = ["user_id"] + vector_columns
        profiles_df = pd.DataFrame(user_profiles, columns=columns)
        
        # Vérifier qu'il y a des données à sauvegarder
        if len(profiles_df) == 0:
            print("Aucun profil utilisateur généré!")
            return False
            
        # Sauvegarde uniquement du fichier principal sans horodatage
        output_path = os.path.join(os.getcwd(), "user_profiles.csv")
        profiles_df.to_csv(output_path, index=False)
        print(f"Fichier sauvegardé dans: user_profiles.csv")
        
        print("====== MISE À JOUR DES PROFILS TERMINÉE AVEC SUCCÈS ======")
        return True
    
    except Exception as e:
        print(f"ERREUR CRITIQUE lors de la mise à jour des profils: {str(e)}")
        print(traceback.format_exc())
        return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mise à jour des profils utilisateurs")
    parser.add_argument("--trigger", type=str, help="Type de déclencheur (signup, purchase, rating, progress, interests)", default="manual")
    
    args = parser.parse_args()
    
    print(f"Mise à jour déclenchée par: {args.trigger}")
    print(f"Python version: {sys.version}")
    print(f"Pandas version: {pd.__version__}")
    print(f"NumPy version: {np.__version__}")
    
    success = update_user_profiles()
    
    if success:
        print("Exécution réussie!")
        sys.exit(0)
    else:
        print("Échec de l'exécution!")
        sys.exit(1)
