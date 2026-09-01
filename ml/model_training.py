import os
import pickle
from ml.sample_dataset import generate_sample_dataset
from ml.feature_engineering import FeatureExtractor

def train_and_save_model(output_path: str = "ml/model_artifacts.pkl"):
    """
    Trains the TF-IDF feature extractor and recommendation artifacts on sample dataset.
    """
    students_df, opps_df = generate_sample_dataset(100)
    extractor = FeatureExtractor()

    # Fit TF-IDF on synthetic corpus
    corpus = []
    for _, row in students_df.iterrows():
        text = f"{row['target_role']} {' '.join(row['skills'].keys())}"
        corpus.append(text)
    for _, row in opps_df.iterrows():
        text = f"{row['title']} {' '.join([s['name'] for s in row['required_skills']])}"
        corpus.append(text)

    extractor.tfidf.fit(corpus)

    # Save artifacts
    artifacts = {
        "tfidf": extractor.tfidf,
        "vocabulary_size": len(extractor.tfidf.vocabulary_),
        "samples_count": len(corpus)
    }

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        pickle.dump(artifacts, f)

    print(f"ML Model trained successfully. Artifacts saved to {output_path}")

if __name__ == "__main__":
    train_and_save_model()
