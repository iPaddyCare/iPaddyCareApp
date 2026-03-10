"""
Rice Disease Detection - Complete Training Pipeline
EfficientNetB0 Transfer Learning | TFLite Export | Google Colab Ready
Dataset: Paddy Doctor (imbikramsaha/paddy-doctor)

Outputs: rice_disease_model.tflite, class_labels.txt, test_results.csv
"""

# ============================================================
# 1. IMPORTS & SETUP
# ============================================================
import os
import csv
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, callbacks, mixed_precision
from tensorflow.keras.applications import EfficientNetB0
from sklearn.metrics import classification_report
from sklearn.utils.class_weight import compute_class_weight
from collections import Counter

# Enable mixed precision for GPU speed
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

# train_images/ has labeled class subfolders
# test_images/ is unlabeled (for Kaggle submission), so we skip it
data_dir = os.path.join(dataset_path, "train_images")
if not os.path.isdir(data_dir):
    for root, dirs, files in os.walk(dataset_path):
        if "train_images" in dirs:
            data_dir = os.path.join(root, "train_images")
            break
    else:
        raise RuntimeError(f"Could not find train_images/ in {dataset_path}")

print(f"Using data directory: {data_dir}")

# Auto-discover class folders
class_names = sorted([
    d for d in os.listdir(data_dir)
    if os.path.isdir(os.path.join(data_dir, d)) and not d.startswith('.')
])
print(f"\nClasses found ({len(class_names)}): {class_names}")

for f in class_names:
    count = len(os.listdir(os.path.join(data_dir, f)))
    print(f"  {f}: {count} images")

# ============================================================
# 3. DATA LOADING — 80% TRAIN, 10% VAL, 10% TEST
# ============================================================
IMG_SIZE = 224
BATCH_SIZE = 64

# 80% train, 20% held out
train_ds = keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

held_out_ds = keras.utils.image_dataset_from_directory(
    data_dir,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    label_mode="categorical",
)

# Split the 20% held out into 10% val + 10% test
held_out_size = tf.data.experimental.cardinality(held_out_ds).numpy()
val_size = held_out_size // 2
val_ds = held_out_ds.take(val_size)
test_ds = held_out_ds.skip(val_size)

NUM_CLASSES = len(class_names)
print(f"\nNum classes: {NUM_CLASSES}")
print(f"Train batches: {tf.data.experimental.cardinality(train_ds).numpy()}")
print(f"Val batches:   {tf.data.experimental.cardinality(val_ds).numpy()}")
print(f"Test batches:  {tf.data.experimental.cardinality(test_ds).numpy()}")

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
    layers.RandomBrightness(0.15),
    layers.RandomTranslation(0.1, 0.1),
], name="data_augmentation")

# Prefetch only (no .cache() to avoid RAM crash on Colab)
train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)
test_ds = test_ds.prefetch(AUTOTUNE)

# ============================================================
# 6. BUILD MODEL (augmentation as GPU layer for speed)
# ============================================================
base_model = EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
)
base_model.trainable = False

inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = data_augmentation(inputs)
x = base_model(x, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(512, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(128, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.2)(x)
outputs = layers.Dense(NUM_CLASSES, activation="softmax", dtype="float32")(x)

model = keras.Model(inputs, outputs)
model.summary()

# ============================================================
# 7. PHASE 1 — TRAIN HEAD ONLY
# ============================================================
SAVE_DIR = "saved_models_disease"
os.makedirs(SAVE_DIR, exist_ok=True)

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=["accuracy"],
)

phase1_callbacks = [
    callbacks.EarlyStopping(
        monitor="val_accuracy", patience=5, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6, verbose=1
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

# Unfreeze last 50 layers for deeper fine-tuning
for layer in base_model.layers[:-50]:
    layer.trainable = False

trainable_params = sum(
    tf.reduce_prod(v.shape).numpy() for v in model.trainable_variables
)
total_params = model.count_params()
print(f"\nTrainable params after unfreezing: {trainable_params:,} / {total_params:,}")

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=1e-4),
    loss=keras.losses.CategoricalCrossentropy(label_smoothing=0.1),
    metrics=["accuracy"],
)

phase2_callbacks = [
    callbacks.EarlyStopping(
        monitor="val_accuracy", patience=10, restore_best_weights=True, mode="max"
    ),
    callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=4, min_lr=1e-7, verbose=1
    ),
]

print("\n" + "=" * 60)
print("PHASE 2: Fine-tuning top layers of EfficientNetB0")
print("=" * 60)

history2 = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=40,
    callbacks=phase2_callbacks,
    class_weight=class_weight_dict,
)

# ============================================================
# 9. VERIFY TRAINED MODEL ON TEST SET (before TFLite conversion)
# ============================================================
print("\n" + "=" * 60)
print("SANITY CHECK: Keras model accuracy on test set")
print("=" * 60)

keras_loss, keras_acc = model.evaluate(test_ds)
print(f"Keras model test accuracy: {keras_acc:.4f}")
print(f"Keras model test loss: {keras_loss:.4f}")

# ============================================================
# 10. CONVERT TO TFLITE
# ============================================================
print("\nConverting to TFLite...")

# Switch to float32 for clean export
mixed_precision.set_global_policy('float32')

