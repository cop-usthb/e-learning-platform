from pymongo import MongoClient
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from bson.objectid import ObjectId
import argparse
import json
import sys
from sklearn.preprocessing import normalize

from datetime import datetime
import os

def log_message(message):
    """Affiche les messages de log sur stderr pour éviter d'interférer avec le JSON"""
    print(message, file=sys.stderr)

def get_purchased_courses(user_id):
    """Récupère les cours déjà achetés par un utilisateur"""
    try:
        client = MongoClient("mongodb+srv://Nazimouzaoui:N%40zim2002@cluster001.y4nrdvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001")
        db = client["Online_courses"]
        users_collection = db["users"]
        
        # Convertir l'user_id en ObjectId si c'est une string
        if isinstance(user_id, str) and len(user_id) == 24:
            user_id = ObjectId(user_id)
        
        user = users_collection.find_one({"_id": user_id})
        
        purchased_course_ids = []
        if user and "courses" in user:
            log_message(f"Utilisateur trouve: {user.get('name', 'N/A')}")
            
            for course in user["courses"]:
                if course.get("purchased", False):
                    course_id = course.get("id")
                    if course_id:
                        purchased_course_ids.append(str(course_id))
        
        client.close()
        return purchased_course_ids
        
    except Exception as e:
        log_message(f"Erreur lors de la recuperation des cours achetes: {e}")
        return []

def get_course_name(course_id):
    """Récupère le nom d'un cours depuis MongoDB en utilisant l'attribut 'course'"""
    try:
        client = MongoClient("mongodb+srv://Nazimouzaoui:N%40zim2002@cluster001.y4nrdvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001")
        db = client["Online_courses"]
        item_collection = db["Course"]
        
        course = item_collection.find_one({"id": int(course_id)})
        
        if course:
            # Priorité à l'attribut 'course', puis fallback sur d'autres attributs
            course_name = (course.get("course") or 
                          course.get("title") or 
                          course.get("name") or 
                          course.get("courseName") or 
                          f"Course {course_id}")
            
            log_message(f"Cours ID {course_id}: '{course_name}'")
            client.close()
            return course_name
        
        client.close()
        log_message(f"Cours ID {course_id} non trouve dans MongoDB")
        return f"Course {course_id}"
        
    except Exception as e:
        log_message(f"Erreur lors de la recuperation du nom pour le cours {course_id}: {e}")
        return f"Course {course_id}"

def recommend_courses(user_id, n_recommendations=10):
    """Recommander des cours en excluant ceux déjà achetés - Retourne top_recommendations"""
    try:
        # Charger les données
        if not os.path.exists("user_profiles.csv") or not os.path.exists("item_vectors_onehot.csv"):
            log_message("Fichiers CSV manquants")
            return []
            
        user_profiles = pd.read_csv("user_profiles.csv")
        item_vectors = pd.read_csv("item_vectors_onehot.csv")
        
        # Fixer le problème de dtype
        log_message("Conversion des types de donnees...")
        item_matrix = item_vectors.iloc[:, 1:].copy().astype(float)
        item_vectors_clean = item_vectors.iloc[:, :1].copy()
        item_vectors_clean = pd.concat([item_vectors_clean, item_matrix], axis=1)
        
        # Récupérer les cours déjà achetés
        purchased_courses = get_purchased_courses(user_id)
        log_message(f"Cours achetes a exclure: {purchased_courses}")
        
        # Vérifier si l'utilisateur existe dans les profils
        user_id_str = str(user_id)
        if user_id_str not in user_profiles['user_id'].values:
            log_message(f"Utilisateur {user_id_str} non trouve dans les profils")
            return []
        
        user_profile = user_profiles[user_profiles['user_id'] == user_id_str].iloc[0, 1:].values.astype(float)

        # Option 1 : Laisser cosine_similarity faire la normalisation (recommandé)
        similarities = cosine_similarity([user_profile], item_matrix.values)[0]
        # Créer un DataFrame avec les similarités
        recommendations_df = pd.DataFrame({
            'course_id': item_vectors_clean.iloc[:, 0],
            'similarity': similarities
        })
        
        # S'assurer que course_id est numérique
        recommendations_df['course_id'] = pd.to_numeric(recommendations_df['course_id'], errors='coerce')
        
        # Exclure les cours déjà achetés
        if purchased_courses:
            purchased_courses_int = [int(x) for x in purchased_courses if x.isdigit()]
            mask = ~recommendations_df['course_id'].isin(purchased_courses_int)
            recommendations_df = recommendations_df[mask]
            log_message(f"Cours restants apres exclusion: {len(recommendations_df)}")
        
        # OPTIMISATION: Pré-trier par similarité et prendre seulement n_recommendations * 3
        log_message("Pre-tri par similarite...")
        recommendations_df = recommendations_df.sort_values('similarity', ascending=False)
        
        # Prendre seulement les top n_recommendations * 3 pour optimiser
        top_candidates = min(n_recommendations * 3, len(recommendations_df))
        recommendations_df_limited = recommendations_df.head(top_candidates).copy()
        
        log_message(f"Recuperation des noms pour {top_candidates} cours candidats...")
        
        # Récupérer les noms des cours SEULEMENT pour les candidats
        course_names = []
        for course_id in recommendations_df_limited['course_id']:
            course_name = get_course_name(int(course_id))
            course_names.append(course_name)
        
        recommendations_df_limited['course_name'] = course_names
        
        # Tri final multi-critères :
        # 1. Similarité (décroissant) - critère principal
        # 2. Nom du cours (ordre alphabétique)
        log_message("Tri final des recommandations...")
        recommendations_df_limited = recommendations_df_limited.sort_values(
            ['similarity', 'course_name'], 
            ascending=[False, True]
        )
        
        log_message(f"Top {min(5, len(recommendations_df_limited))} recommandations apres tri:")
        for i, (_, row) in enumerate(recommendations_df_limited.head().iterrows(), 1):
            similarity_percent = round(row['similarity'] * 100, 1)
            log_message(f"{i}. ID: {int(row['course_id'])}, Nom: '{row['course_name']}', Similarite: {row['similarity']:.4f} ({similarity_percent}%)")
        
        # Retourner les top N recommandations avec format compatible
        top_recommendations = recommendations_df_limited.head(n_recommendations)
        result = []
        
        for _, row in top_recommendations.iterrows():
            result.append({
                'course_id': int(row['course_id']),
                'course_name': row['course_name'],
                'similarity': float(row['similarity'])
            })
        
        return result
        
    except Exception as e:
        log_message(f"Erreur lors de la generation des recommandations: {e}")
        import traceback
        traceback.print_exc(file=sys.stderr)
        return []



