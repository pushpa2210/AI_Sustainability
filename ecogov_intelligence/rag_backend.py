import os
import sys
import pickle
import faiss
import numpy as np
from collections import Counter
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer

# Resolve paths relative to this script directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

FAISS_INDEX_PATH = os.path.join(PROJECT_ROOT, "faiss_db", "waste_index.faiss")
CHUNKS_PKL_PATH = os.path.join(PROJECT_ROOT, "faiss_db", "chunks.pkl")

app = Flask(__name__)
CORS(app)  # Enable CORS for development cross-port calls

# =====================================
# Load FAISS index and chunks once
# =====================================
print(f"Loading FAISS index from {FAISS_INDEX_PATH}...")
if not os.path.exists(FAISS_INDEX_PATH):
    print(f"Error: FAISS index file not found at {FAISS_INDEX_PATH}", file=sys.stderr)
    sys.exit(1)
index = faiss.read_index(FAISS_INDEX_PATH)

print(f"Loading chunks from {CHUNKS_PKL_PATH}...")
if not os.path.exists(CHUNKS_PKL_PATH):
    print(f"Error: Chunks file not found at {CHUNKS_PKL_PATH}", file=sys.stderr)
    sys.exit(1)
with open(CHUNKS_PKL_PATH, "rb") as f:
    chunks = pickle.load(f)

print("Loading embedding model...")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

# Calculate chunk counts by source file
chunk_counts = Counter(c["source"] for c in chunks)
print(f"Loaded {len(chunks)} chunks across {len(chunk_counts)} source documents.")

# Document Metadata dictionary mapping PDF file names to user-friendly UI details
DOC_METADATA = {
    "BMW_Rules.pdf": {
        "title": "Bio-Medical Waste Management Rules",
        "year": 2016,
        "description": "Hospital classification with strictly enforced color-coded bins (Yellow, Red, Blue, White puncture-proof container).",
        "category": "biomedical"
    },
    "Ewaste_Rules.pdf": {
        "title": "E-Waste (Management) Rules",
        "year": 2022,
        "description": "Governs disposal pipelines of consumer appliances, lithium cells, circuits, restricting uncertified informal smelting.",
        "category": "e-waste"
    },
    "PWM_Rules.pdf.pdf": {
        "title": "Plastic Waste Management Rules",
        "year": 2016,
        "description": "Regulates manufacture and recycling standards of carry bags (120μm), and establishes Extended Producer Responsibility.",
        "category": "plastic"
    },
    "solid-waste-management-rules-2026.pdf": {
        "title": "Solid Waste Management Rules",
        "year": 2016,
        "description": "National standards mandating 3-way household segregation (wet, dry, and sanitary waste) at source.",
        "category": "solid"
    },
    "SBMG-IEC-Guidelines.pdf": {
        "title": "SBM (Grameen) IEC Guidelines",
        "year": 2020,
        "description": "Information, Education, and Communication guidelines for Swachh Bharat Mission rural areas.",
        "category": "national"
    },
    "SBMG Phase-II Operational Guidelines.pdf": {
        "title": "SBM (Grameen) Phase-II Guidelines",
        "year": 2020,
        "description": "Phase-II operational guidelines for Open Defecation Free Plus (ODF+) and solid/liquid waste management.",
        "category": "national"
    },
    "Waste Segregation Poster - English.pdf": {
        "title": "Waste Segregation Poster (English)",
        "year": 2020,
        "description": "Visual poster guidelines for household dry, wet, and hazardous waste segregation.",
        "category": "solid"
    },
    "Clarification_reg_booking.pdf": {
        "title": "Clarification on Waste Collection Booking",
        "year": 2021,
        "description": "Official clarifications regarding municipal booking, logistics, and scheduling.",
        "category": "solid"
    },
    "SBM(G)_Guidelines.pdf": {
        "title": "Swachh Bharat Mission (Grameen) Guidelines",
        "year": 2017,
        "description": "Core guidelines for rural sanitation, solid waste handling, and community initiatives.",
        "category": "national"
    }
}

def get_metadata(filename):
    """Retrieve metadata with a dynamic fallback if the file isn't pre-defined."""
    if filename in DOC_METADATA:
        return DOC_METADATA[filename]
    
    # Fallback derivation
    title = filename.replace(".pdf", "").replace("_", " ").replace("-", " ")
    category = "solid"
    lower_fn = filename.lower()
    if "plastic" in lower_fn or "pwm" in lower_fn:
        category = "plastic"
    elif "ewaste" in lower_fn or "e-waste" in lower_fn:
        category = "e-waste"
    elif "bmw" in lower_fn or "medical" in lower_fn:
        category = "biomedical"
    elif "civil" in lower_fn or "construction" in lower_fn:
        category = "civil"
    elif "hazardous" in lower_fn:
        category = "hazardous"
    elif "sbm" in lower_fn or "swachh" in lower_fn:
        category = "national"
        
    return {
        "title": title,
        "year": 2016,
        "description": f"Waste management guidance from {title}.",
        "category": category
    }

def extract_section_title(content):
    """Tries to extract a meaningful header/section title from the chunk content."""
    lines = [line.strip() for line in content.split("\n") if line.strip()]
    if not lines:
        return "General Provision"
    
    # Check if first line is a good candidate (not too long, looks like a heading/rule/clause)
    first = lines[0]
    if len(first) > 5 and len(first) < 70:
        return first
    
    # Check for text patterns like "Rule 4:" or "Section 3:"
    for line in lines[:3]:
        if ":" in line:
            parts = line.split(":")
            if len(parts[0]) > 3 and len(parts[0]) < 40:
                return parts[0].strip()
                
    return "Relevant Clause"

# =====================================
# API Endpoints
# =====================================

@app.route("/api/state", methods=["GET"])
def get_state():
    unique_sources = sorted(list(chunk_counts.keys()))
    documents_list = []
    
    for idx, source in enumerate(unique_sources):
        meta = get_metadata(source)
        documents_list.append({
            "id": f"doc_{idx+1}",
            "title": meta["title"],
            "year": meta["year"],
            "description": meta["description"],
            "chunksCount": chunk_counts[source],
            "category": meta["category"]
        })
        
    return jsonify({
        "totalDocuments": len(unique_sources),
        "totalChunks": len(chunks),
        "documentsList": documents_list
    })

@app.route("/api/retrieve", methods=["POST"])
def retrieve_chunks():
    data = request.json or {}
    query = data.get("query", "")
    limit = data.get("limit", 3)
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
        
    # Semantic search with SentenceTransformers
    query_embedding = embedding_model.encode([query])
    query_embedding = np.array(query_embedding).astype("float32")
    
    # Perform search
    distances, indices = index.search(query_embedding, limit)
    
    retrieved_chunks = []
    for rank, idx in enumerate(indices[0]):
        if idx == -1 or idx >= len(chunks):
            continue
            
        chunk = chunks[idx]
        filename = chunk["source"]
        meta = get_metadata(filename)
        section = extract_section_title(chunk["content"])
        
        retrieved_chunks.append({
            "docTitle": f"{meta['title']} ({meta['year']})",
            "section": section,
            "content": chunk["content"],
            "source": filename
        })
        
    return jsonify({
        "chunks": retrieved_chunks
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
