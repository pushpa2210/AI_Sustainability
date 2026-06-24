from PyPDF2 import PdfReader
import os

DATA_FOLDER = "data"

def load_pdfs():
    documents = []

    for file in os.listdir(DATA_FOLDER):
        if file.endswith(".pdf"):
            pdf_path = os.path.join(DATA_FOLDER, file)

            reader = PdfReader(pdf_path)

            text = ""

            for page in reader.pages:
                text += page.extract_text() or ""

            documents.append({
                "filename": file,
                "content": text
            })

    return documents


if __name__ == "__main__":
    docs = load_pdfs()

    print(f"Loaded {len(docs)} PDFs")

    for doc in docs:
        print(f"\nFile: {doc['filename']}")
        print(doc["content"][:500])