def main():
    """Fonction principale pour l'interface en ligne de commande"""
    parser = argparse.ArgumentParser(description="Systeme de recommandation de cours")
    parser.add_argument("--user-id", required=True, help="ID de l'utilisateur")
    parser.add_argument("--method", default="contenu", choices=["contenu"], help="Methode de recommandation")
    parser.add_argument("--num", type=int, default=10, help="Nombre de recommandations")
    parser.add_argument("--format", default="json", choices=["json", "simple"], help="Format de sortie")
    
    args = parser.parse_args()
    
    try:
        log_message(f"Generation de recommandations pour l'utilisateur: {args.user_id}")
        log_message(f"Methode: {args.method}, Nombre: {args.num}")
        
        if args.method == "contenu":
            # Utiliser la fonction originale qui retourne top_recommendations
            top_recommendations = recommend_courses(args.user_id, args.num)
        
        else:
            top_recommendations = []
        
        if args.format == "json":
            # Format JSON pour l'intégration avec Next.js
            result = {
                "user_id": args.user_id,
                "method": args.method,
                "count": len(top_recommendations),
                "top_recommendations": top_recommendations,
                "timestamp": datetime.now().isoformat()
            }
            
            log_message(f"Resultats finaux: {len(top_recommendations)} recommandations")
            if top_recommendations:
                log_message("Apercu des recommandations:")
                for i, rec in enumerate(top_recommendations[:3], 1):
                    log_message(f"  {i}. {rec['course_name']} ({rec['similarity']:.3f})")
            
            # Afficher seulement le JSON sur stdout
            print(json.dumps(result, ensure_ascii=False, default=str))
        
        else:
            # Format simple pour les tests manuels
            if top_recommendations:
                log_message(f"\n=== TOP {len(top_recommendations)} RECOMMANDATIONS ===")
                for i, rec in enumerate(top_recommendations, 1):
                    similarity_percent = round(rec['similarity'] * 100, 1)
                    log_message(f"{i}. {rec['course_name']} (ID: {rec['course_id']}, Similarite: {rec['similarity']:.4f}, {similarity_percent}%)")
            else:
                log_message("Aucune recommandation trouvee.")
        
    except Exception as e:
        if args.format == "json":
            error_result = {
                "error": str(e),
                "user_id": args.user_id,
                "method": args.method,
                "top_recommendations": [],
                "timestamp": datetime.now().isoformat()
            }
            print(json.dumps(error_result, default=str))
            sys.exit(1)
        else:
            log_message(f"Erreur: {e}")
            sys.exit(1)

if __name__ == "__main__":
    main()

