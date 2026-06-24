from chunking import chunk_documents
from sentence_transformers import SentenceTransformer

def create_embeddings():

    print("Loading chunks...")

    chunks = chunk_documents()

    print("Loading embedding model...")

    model = SentenceTransformer("all-MiniLM-L6-v2")

    texts = [chunk["content"] for chunk in chunks]

    print("Generating embeddings...")

    embeddings = model.encode(
        texts,
        show_progress_bar=True
    )

    print(f"Total Chunks: {len(chunks)}")
    print(f"Embedding Shape: {embeddings.shape}")

    return chunks, embeddings


if __name__ == "__main__":

    chunks, embeddings = create_embeddings()