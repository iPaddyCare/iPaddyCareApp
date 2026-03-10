"""
Rice Disease Detection - Complete Training Pipeline
EfficientNetB0 Transfer Learning | TFLite Export | Google Colab Ready
Dataset: Paddy Doctor (imbikramsaha/paddy-doctor)

After training, automatically tests on external dataset (ikkiocean/paddy-disease-dataset).
"""

# ============================================================
# 1. IMPORTS & SETUP
# ============================================================
import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks, mixed_precision
from tensorflow.keras.applications import EfficientNetB0
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
from collections import Counter
import matplotlib.pyplot as plt
import seaborn as sns

# Enable mixed precision
policy = mixed_precision.Policy('mixed_float16')
mixed_precision.set_global_policy(policy)
print(f"Mixed precision policy: {policy.name}")

# Reproducibility
tf.random.set_seed(42)
np.random.seed(42)

# ============================================================
# 2. DATASET DOWNLOAD & PATH SETUP
# ============================================================
import kagglehub
dataset_path = kagglehub.dataset_download("imbikramsaha/paddy-doctor")
print(f"Dataset downloaded to: {dataset_path}")

# The paddy-doctor dataset has:
#   paddy-doctor/
#     train_images/        <-- contains the actual class subfolders
#       bacterial_leaf_blight/
#       blast/
#       ...
#     test_images/

data_dir = os.path.join(dataset_path, "train_images")
if not os.path.isdir(data_dir):
    # Fallback: search for train_images anywhere in the tree
    for root, dirs, files in os.walk(dataset_path):
        if "train_images" in dirs:
            data_dir = os.path.join(root, "train_images")
            break
    else:
        # Last resort: find folder with 3+ class subfolders
        for root, dirs, files in os.walk(dataset_path):
            class_dirs = [
                d for d in dirs
                if d not in ('train_images', 'test_images', 'train', 'test')
                and not d.startswith('.')
            ]
            if len(class_dirs) >= 3:
                data_dir = root
                break
        else:
            raise RuntimeError(f"Could not find class folders in {dataset_path}")

print(f"Using data directory: {data_dir}")

# Auto-discover class folders
folder_names = sorted([
    d for d in os.listdir(data_dir)
    if os.path.isdir(os.path.join(data_dir, d)) and not d.startswith('.')
])
class_names = folder_names
print(f"Classes found ({len(class_names)}): {class_names}")

for f in folder_names:
    count = len(os.listdir(os.path.join(data_dir, f)))
    print(f"  {f}: {count} images")

# ============================================================
# 3. DATA LOADING WITH TRAIN/VAL SPLIT
# ============================================================
IMG_SIZE = 224
BATCH_SIZE = 32

train_ds = keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

val_ds = keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

NUM_CLASSES = len(class_names)
print(f"\nNum classes: {NUM_CLASSES}")

# ============================================================
# 4. COMPUTE CLASS WEIGHTS
# ============================================================
all_labels = []
for _, labels in train_ds.unbatch():
    all_labels.append(np.argmax(labels.numpy()))
all_labels = np.array(all_labels)

label_counts = Counter(all_labels)
print(f"\nTrain label distribution: {dict(sorted(label_counts.items()))}")

class_weights_array = compute_class_weight(
    class_weight='balanced',
    classes=np.arange(NUM_CLASSES),
    y=all_labels,
)
class_weight_dict = {i: w for i, w in enumerate(class_weights_array)}
print(f"Class weights: {class_weight_dict}")

# ============================================================
# 5. DATA AUGMENTATION & PREFETCHING
# ============================================================
AUTOTUNE = tf.data.AUTOTUNE

data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.3),
    layers.RandomZoom((-0.2, 0.2)),
    layers.RandomContrast(0.2),
    layers.RandomTranslation(0.1, 0.1),
], name="data_augmentation")

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# ============================================================
# 6. BUILD MODEL
# ============================================================
# NOTE: Augmentation is applied via dataset .map() below, NOT as a model layer.
# This keeps the model clean for TFLite conversion (no need to rebuild/transfer weights).

base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)
base_model.trainable = False

inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.3)(x)
# Float32 output for numerical stability with mixed precision
outputs = layers.Dense(NUM_CLASSES, activation="softmax", dtype="float32")(x)

model = keras.Model(inputs, outputs)
model.summary()

# Apply augmentation via dataset mapping (only on training set)
train_ds = train_ds.map(
    lambda x, y: (data_augmentation(x, training=True), y),
    num_parallel_calls=AUTOTUNE,
)

# ============================================================
# 7. PHASE 1 — TRAIN HEAD ONLY
# ============================================================
SAVE_DIR = "saved_models_disease"
os.makedirs(SAVE_DIR, exist_ok=True)

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

