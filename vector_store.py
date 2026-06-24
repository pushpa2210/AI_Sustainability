from embeddings import create_embeddings
import faiss
import numpy as np
import pickle
import os

def build_vector_store():

    print("Creating embeddings...")

    chunks, embeddings = create_embeddings()

    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    os.makedirs("faiss_db", exist_ok=True)

    faiss.write_index(index, "faiss_db/waste_index.faiss")

    with open("faiss_db/chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)

    print("FAISS index saved successfully")
    print(f"Total vectors stored: {index.ntotal}")

if __name__ == "__main__":
    build_vector_store()