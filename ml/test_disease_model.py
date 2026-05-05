"""
Test rice_disease_model.tflite on a different dataset
Google Colab Ready
"""

import os
import numpy as np
import tensorflow as tf
from collections import Counter
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# ============================================================
# 1. LOAD MODEL & LABELS
# ============================================================
MODEL_PATH = "/content/rice_disease_model.tflite"
LABELS_PATH = "/content/class_labels.txt"

with open(LABELS_PATH, "r") as f:
    class_names = [line.strip() for line in f.readlines() if line.strip()]

print(f"Model classes ({len(class_names)}): {class_names}")

interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

IMG_SIZE = input_details[0]['shape'][1]  # Should be 224
print(f"Input shape: {input_details[0]['shape']}")
print(f"Input dtype: {input_details[0]['dtype']}")
print(f"Output shape: {output_details[0]['shape']}")

# ============================================================
# 2. DOWNLOAD TEST DATASET
# ============================================================
import kagglehub
dataset_path = kagglehub.dataset_download("ikkiocean/paddy-disease-dataset")
print(f"Dataset downloaded to: {dataset_path}")

# Find the folder with class subfolders
data_dir = None
for root, dirs, files in os.walk(dataset_path):
    # Skip hidden dirs and look for folders with images
    valid_dirs = [d for d in dirs if not d.startswith('.') and d not in ('train', 'test', 'train_images', 'test_images')]
    if len(valid_dirs) >= 3:
        # Check if these have images
        has_images = any(
            any(f.lower().endswith(('.jpg', '.jpeg', '.png'))
                for f in os.listdir(os.path.join(root, d)))
            for d in valid_dirs if os.path.isdir(os.path.join(root, d))
        )
        if has_images:
            data_dir = root
            break

# Fallback: try common subfolder names
if data_dir is None:
    for candidate in ['train_images', 'test_images', 'train', 'test', 'val', 'validation']:
        candidate_path = os.path.join(dataset_path, candidate)
        if os.path.isdir(candidate_path):
            subdirs = [d for d in os.listdir(candidate_path) if os.path.isdir(os.path.join(candidate_path, d))]
            if len(subdirs) >= 3:
                data_dir = candidate_path
                break

if data_dir is None:
    # Last resort: just use dataset_path itself
    data_dir = dataset_path

print(f"Using data directory: {data_dir}")

# List what's in the dataset
dataset_classes = sorted([
    d for d in os.listdir(data_dir)
    if os.path.isdir(os.path.join(data_dir, d)) and not d.startswith('.')
])
print(f"\nDataset classes ({len(dataset_classes)}):")
for c in dataset_classes:
    count = len([f for f in os.listdir(os.path.join(data_dir, c))
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    print(f"  {c}: {count} images")

# ============================================================
# 3. MAP DATASET CLASSES TO MODEL CLASSES
# ============================================================
# Build a mapping from dataset folder names to model class indices
# Uses fuzzy matching (lowercase, underscores, partial match)

def normalize(name):
    return name.lower().replace(' ', '_').replace('-', '_').strip()

class_mapping = {}  # dataset_class -> model_class_index

for ds_class in dataset_classes:
    ds_norm = normalize(ds_class)
    matched = False

    for idx, model_class in enumerate(class_names):
        model_norm = normalize(model_class)
        if ds_norm == model_norm or ds_norm in model_norm or model_norm in ds_norm:
            class_mapping[ds_class] = idx
            matched = True
            break

    if not matched:
        print(f"  WARNING: No model match for dataset class '{ds_class}'")

print(f"\nMapped {len(class_mapping)}/{len(dataset_classes)} dataset classes to model classes:")
for ds_class, model_idx in class_mapping.items():
    print(f"  {ds_class} → {class_names[model_idx]} (index {model_idx})")

# ============================================================
# 4. RUN INFERENCE
# ============================================================
from PIL import Image

def preprocess_image(image_path):
    """Same preprocessing as the app: resize to 224x224, scale to [-1, 1]"""
    img = Image.open(image_path).convert('RGB')
    img = img.resize((IMG_SIZE, IMG_SIZE))
    arr = np.array(img, dtype=np.float32)
    # EfficientNet preprocessing: (pixels / 127.5) - 1
    arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, axis=0)

def predict_single(image_path):
    """Run TFLite inference on a single image"""
    sample = preprocess_image(image_path)
    interpreter.resize_tensor_input(input_details[0]['index'], sample.shape)
    interpreter.allocate_tensors()
    interpreter.set_tensor(input_details[0]['index'], sample)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    return output[0]

# Test on all mapped classes
MAX_PER_CLASS = 50  # Limit per class to speed things up

y_true = []
y_pred = []
y_conf = []
total = 0
correct = 0

print(f"\nRunning inference (max {MAX_PER_CLASS} images per class)...")

for ds_class, model_idx in class_mapping.items():
    class_dir = os.path.join(data_dir, ds_class)
    images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    images = images[:MAX_PER_CLASS]

    class_correct = 0
    for img_name in images:
        img_path = os.path.join(class_dir, img_name)
        try:
            probs = predict_single(img_path)
            pred_idx = np.argmax(probs)
            confidence = probs[pred_idx]

            y_true.append(model_idx)
            y_pred.append(pred_idx)
            y_conf.append(confidence)

            total += 1
            if pred_idx == model_idx:
                correct += 1
                class_correct += 1
        except Exception as e:
            print(f"  Error on {img_path}: {e}")

    acc = class_correct / len(images) * 100 if images else 0
    print(f"  {ds_class}: {class_correct}/{len(images)} correct ({acc:.1f}%)")

# ============================================================
# 5. RESULTS
# ============================================================
print("\n" + "=" * 60)
print("RESULTS")
print("=" * 60)
print(f"Overall Accuracy: {correct}/{total} ({correct/total*100:.1f}%)")
print(f"Average Confidence: {np.mean(y_conf):.3f}")

# Get the subset of class names that were actually tested
tested_indices = sorted(set(y_true + y_pred))
tested_names = [class_names[i] for i in tested_indices]

# Remap to contiguous indices for classification report
idx_map = {old: new for new, old in enumerate(tested_indices)}
y_true_mapped = [idx_map[y] for y in y_true]
y_pred_mapped = [idx_map[y] for y in y_pred]

print("\n--- Classification Report ---")
print(classification_report(y_true_mapped, y_pred_mapped, target_names=tested_names, digits=4))

# Confusion matrix
cm = confusion_matrix(y_true_mapped, y_pred_mapped)
plt.figure(figsize=(max(10, len(tested_names)), max(8, len(tested_names) * 0.8)))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=tested_names, yticklabels=tested_names)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix — Disease Model on External Dataset")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig("test_confusion_matrix.png", dpi=150)
plt.show()

# Confidence distribution
plt.figure(figsize=(10, 4))
plt.hist(y_conf, bins=50, edgecolor='black', alpha=0.7)
plt.xlabel("Confidence")
plt.ylabel("Count")
plt.title("Prediction Confidence Distribution")
plt.axvline(x=0.6, color='red', linestyle='--', label='App threshold (60%)')
plt.legend()
plt.tight_layout()
plt.savefig("test_confidence_distribution.png", dpi=150)
plt.show()

print("\nDone. Saved: test_confusion_matrix.png, test_confidence_distribution.png")