phase1_callbacks = [
    callbacks.EarlyStopping(
        monitor="val_accuracy", patience=5, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1
    ),
    callbacks.ModelCheckpoint(
        os.path.join(SAVE_DIR, "best_model_phase1.keras"),
        monitor="val_accuracy", save_best_only=True, mode="max", verbose=1,
    ),
]

print("\n" + "=" * 60)
print("PHASE 1: Training head layers (base frozen)")
print("=" * 60)

history1 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=20,
    callbacks=phase1_callbacks,
    class_weight=class_weight_dict,
)

# ============================================================
# 8. PHASE 2 — FINE-TUNE TOP LAYERS OF BASE
# ============================================================
base_model.trainable = True

# Freeze all layers except the last 30
for layer in base_model.layers[:-30]:
    layer.trainable = False

trainable_params = sum(
    tf.reduce_prod(v.shape).numpy() for v in model.trainable_variables
)
total_params = model.count_params()
print(f"\nTrainable params after unfreezing: {trainable_params:,} / {total_params:,}")

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)

phase2_callbacks = [
    callbacks.EarlyStopping(
        monitor="val_accuracy", patience=7, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=3, min_lr=1e-7, verbose=1
    ),
    callbacks.ModelCheckpoint(
        os.path.join(SAVE_DIR, "best_model_final.keras"),
        monitor="val_accuracy", save_best_only=True, mode="max", verbose=1,
    ),
]

print("\n" + "=" * 60)
print("PHASE 2: Fine-tuning top layers of EfficientNetB0")
print("=" * 60)

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=30,
    callbacks=phase2_callbacks,
    class_weight=class_weight_dict,
)

# ============================================================
# 9. EVALUATION ON VALIDATION SET
# ============================================================
print("\n" + "=" * 60)
print("EVALUATION ON VALIDATION SET")
print("=" * 60)

val_loss, val_acc = model.evaluate(val_ds)
print(f"\nFinal Validation Loss: {val_loss:.4f}")
print(f"Final Validation Accuracy: {val_acc:.4f}")

# Predictions
y_true, y_pred = [], []
for images, labels in val_ds:
    preds = model.predict(images, verbose=0)
    y_true.extend(np.argmax(labels.numpy(), axis=1))
    y_pred.extend(np.argmax(preds, axis=1))

y_true = np.array(y_true)
y_pred = np.array(y_pred)

print("\n--- Validation Classification Report ---")
print(classification_report(y_true, y_pred, target_names=class_names, digits=4))

# Confusion matrix
cm = confusion_matrix(y_true, y_pred)
plt.figure(figsize=(max(12, NUM_CLASSES), max(10, NUM_CLASSES * 0.8)))
sns.heatmap(
    cm, annot=True, fmt="d", cmap="Blues",
    xticklabels=class_names, yticklabels=class_names,
)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix — Rice Disease Detection (Validation)")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig(os.path.join(SAVE_DIR, "confusion_matrix.png"), dpi=150)
plt.show()

# ============================================================
# 10. TRAINING HISTORY PLOTS
# ============================================================
def plot_history(h1, h2):
    acc = h1.history["accuracy"] + h2.history["accuracy"]
    val_acc = h1.history["val_accuracy"] + h2.history["val_accuracy"]
    loss = h1.history["loss"] + h2.history["loss"]
    val_loss = h1.history["val_loss"] + h2.history["val_loss"]
    epochs = range(1, len(acc) + 1)
    phase1_end = len(h1.history["accuracy"])

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    ax1.plot(epochs, acc, label="Train Accuracy")
    ax1.plot(epochs, val_acc, label="Val Accuracy")
    ax1.axvline(x=phase1_end, color="gray", linestyle="--", label="Fine-tune start")
    ax1.set_title("Accuracy")
    ax1.set_xlabel("Epoch")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(epochs, loss, label="Train Loss")
    ax2.plot(epochs, val_loss, label="Val Loss")
    ax2.axvline(x=phase1_end, color="gray", linestyle="--", label="Fine-tune start")
    ax2.set_title("Loss")
    ax2.set_xlabel("Epoch")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.suptitle("Training History — Rice Disease Detection")
    plt.tight_layout()
    plt.savefig(os.path.join(SAVE_DIR, "training_history.png"), dpi=150)
    plt.show()

plot_history(history1, history2)

# ============================================================
# 11. SAVE FINAL MODEL
# ============================================================
final_keras_path = os.path.join(SAVE_DIR, "rice_disease_model_final.keras")
model.save(final_keras_path)
print(f"\nModel saved to: {final_keras_path}")

