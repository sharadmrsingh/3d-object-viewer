// src/App.js
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import "./App.css";

const STATES_KEY = "three_viewer_states_v1";
const MODEL_DB_NAME = "three_viewer_db";
const MODEL_STORE = "models";
const MODEL_KEY = "lastModel_v1";

function openModelDB() {
  return new Promise((resolve, reject) => {
    const rq = indexedDB.open(MODEL_DB_NAME, 1);
    rq.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(MODEL_STORE)) {
        db.createObjectStore(MODEL_STORE);
      }
    };
    rq.onsuccess = (e) => resolve(e.target.result);
    rq.onerror = (e) => reject(e.target.error);
  });
}
async function saveModelToIndexedDB(filename, mime, arrayBuffer) {
  try {
    const db = await openModelDB();
    const tx = db.transaction(MODEL_STORE, "readwrite");
    const store = tx.objectStore(MODEL_STORE);
    await new Promise((res, rej) => {
      const putReq = store.put({ filename, mime, data: arrayBuffer }, MODEL_KEY);
      putReq.onsuccess = () => res();
      putReq.onerror = () => rej(putReq.error);
    });
    tx.commit && tx.commit();
  } catch (err) {
    console.warn("Failed to save model to IndexedDB", err);
  }
}
async function getModelFromIndexedDB() {
  try {
    const db = await openModelDB();
    const tx = db.transaction(MODEL_STORE, "readonly");
    const store = tx.objectStore(MODEL_STORE);
    return await new Promise((res, rej) => {
      const r = store.get(MODEL_KEY);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  } catch (err) {
    console.warn("Failed to read model from IndexedDB", err);
    return null;
  }
}
async function clearModelFromIndexedDB() {
  try {
    const db = await openModelDB();
    const tx = db.transaction(MODEL_STORE, "readwrite");
    const store = tx.objectStore(MODEL_STORE);
    await new Promise((res, rej) => {
      const r = store.delete(MODEL_KEY);
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  } catch (err) {
    console.warn(err);
  }
}

function getSavedStates() {
  try {
    return JSON.parse(localStorage.getItem(STATES_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveStates(states) {
  localStorage.setItem(STATES_KEY, JSON.stringify(states || []));
}

function rgbToHex(color) {
  return "#" + color.getHexString();
}

function App() {
  // refs for DOM
  const canvasRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // three refs
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRootRef = useRef(null);
  const animRef = useRef(null);
  const gltfLoaderRef = useRef(null);
  const objLoaderRef = useRef(null);
  const resizeObserverRef = useRef(null);

  // UI states
  const [states, setStates] = useState(getSavedStates());
  const [message, setMessage] = useState("No model loaded.");
  const [persistModel, setPersistModel] = useState(false);
  const [gridVisible, setGridVisible] = useState(true);
  const [axesVisible, setAxesVisible] = useState(true);
  const [bgColor, setBgColor] = useState("#222222");
  const [stateName, setStateName] = useState("");

  // Initialize Three.js scene once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(new THREE.Color(bgColor));
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    camera.position.set(2, 2, 4);
    cameraRef.current = camera;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = false;
    controlsRef.current = controls;

    // Lights & helpers
    const grid = new THREE.GridHelper(10, 40, 0x333333, 0x202020);
    grid.visible = gridVisible;
    scene.add(grid);

    const axes = new THREE.AxesHelper(1.5);
    axes.visible = axesVisible;
    scene.add(axes);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7.5);
    dir.castShadow = true;
    scene.add(dir);

    // Model root
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);
    modelRootRef.current = modelRoot;

    // Loaders
    gltfLoaderRef.current = new GLTFLoader();
    objLoaderRef.current = new OBJLoader();

    // Resize handler using ResizeObserver on wrapper
    const resize = () => {
      const wrap = canvasWrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(300, rect.width);
      const height = Math.max(150, rect.height);
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    resizeObserverRef.current = new ResizeObserver(resize);
    if (canvasWrapRef.current) resizeObserverRef.current.observe(canvasWrapRef.current);
    window.addEventListener("resize", resize);
    resize();

    // Animation loop
    let mounted = true;
    const animate = () => {
      if (!mounted) return;
      animRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Clean up on unmount
    return () => {
      mounted = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      if (resizeObserverRef.current && canvasWrapRef.current) {
        try {
          resizeObserverRef.current.unobserve(canvasWrapRef.current);
        } catch { }
      }
      controls.dispose();
      renderer.dispose();
      // dispose scene geometries/materials if desired
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Keep grid axes and bg color in sync with three scene
  useEffect(() => {
    if (!sceneRef.current) return;
    // grid and axes are first two children added (we added them in order)
    try {
      const scene = sceneRef.current;
      // Find helpers
      scene.traverse((o) => {
        if (o.type === "GridHelper") o.visible = gridVisible;
        if (o.type === "AxesHelper") o.visible = axesVisible;
      });
    } catch { }
  }, [gridVisible, axesVisible]);

  useEffect(() => {
    if (!rendererRef.current) return;
    try {
      const col = new THREE.Color(bgColor);
      rendererRef.current.setClearColor(col);
    } catch { }
  }, [bgColor]);

  // helper: compute bounding box
  function computeBoundingBox(obj) {
    const box = new THREE.Box3();
    box.setFromObject(obj);
    return box;
  }
  function centerModel() {
    const modelRoot = modelRootRef.current;
    if (!modelRoot) return;
    const box = computeBoundingBox(modelRoot);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    modelRoot.position.sub(center);
    setMessage("Model centered.");
  }
  function fitToView() {
    const modelRoot = modelRootRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!modelRoot || !camera || !controls) return;
    const box = computeBoundingBox(modelRoot);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
    const dist = size * 1.2 || 2;
    camera.position.copy(center).addScaledVector(dir, dist);
    controls.target.copy(center);
    camera.near = Math.max(0.1, size / 1000);
    camera.far = Math.max(1000, size * 10);
    camera.updateProjectionMatrix();
    controls.update();
    setMessage("Fitted model to view.");
  }

  // load file (ArrayBuffer) into modelRoot
  async function loadFile(file) {
    if (!file) return;
    const name = file.name.toLowerCase();
    setMessage(`Loading ${file.name} ...`);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const modelRoot = modelRootRef.current;
      while (modelRoot.children.length) modelRoot.remove(modelRoot.children[0]);

      if (name.endsWith(".glb") || name.endsWith(".gltf")) {
        await new Promise((resolve, reject) => {
          gltfLoaderRef.current.parse(
            arrayBuffer,
            "",
            (gltf) => {
              modelRoot.add(gltf.scene || gltf.scenes[0]);
              resolve();
            },
            (err) => reject(err)
          );
        });
      } else if (name.endsWith(".obj")) {
        const text = new TextDecoder().decode(arrayBuffer);
        const obj = objLoaderRef.current.parse(text);
        modelRoot.add(obj);
      } else {
        throw new Error("Unsupported file type. Please upload .glb/.gltf/.obj");
      }

      // normalize scale if necessary
      const box = computeBoundingBox(modelRoot);
      if (!box.isEmpty()) {
        const size = box.getSize(new THREE.Vector3());
        const maxSide = Math.max(size.x, size.y, size.z);
        if (maxSide > 0) {
          const scale = 1 / maxSide;
          modelRoot.scale.setScalar(scale);
          centerModel();
        }
      }
      fitToView();
      setMessage(`Loaded ${file.name}.`);

      if (persistModel) {
        await saveModelToIndexedDB(
          file.name,
          file.type || (name.endsWith(".glb") ? "model/gltf-binary" : "text/plain"),
          arrayBuffer
        );
        setMessage(`Loaded ${file.name}. (also saved to browser storage)`);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error loading file: " + (err.message || err), true);
    }
  }

  // file input change
  const onFileInputChange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) loadFile(f);
    e.target.value = "";
  };

  // drag & drop handlers
  useEffect(() => {
    const dropEl = dropRef.current;
    if (!dropEl) return;
    const onDrag = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      dropEl.style.borderColor = "#444";
    };
    const onLeave = (e) => {
      e.preventDefault();
      dropEl.style.borderColor = "#222";
    };
    const onDrop = (e) => {
      e.preventDefault();
      dropEl.style.borderColor = "#222";
      const f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) loadFile(f);
    };
    ["dragenter", "dragover"].forEach((ev) => dropEl.addEventListener(ev, onDrag));
    ["dragleave", "dragend", "drop"].forEach((ev) => dropEl.addEventListener(ev, onLeave));
    dropEl.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover"].forEach((ev) => dropEl.removeEventListener(ev, onDrag));
      ["dragleave", "dragend", "drop"].forEach((ev) => dropEl.removeEventListener(ev, onLeave));
      dropEl.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropRef.current, persistModel]);

  // States management (save/restore/delete)
  function createStateObject(name) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;

    const bgColorObj = new THREE.Color();
    renderer.getClearColor(bgColorObj); // <-- pass in a Color object

    return {
      id: "s_" + Math.random().toString(36).slice(2, 9),
      name: name || "State " + new Date().toLocaleString(),
      camera: {
        position: camera.position.toArray(),
        quaternion: camera.quaternion.toArray(),
        fov: camera.fov,
      },
      controls: {
        target: controls.target.toArray(),
      },
      env: {
        background: "#" + bgColorObj.getHexString(), // consistent hex format
        grid: gridVisible,
        axes: axesVisible,
      },
      createdAt: new Date().toISOString(),
    };
  }

  function handleSaveState() {
    const s = createStateObject(stateName.trim() || null);
    const next = [s, ...getSavedStates()];
    saveStates(next);
    setStates(next);
    setStateName("");
    setMessage("State saved: " + s.name);
  }

  function handleRestoreState(id) {
    const saved = getSavedStates().find((x) => x.id === id);
    if (!saved) {
      setMessage("Saved state not found.", true);
      return;
    }
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    camera.position.fromArray(saved.camera.position);
    camera.quaternion.fromArray(saved.camera.quaternion);
    camera.fov = saved.camera.fov;
    camera.updateProjectionMatrix();
    controls.target.fromArray(saved.controls.target);
    controls.update();
    try {
      const color = new THREE.Color(saved.env.background);
      renderer.setClearColor(color, 1); // ensure alpha = 1
      setBgColor("#" + color.getHexString());
    } catch { }
    setGridVisible(!!saved.env.grid);
    setAxesVisible(!!saved.env.axes);
    setMessage("Restored state: " + saved.name);
  }

  function handleDeleteState(id) {
    const next = getSavedStates().filter((x) => x.id !== id);
    saveStates(next);
    setStates(next);
    setMessage("Deleted saved state.");
  }

  // Load model from IndexedDB
  async function handleRestoreModel() {
    const rec = await getModelFromIndexedDB();
    if (!rec) {
      setMessage("No stored model found.");
      return;
    }
    const blob = new Blob([rec.data], { type: rec.mime || "application/octet-stream" });
    const file = new File([blob], rec.filename || "model", { type: rec.mime || "" });
    await loadFile(file);
    setMessage("Restored model: " + (rec.filename || "stored model"));
  }
  async function handleClearModel() {
    await clearModelFromIndexedDB();
    setMessage("Cleared stored model.");
  }

  // On mount: set states list and check stored model
  useEffect(() => {
    setStates(getSavedStates());
    (async () => {
      try {
        const rec = await getModelFromIndexedDB();
        if (rec) {
          setMessage('Stored model available. Click "Restore Last Model" to load it.');
        } else {
          setMessage("No model loaded.");
        }
      } catch { }
    })();
  }, []);

  return (
    <div id="app">
      <aside className="panel" aria-label="Controls panel">
        <h1>3D Viewer</h1>

        <label>Upload 3D file (.glb/.gltf/.obj)</label>
        <input
          id="file-input"
          type="file"
          accept=".glb,.gltf,.obj"
          ref={fileInputRef}
          onChange={onFileInputChange}
        />

        <div id="drop" ref={dropRef}>
          or drag & drop a .glb/.gltf/.obj file here
        </div>

        <div className="row">
          <button id="btn-center" className="primary" onClick={centerModel}>
            Center Model
          </button>
          <button id="btn-fit" onClick={fitToView}>
            Fit to View
          </button>
        </div>

        <label>Display</label>
        <div className="controls-row">
          <label className="toggle">
            <input
              id="toggle-grid"
              type="checkbox"
              checked={gridVisible}
              onChange={(e) => setGridVisible(e.target.checked)}
            />{" "}
            Grid
          </label>
          <label className="toggle">
            <input
              id="toggle-axes"
              type="checkbox"
              checked={axesVisible}
              onChange={(e) => setAxesVisible(e.target.checked)}
            />{" "}
            Axes
          </label>
        </div>

        <label>Background</label>
        <div className="row">
          <input
            id="bg-color"
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />
        </div>

        <label style={{ marginTop: 10 }}>Save / Restore Camera & Interaction States</label>
        <div className="row">
          <input
            id="state-name"
            placeholder="name (e.g., front view)"
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #333",
              background: "transparent",
              color: "#fff",
            }}
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
          />
          <button id="btn-save-state" onClick={handleSaveState}>
            Save
          </button>
        </div>

        <div className="states" id="states-list" aria-live="polite">
          {states.length === 0 ? (
            <div className="small">No saved states yet.</div>
          ) : (
            states.map((s) => (
              <div className="state-item" key={s.id}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div className="small">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button onClick={() => handleRestoreState(s.id)}>Restore</button>
                  <button onClick={() => handleDeleteState(s.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>

        <label style={{ marginTop: 12 }}>Model Persistence</label>
        <div className="controls-row">
          <label className="toggle">
            <input
              id="persist-model"
              type="checkbox"
              checked={persistModel}
              onChange={(e) => setPersistModel(e.target.checked)}
            />{" "}
            Save last model in browser
          </label>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <button id="btn-restore-model" onClick={handleRestoreModel}>
            Restore Last Model
          </button>
          <button id="btn-clear-model" onClick={handleClearModel}>
            Clear Stored Model
          </button>
        </div>

        <div className="msg" id="message">
          {message}
        </div>
        <footer>
          Tip: rotate with mouse, zoom with scroll, pan with right-drag. Saved states are stored in
          localStorage.
        </footer>
      </aside>

      <main className="panel" id="main-panel" style={{ padding: 0 }}>
        <div id="canvas-wrap" ref={canvasWrapRef} style={{ height: "100%" }}>
          <canvas id="viewer" ref={canvasRef} />
        </div>
      </main>
    </div>
  );
}

export default App;
