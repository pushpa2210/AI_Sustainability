from pdf_loader import load_pdfs
from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_documents():

    print("Function started")

    documents = load_pdfs()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = []

    for doc in documents:

        text_chunks = splitter.split_text(doc["content"])

        for chunk in text_chunks:
            chunks.append({
                "source": doc["filename"],
                "content": chunk
            })

    return chunks


if __name__ == "__main__":

    chunks = chunk_documents()

    print(f"Total Chunks: {len(chunks)}")

    print("\nSample Chunk:\n")

    print(chunks[0]["content"])