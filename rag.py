import faiss
import pickle
import numpy as np

from sentence_transformers import SentenceTransformer
from transformers import pipeline

# =====================================
# Load Everything Once
# =====================================

print("Loading FAISS index...")
index = faiss.read_index("faiss_db/waste_index.faiss")

print("Loading chunks...")
with open("faiss_db/chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

print("Loading LLM...")
generator = pipeline(
    "text2text-generation",
    model="google/flan-t5-base"
)

print("System Ready!")

# =====================================
# Retrieve Relevant Chunks
# =====================================

def retrieve(query, top_k=3):

    query_embedding = embedding_model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(query_embedding, top_k)

    context = ""

    for i in indices[0]:
        context += chunks[i]["content"] + "\n\n"

    return context

# =====================================
# Generate Answer
# =====================================

def answer_question(question):

    context = retrieve(question)

    prompt = f"""
Use the context below to answer the question briefly and accurately.

Context:
{context}

Question:
{question}

Answer:
"""

    result = generator(
        prompt,
        max_new_tokens=150
    )

    print("\nAnswer:\n")
    print(result[0]["generated_text"])

# =====================================
# Chat Loop
# =====================================

while True:

    query = input("\nAsk a question (or exit): ")

    if query.lower() == "exit":
        print("Goodbye!")
        break

    answer_question(query)