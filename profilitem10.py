from pymongo import MongoClient
import pandas as pd

# === Connexion MongoDB ===
client = MongoClient("mongodb+srv://Nazimouzaoui:N%40zim2002@cluster001.y4nrdvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster001")
db = client["Online_courses"]
collection = db["Course"]

# === Récupération des données sans _id MongoDB ===
data = list(collection.find({}, {"_id": 0}))

# === Création DataFrame ===
df = pd.DataFrame(data)

# === Nettoyage chaînes (retrait espaces inutiles) ===
for col in ["partner", "theme", "level", "certificatetype", "duration"]:
    df[col] = df[col].str.strip()

# === Sélectionner les colonnes à encoder (sauf celles à supprimer) ===
# On ne garde que 'partner' et 'theme' pour one-hot
one_hot_cols = ["partner", "theme"]

# === One-hot pour partner et theme ===
df_onehot = pd.get_dummies(df[one_hot_cols], prefix=one_hot_cols)

# === One-hot pour skills ===
all_skills = sorted(set(skill for skills_list in df["skills"] for skill in skills_list))
skills_df = pd.DataFrame(0, index=df.index, columns=[f"skill_{skill}" for skill in all_skills])

for i, skills_list in enumerate(df["skills"]):
    for skill in skills_list:
        skills_df.at[i, f"skill_{skill}"] = 1

# === Concaténer id + one-hot ===
final_df = pd.concat([df["id"], df_onehot, skills_df], axis=1)

# === Sauvegarde CSV ===
final_df.to_csv("item_vectors_onehot.csv", index=False)
print("\n Matrice finale (avec one-hot uniquement, sans rating/level/duration/certificatetype) enregistrée dans : item_vectors_onehot.csv")
