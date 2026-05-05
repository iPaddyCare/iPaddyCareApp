import React, { useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';

/**
 * 3D Model Viewer — renders a GLB file using Three.js in a WebView
 * @param {string} modelPath - Local file path to the GLB model
 * @param {number} height - Height of the viewer
 */
export default function ModelViewer({ modelPath, height = 280 }) {
  const htmlContent = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: radial-gradient(ellipse at center, #1a2a1a 0%, #0a0f0a 100%);
      overflow: hidden;
      touch-action: none;
    }
    canvas { display: block; width: 100vw; height: 100vh; }
    #loading {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      color: #4CAF50; font-family: sans-serif; font-size: 14px;
      text-align: center;
    }
    #hint {
      position: absolute; bottom: 12px; left: 0; right: 0;
      text-align: center; color: rgba(255,255,255,0.4);
      font-family: sans-serif; font-size: 11px;
    }
  </style>
</head>
<body>
  <div id="loading">Loading 3D model...</div>
  <div id="hint">Drag to rotate • Pinch to zoom</div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
    }
  }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.8, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x4CAF50, 0.3);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);

    // Ground ring
    const ringGeo = new THREE.RingGeometry(0.6, 1.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4CAF50, transparent: true, opacity: 0.15, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.01;
    scene.add(ring);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.5;
    controls.target.set(0, 0.4, 0);

    // Load model
    const loader = new GLTFLoader();

    // We'll receive the model data via postMessage
    window.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'loadModel' && msg.base64) {
          const binary = atob(msg.base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          loader.parse(bytes.buffer, '', (gltf) => {
            const model = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.5 / maxDim;

            model.scale.setScalar(scale);
            model.position.sub(center.multiplyScalar(scale));
            model.position.y += 0.3;

            scene.add(model);
            document.getElementById('loading').style.display = 'none';
          }, (error) => {
            document.getElementById('loading').textContent = 'Failed to load model';
            console.error(error);
          });
        }
      } catch (e) {
        console.error('Message parse error:', e);
      }
    });

    // Fallback: try loading from URL
    function loadFromUrl(url) {
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y += 0.3;
        scene.add(model);
        document.getElementById('loading').style.display = 'none';
      });
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;
  }, []);

  const webViewRef = React.useRef(null);

  // When modelPath changes, load it into the WebView
  React.useEffect(() => {
    if (modelPath && webViewRef.current) {
      loadModel();
    }
  }, [modelPath]);

  const loadModel = async () => {
    try {
      const base64 = await RNFS.readFile(modelPath, 'base64');
      // Send model data to WebView via postMessage
      // Split into chunks if too large
      const chunkSize = 500000; // 500KB chunks
      if (base64.length > chunkSize) {
        // For large models, send in chunks
        const chunks = [];
        for (let i = 0; i < base64.length; i += chunkSize) {
          chunks.push(base64.substring(i, i + chunkSize));
        }
        // Reconstruct in WebView
        webViewRef.current?.injectJavaScript(`
          window._modelChunks = [];
          true;
        `);
        for (const chunk of chunks) {
          webViewRef.current?.injectJavaScript(`
            window._modelChunks.push('${chunk}');
            true;
          `);
        }
        webViewRef.current?.injectJavaScript(`
          const fullBase64 = window._modelChunks.join('');
          window.postMessage(JSON.stringify({ type: 'loadModel', base64: fullBase64 }));
          delete window._modelChunks;
          true;
        `);
      } else {
        webViewRef.current?.injectJavaScript(`
          window.postMessage(JSON.stringify({ type: 'loadModel', base64: '${base64}' }));
          true;
        `);
      }
    } catch (e) {
      console.error('Failed to load model into viewer:', e);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoad={loadModel}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowFileAccess={true}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0a0f0a',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
