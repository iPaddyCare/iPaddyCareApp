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

    private var interpreter: Interpreter? = null

    private val MODEL_NAME = "pest_disease_detection_model.tflite"
    private val INPUT_SIZE = 224
    private val CHANNELS = 3
    private val NUM_CLASSES = 10
    private val EXPECTED_INPUT_SIZE = INPUT_SIZE * INPUT_SIZE * CHANNELS

    override fun getName() = "PestDetectionModule"

    // ------------------------------------------------------------
    // INIT
    // ------------------------------------------------------------
    @ReactMethod
    fun initializeModel(promise: Promise) {
        try {
            if (interpreter != null) {
                promise.resolve(true)
                return
            }

            val assetManager: AssetManager = reactApplicationContext.assets
            val inputStream = assetManager.open("models/$MODEL_NAME")

            val modelFile = File(reactApplicationContext.filesDir, MODEL_NAME)
            FileOutputStream(modelFile).use { inputStream.copyTo(it) }
            inputStream.close()

            val options = Interpreter.Options().apply {
                setNumThreads(4)
            }

            interpreter = Interpreter(modelFile, options)

            val inputTensor = interpreter!!.getInputTensor(0)
            val outputTensor = interpreter!!.getOutputTensor(0)

            require(inputTensor.dataType() == DataType.FLOAT32) {
                "Model input must be FLOAT32"
            }

            Log.d("PestDetection", "Input shape: ${inputTensor.shape().contentToString()}")
            Log.d("PestDetection", "Output shape: ${outputTensor.shape().contentToString()}")

            promise.resolve(true)

        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message, e)
        }
    }

    // ------------------------------------------------------------
    // PREDICT
    // ------------------------------------------------------------
    @ReactMethod
    fun predict(tensorData: ReadableArray, promise: Promise) {
        try {
            val tflite = interpreter
                ?: throw IllegalStateException("Model not initialized")

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

            // --------------------------------------------------------
            // WRITE FLOATS SAFELY (NO FloatBuffer)
            // --------------------------------------------------------
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
                "Input stats → min=$minVal max=$maxVal mean=${sum / size}"
            )

            // --------------------------------------------------------
            // OUTPUT
            // --------------------------------------------------------
            val outputBuffer = ByteBuffer
                .allocateDirect(4 * NUM_CLASSES)
                .order(ByteOrder.nativeOrder())

            tflite.run(inputBuffer, outputBuffer)

            outputBuffer.rewind()

            val logits = FloatArray(NUM_CLASSES)
            for (i in 0 until NUM_CLASSES) {
                logits[i] = outputBuffer.getFloat()
            }

            Log.d("PestDetection", "Logits: ${logits.joinToString()}")

            val result = Arguments.createMap()
            val arr = Arguments.createArray()
            logits.forEach { arr.pushDouble(it.toDouble()) }

            result.putArray("logits", arr)
            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("PREDICT_ERROR", e.message, e)
        }
    }
}