# Save class names
labels_path = os.path.join(SAVE_DIR, "class_labels.txt")
with open(labels_path, "w") as f:
    f.write("\n".join(class_names))
print(f"Class labels saved to: {labels_path}")

# ============================================================
# 12. CONVERT TO TFLITE
# ============================================================
print("\nConverting to TFLite...")

# Since augmentation is NOT part of the model (applied via dataset .map()),
# we can convert the trained model directly — no weight transfer needed.
mixed_precision.set_global_policy('float32')

# Cast all weights to float32 for TFLite compatibility
for layer in model.layers:
    ws = layer.get_weights()
    if ws:
        layer.set_weights([w.astype('float32') if hasattr(w, 'astype') else w for w in ws])

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float32]

tflite_model = converter.convert()
tflite_path = os.path.join(SAVE_DIR, "rice_disease_model.tflite")
with open(tflite_path, "wb") as f:
    f.write(tflite_model)

print(f"TFLite saved: {tflite_path} ({os.path.getsize(tflite_path) / (1024*1024):.2f} MB)")

# ============================================================
# 13. VERIFY TFLITE MODEL
# ============================================================
interpreter = tf.lite.Interpreter(model_path=tflite_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"\nTFLite input shape:  {input_details[0]['shape']}")
print(f"TFLite output shape: {output_details[0]['shape']}")
print(f"TFLite input dtype:  {input_details[0]['dtype']}")

# Quick inference test
for images, labels in val_ds.take(1):
    sample = tf.cast(images[0:1], input_details[0]['dtype']).numpy()
    interpreter.resize_tensor_input(input_details[0]['index'], sample.shape)
    interpreter.allocate_tensors()
    interpreter.set_tensor(input_details[0]['index'], sample)
    interpreter.invoke()
    output = interpreter.get_tensor(output_details[0]['index'])
    pred_class = class_names[np.argmax(output)]
    true_class = class_names[np.argmax(labels[0].numpy())]
    print(f"TFLite test — True: {true_class}, Predicted: {pred_class}")

print("\n" + "=" * 60)
print("TRAINING COMPLETE. Artifacts saved in:", SAVE_DIR)
print("=" * 60)

# ============================================================
# 14. TEST ON EXTERNAL DATASET (ikkiocean/paddy-disease-dataset)
# ============================================================
print("\n" + "=" * 60)
print("TESTING ON EXTERNAL DATASET (ikkiocean/paddy-disease-dataset)")
print("=" * 60)

ext_dataset_path = kagglehub.dataset_download("ikkiocean/paddy-disease-dataset")
print(f"External dataset downloaded to: {ext_dataset_path}")

# Find the folder with class subfolders
ext_data_dir = None
for root, dirs, files in os.walk(ext_dataset_path):
    valid_dirs = [d for d in dirs if not d.startswith('.')
                  and d not in ('train', 'test', 'train_images', 'test_images')]
    if len(valid_dirs) >= 3:
        has_images = any(
            any(f.lower().endswith(('.jpg', '.jpeg', '.png'))
                for f in os.listdir(os.path.join(root, d)))
            for d in valid_dirs if os.path.isdir(os.path.join(root, d))
        )
        if has_images:
            ext_data_dir = root
            break

# Fallback: try common subfolder names
if ext_data_dir is None:
    for candidate in ['train_images', 'test_images', 'train', 'test', 'val']:
        candidate_path = os.path.join(ext_dataset_path, candidate)
        if os.path.isdir(candidate_path):
            subdirs = [d for d in os.listdir(candidate_path)
                       if os.path.isdir(os.path.join(candidate_path, d))]
            if len(subdirs) >= 3:
                ext_data_dir = candidate_path
                break

if ext_data_dir is None:
    ext_data_dir = ext_dataset_path

print(f"External data directory: {ext_data_dir}")

