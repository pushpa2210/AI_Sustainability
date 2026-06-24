from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

MODEL_NAME = "ibm-granite/granite-3.3-2b-instruct"

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

print("Loading model...")
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float32
)

print("Model Loaded Successfully!")

prompt = "What is waste segregation?"

inputs = tokenizer(
    prompt,
    return_tensors="pt"
)

outputs = model.generate(
    **inputs,
    max_new_tokens=100
)

response = tokenizer.decode(
    outputs[0],
    skip_special_tokens=True
)

print("\nResponse:")
print(response)