# Build a completely fresh float32 model (no augmentation for inference)
# Trained model layers: [Input, Augmentation, EfficientNet, GAP, BN, Dropout, Dense, BN, Dropout, Dense]
# Export model layers:  [Input, EfficientNet, GAP, BN, Dropout, Dense, BN, Dropout, Dense]
export_base = EfficientNetB0(
    include_top=False, weights="imagenet", input_shape=(IMG_SIZE, IMG_SIZE, 3),
)
export_inputs = keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = export_base(export_inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.4)(x)
x = layers.Dense(512, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(128, activation="relu")(x)
x = layers.BatchNormalization()(x)
x = layers.Dropout(0.2)(x)
export_outputs = layers.Dense(NUM_CLASSES, activation="softmax")(x)
export_model = keras.Model(export_inputs, export_outputs)

# Transfer weights by position: export[1:] ↔ trained[2:] (skip augmentation)
# Cast all weights to float32 to avoid f16 conversion errors
transferred = 0
skipped = 0
for export_layer, trained_layer in zip(export_model.layers[1:], model.layers[2:]):
    trained_weights = trained_layer.get_weights()
    if trained_weights:
        try:
            float32_weights = [w.astype('float32') for w in trained_weights]
            export_layer.set_weights(float32_weights)
            transferred += 1
        except Exception as e:
            print(f"  Warning: Could not transfer {trained_layer.name} -> {export_layer.name}: {e}")
            skipped += 1

print(f"Transferred weights for {transferred} layers (skipped {skipped})")

# Verify export model matches trained model accuracy
export_model.compile(
    optimizer="adam",
    loss="categorical_crossentropy",
    metrics=["accuracy"],
)
print("\nVerifying export model on test set...")
export_loss, export_acc = export_model.evaluate(test_ds)
print(f"Export model test accuracy: {export_acc:.4f}")
print(f"Keras model test accuracy:  {keras_acc:.4f}")
print(f"Accuracy difference: {abs(keras_acc - export_acc):.4f}")

if abs(keras_acc - export_acc) > 0.05:
    print("WARNING: Export model accuracy differs by >5%! Check model structure.")

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(export_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float32]

tflite_model = converter.convert()
tflite_path = os.path.join(SAVE_DIR, "rice_disease_model.tflite")
with open(tflite_path, "wb") as f:
    f.write(tflite_model)

print(f"TFLite saved: {tflite_path} ({os.path.getsize(tflite_path) / (1024*1024):.2f} MB)")

# Save class labels
labels_path = os.path.join(SAVE_DIR, "class_labels.txt")
with open(labels_path, "w") as f:
    f.write("\n".join(class_names))
print(f"Class labels saved to: {labels_path}")

# ============================================================
# 11. TEST SET EVALUATION WITH TFLITE + CSV REPORT
# ============================================================
print("\n" + "=" * 60)
print("TEST SET EVALUATION (TFLite Inference)")
print("=" * 60)

interpreter = tf.lite.Interpreter(model_path=tflite_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

print(f"TFLite input shape:  {input_details[0]['shape']}")
print(f"TFLite output shape: {output_details[0]['shape']}")
print(f"TFLite input dtype:  {input_details[0]['dtype']}")

# Run inference on entire test set, collect per-sample results
csv_path = os.path.join(SAVE_DIR, "test_results.csv")
results = []
sample_idx = 0

for images, labels in test_ds:
    batch_size_actual = images.shape[0]
    for i in range(batch_size_actual):
        sample = tf.cast(images[i:i+1], input_details[0]['dtype']).numpy()
        interpreter.resize_tensor_input(input_details[0]['index'], sample.shape)
        interpreter.allocate_tensors()
        interpreter.set_tensor(input_details[0]['index'], sample)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])

        probs = output[0]
        pred_idx = int(np.argmax(probs))
        true_idx = int(np.argmax(labels[i].numpy()))
        confidence = float(probs[pred_idx]) * 100
        correct = pred_idx == true_idx

        results.append({
            'sample': sample_idx,
            'actual_class': class_names[true_idx],
            'predicted_class': class_names[pred_idx],
            'confidence_pct': round(confidence, 2),
            'correct': correct,
        })
        sample_idx += 1

# Write CSV
with open(csv_path, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['sample', 'actual_class', 'predicted_class', 'confidence_pct', 'correct'])
    writer.writeheader()
    writer.writerows(results)

# Print summary
total = len(results)
correct_count = sum(1 for r in results if r['correct'])
accuracy = correct_count / total * 100
avg_confidence = sum(r['confidence_pct'] for r in results) / total

print(f"\nTest samples: {total}")
print(f"Correct: {correct_count}/{total}")
print(f"Test Accuracy: {accuracy:.2f}%")
print(f"Average Confidence: {avg_confidence:.2f}%")

# Per-class breakdown
print("\nPer-class results:")
for cls in class_names:
    cls_results = [r for r in results if r['actual_class'] == cls]
    if cls_results:
        cls_correct = sum(1 for r in cls_results if r['correct'])
        cls_acc = cls_correct / len(cls_results) * 100
        cls_conf = sum(r['confidence_pct'] for r in cls_results) / len(cls_results)
        print(f"  {cls}: {cls_correct}/{len(cls_results)} ({cls_acc:.1f}%) avg conf: {cls_conf:.1f}%")

# Classification report
y_true = [class_names.index(r['actual_class']) for r in results]
y_pred = [class_names.index(r['predicted_class']) for r in results]
print("\n--- Test Set Classification Report ---")
print(classification_report(y_true, y_pred, target_names=class_names, digits=4))

print(f"\nCSV saved to: {csv_path}")

print("\n" + "=" * 60)
print("DONE. Output files:")
print(f"  - {tflite_path}")
print(f"  - {labels_path}")
print(f"  - {csv_path}")
print("=" * 60)
