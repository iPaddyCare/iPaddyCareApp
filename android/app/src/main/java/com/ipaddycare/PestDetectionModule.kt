package com.ipaddycare

import android.content.res.AssetManager
import android.util.Log
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.DataType
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.max
import kotlin.math.min

class PestDetectionModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var diseaseInterpreter: Interpreter? = null
    private var pestInterpreter: Interpreter? = null

    private val DISEASE_MODEL = "rice_disease_model.tflite"
    private val PEST_MODEL = "rice_pest_model.tflite"
    private val INPUT_SIZE = 224
    private val CHANNELS = 3
    private val DISEASE_NUM_CLASSES = 10
    private val PEST_NUM_CLASSES = 12
    private val EXPECTED_INPUT_SIZE = INPUT_SIZE * INPUT_SIZE * CHANNELS

    override fun getName() = "PestDetectionModule"

    // ------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------
    @ReactMethod
    fun initializeModel(promise: Promise) {
        try {
            val assetManager: AssetManager = reactApplicationContext.assets

            // Load disease model
            if (diseaseInterpreter == null) {
                diseaseInterpreter = loadModel(assetManager, DISEASE_MODEL)
                Log.d("PestDetection", "Disease model loaded")
            }

            // Load pest model
            if (pestInterpreter == null) {
                pestInterpreter = loadModel(assetManager, PEST_MODEL)
                Log.d("PestDetection", "Pest model loaded")
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message, e)
        }
    }

    private fun loadModel(assetManager: AssetManager, modelName: String): Interpreter {
        val inputStream = assetManager.open("models/$modelName")
        val modelFile = File(reactApplicationContext.filesDir, modelName)
        FileOutputStream(modelFile).use { inputStream.copyTo(it) }
        inputStream.close()

        val options = Interpreter.Options().apply {
            setNumThreads(4)
        }

        val interpreter = Interpreter(modelFile, options)

        val inputTensor = interpreter.getInputTensor(0)
        val outputTensor = interpreter.getOutputTensor(0)

        require(inputTensor.dataType() == DataType.FLOAT32) {
            "Model input must be FLOAT32"
        }

        Log.d("PestDetection", "$modelName input shape: ${inputTensor.shape().contentToString()}")
        Log.d("PestDetection", "$modelName output shape: ${outputTensor.shape().contentToString()}")

        return interpreter
    }

    // ------------------------------------------------------------
    // PREDICT (disease model - backward compatible)
    // ------------------------------------------------------------
    @ReactMethod
    fun predict(tensorData: ReadableArray, promise: Promise) {
        runInference(tensorData, diseaseInterpreter, DISEASE_NUM_CLASSES, "disease", promise)
    }

    // ------------------------------------------------------------
    // PREDICT PEST
    // ------------------------------------------------------------
    @ReactMethod
    fun predictPest(tensorData: ReadableArray, promise: Promise) {
        runInference(tensorData, pestInterpreter, PEST_NUM_CLASSES, "pest", promise)
    }

    // ------------------------------------------------------------
    // SHARED INFERENCE
    // ------------------------------------------------------------
    private fun runInference(
        tensorData: ReadableArray,
        interpreter: Interpreter?,
        numClasses: Int,
        modelType: String,
        promise: Promise
    ) {
        try {
            val tflite = interpreter
                ?: throw IllegalStateException("$modelType model not initialized")

            val size = tensorData.size()
            if (size != EXPECTED_INPUT_SIZE) {
                throw IllegalArgumentException(
                    "Invalid input size: $size (expected $EXPECTED_INPUT_SIZE)"
                )
            }

            // Allocate input buffer
            val inputBuffer = ByteBuffer
                .allocateDirect(4 * EXPECTED_INPUT_SIZE)
                .order(ByteOrder.nativeOrder())

            var minVal = Float.MAX_VALUE
            var maxVal = -Float.MAX_VALUE
            var sum = 0f

            for (i in 0 until size) {
                val v = tensorData.getDouble(i).toFloat()
                inputBuffer.putFloat(v)
                minVal = min(minVal, v)
                maxVal = max(maxVal, v)
                sum += v
            }

            inputBuffer.rewind()

            Log.d(
                "PestDetection",
                "$modelType input stats → min=$minVal max=$maxVal mean=${sum / size}"
            )

            // Output
            val outputBuffer = ByteBuffer
                .allocateDirect(4 * numClasses)
                .order(ByteOrder.nativeOrder())

            tflite.run(inputBuffer, outputBuffer)

            outputBuffer.rewind()

            val logits = FloatArray(numClasses)
            for (i in 0 until numClasses) {
                logits[i] = outputBuffer.getFloat()
            }

            Log.d("PestDetection", "$modelType logits: ${logits.joinToString()}")

            val result = Arguments.createMap()
            val arr = Arguments.createArray()
            logits.forEach { arr.pushDouble(it.toDouble()) }

            result.putArray("logits", arr)
            result.putString("modelType", modelType)
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("PREDICT_ERROR", e.message, e)
        }
    }
}
