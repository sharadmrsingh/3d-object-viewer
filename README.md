# 🖼️ Three.js 3D Object Viewer

A browser-based 3D model viewer built with **React + Three.js**, featuring file uploads, interaction controls, and persistent state saving.  

---

## 🚀 Features

### 🔹 Upload & View Models
- Supports `.glb`, `.gltf`, `.obj` file formats
- Drag & drop or file input upload
- Automatic scaling & centering of models
- Fit-to-view & Center model options

### 🔹 Object Manipulation
- Rotate, pan, and zoom with mouse
- Smooth interaction using OrbitControls

### 🔹 Scene Controls
- Toggle **grid** and **axes helpers**
- Change **background color**
- Scene lighting: hemisphere + directional light

### 🔹 State Persistence
- Save & restore **camera and interaction states** (via localStorage)  
  Stores:
  - Camera position & rotation
  - Camera FOV
  - Controls target
  - Grid / axes visibility
  - Background color
- Save & restore the **last uploaded model** (via IndexedDB)  
  - Checkbox option: “Save last model in browser”  
  - Button to restore the last model  
  - Button to clear stored model  

### 🔹 User Interface
- Sidebar panel for controls
- File upload input + drag-and-drop area
- Interactive state list with restore & delete actions
- Status messages for user feedback

---

## 🛠️ Project Structure

```text
frontend/
├── public/          # Static assets
├── src/
│   ├── App.js       # Main React component with Three.js viewer
│   ├── index.js     # React entry point
│   └── styles.css   # Styling
├── package.json
└── ...

---

## 📦 Installation & Usage

Clone the repo and run the frontend:

```bash
cd frontend
npm install
npm start
Open: http://localhost:3000

💾 Persistence Details

Saved States
Stored in localStorage under the key three_viewer_states_v1.
Includes camera settings, controls target, grid/axes visibility, and background color.

Saved Model
Stored in IndexedDB (three_viewer_db.models.lastModel_v1).
Keeps the last uploaded model available across sessions until cleared.