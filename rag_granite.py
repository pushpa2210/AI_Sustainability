import faiss
import pickle
import numpy as np
import torch

from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForCausalLM

# =====================================
# Load FAISS
# =====================================

print("Loading FAISS index...")
index = faiss.read_index("faiss_db/waste_index.faiss")

print("Loading chunks...")
with open("faiss_db/chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

# =====================================
# Load Embedding Model
# =====================================

print("Loading embedding model...")
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# =====================================
# Load Granite
# =====================================

MODEL_NAME = "ibm-granite/granite-3.3-2b-instruct"

print("Loading Granite tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

print("Loading Granite model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32
)

print("System Ready!")

# =====================================
# Retrieval Function
# =====================================

def retrieve(query, top_k=2):

    query_embedding = embedding_model.encode([query])

    query_embedding = np.array(query_embedding).astype("float32")

    distances, indices = index.search(query_embedding, top_k)

    context = ""

    for i in indices[0]:
        context += chunks[i]["content"] + "\n\n"

    return context


# =====================================
# Answer Generation
# =====================================

def answer_question(question):

    context = retrieve(question)

    prompt = f"""
You are a municipal waste management assistant.

Answer only using the information provided in the context.

Context:
{context}

Question:
{question}

Answer:
"""

    inputs = tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1084
    )

    outputs = model.generate(
    **inputs,
    max_new_tokens=80,
    temperature=0.1,
    do_sample=False
)
    response = tokenizer.decode(
        outputs[0],
        skip_special_tokens=True
    )

    print("\n" + "=" * 80)
    print("ANSWER")
    print("=" * 80)
    print(response)


# =====================================
# Chat Loop
# =====================================

while True:

    query = input("\nAsk a question (or exit): ")

    if query.lower() == "exit":
        print("Goodbye!")
        break

    answer_question(query)