# List external dataset classes
ext_classes = sorted([
    d for d in os.listdir(ext_data_dir)
    if os.path.isdir(os.path.join(ext_data_dir, d)) and not d.startswith('.')
])
print(f"\nExternal dataset classes ({len(ext_classes)}):")
for c in ext_classes:
    count = len([f for f in os.listdir(os.path.join(ext_data_dir, c))
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    print(f"  {c}: {count} images")

# Map external classes to model classes (fuzzy matching)
def normalize(name):
    return name.lower().replace(' ', '_').replace('-', '_').strip()

ext_class_mapping = {}  # ext_class -> model_class_index
for ext_class in ext_classes:
    ext_norm = normalize(ext_class)
    for idx, model_class in enumerate(class_names):
        model_norm = normalize(model_class)
        if ext_norm == model_norm or ext_norm in model_norm or model_norm in ext_norm:
            ext_class_mapping[ext_class] = idx
            break
    else:
        print(f"  WARNING: No model match for external class '{ext_class}'")

print(f"\nMapped {len(ext_class_mapping)}/{len(ext_classes)} external classes:")
for ext_class, model_idx in ext_class_mapping.items():
    print(f"  {ext_class} -> {class_names[model_idx]} (index {model_idx})")

# Run TFLite inference on external dataset
from PIL import Image

MAX_PER_CLASS = 100  # Limit per class

ext_y_true = []
ext_y_pred = []
ext_y_conf = []
ext_total = 0
ext_correct = 0

print(f"\nRunning TFLite inference on external dataset (max {MAX_PER_CLASS} per class)...")

for ext_class, model_idx in ext_class_mapping.items():
    class_dir = os.path.join(ext_data_dir, ext_class)
    images = [f for f in os.listdir(class_dir)
              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
    images = images[:MAX_PER_CLASS]

    class_correct = 0
    for img_name in images:
        img_path = os.path.join(class_dir, img_name)
        try:
            # Preprocess: resize to 224x224, scale to [0, 255] (EfficientNet built-in preprocessing)
            img = Image.open(img_path).convert('RGB')
            img = img.resize((IMG_SIZE, IMG_SIZE))
            arr = np.array(img, dtype=np.float32)
            sample = np.expand_dims(arr, axis=0)

            interpreter.resize_tensor_input(input_details[0]['index'], sample.shape)
            interpreter.allocate_tensors()
            interpreter.set_tensor(input_details[0]['index'], sample)
            interpreter.invoke()
            output = interpreter.get_tensor(output_details[0]['index'])

            probs = output[0]
            pred_idx = np.argmax(probs)
            confidence = probs[pred_idx]

            ext_y_true.append(model_idx)
            ext_y_pred.append(pred_idx)
            ext_y_conf.append(confidence)

            ext_total += 1
            if pred_idx == model_idx:
                ext_correct += 1
                class_correct += 1
        except Exception as e:
            print(f"  Error on {img_path}: {e}")

    acc = class_correct / len(images) * 100 if images else 0
    print(f"  {ext_class}: {class_correct}/{len(images)} correct ({acc:.1f}%)")

# External dataset results
print("\n" + "=" * 60)
print("EXTERNAL DATASET RESULTS")
print("=" * 60)
print(f"Overall Accuracy: {ext_correct}/{ext_total} ({ext_correct/ext_total*100:.1f}%)")
print(f"Average Confidence: {np.mean(ext_y_conf):.3f}")

# Classification report for external dataset
ext_tested_indices = sorted(set(ext_y_true + ext_y_pred))
ext_tested_names = [class_names[i] for i in ext_tested_indices]

idx_map = {old: new for new, old in enumerate(ext_tested_indices)}
ext_y_true_mapped = [idx_map[y] for y in ext_y_true]
ext_y_pred_mapped = [idx_map[y] for y in ext_y_pred]

print("\n--- External Dataset Classification Report ---")
print(classification_report(ext_y_true_mapped, ext_y_pred_mapped,
                            target_names=ext_tested_names, digits=4))

# Confusion matrix for external dataset
ext_cm = confusion_matrix(ext_y_true_mapped, ext_y_pred_mapped)
plt.figure(figsize=(max(10, len(ext_tested_names)), max(8, len(ext_tested_names) * 0.8)))
sns.heatmap(ext_cm, annot=True, fmt="d", cmap="Oranges",
            xticklabels=ext_tested_names, yticklabels=ext_tested_names)
plt.xlabel("Predicted")
plt.ylabel("True")
plt.title("Confusion Matrix — Disease Model on External Dataset (ikkiocean)")
plt.xticks(rotation=45, ha='right')
plt.tight_layout()
plt.savefig(os.path.join(SAVE_DIR, "external_confusion_matrix.png"), dpi=150)
plt.show()

# Confidence distribution
plt.figure(figsize=(10, 4))
plt.hist(ext_y_conf, bins=50, edgecolor='black', alpha=0.7)
plt.xlabel("Confidence")
plt.ylabel("Count")
plt.title("External Dataset — Prediction Confidence Distribution")
plt.axvline(x=0.6, color='red', linestyle='--', label='App threshold (60%)')
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(SAVE_DIR, "external_confidence_distribution.png"), dpi=150)
plt.show()

print("\n" + "=" * 60)
print("ALL DONE!")
print("=" * 60)
print(f"\nFiles in {SAVE_DIR}/:")
for f in sorted(os.listdir(SAVE_DIR)):
    size = os.path.getsize(os.path.join(SAVE_DIR, f))
    print(f"  {f} ({size / (1024*1024):.2f} MB)" if size > 1024*1024 else f"  {f} ({size / 1024:.1f} KB)")
