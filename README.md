# 🖼️ Three.js 3D Object Viewer

A browser-based 3D model viewer built with **React + Three.js**, featuring file uploads, interaction controls, and persistent state saving.  

---

## 🔵 Website Output
<img width="1366" height="768" alt="1Empty" src="https://github.com/user-attachments/assets/ffdac421-718a-4563-8c45-f0859f12e3bb" />
<img width="1366" height="768" alt="2CarObjectUploaded" src="https://github.com/user-attachments/assets/42c1479f-b480-4d71-aad4-b4c1deb3951e" />
<img width="1366" height="768" alt="3AxesUncheck" src="https://github.com/user-attachments/assets/5edaf21b-a088-4511-a76a-c0e30a217c76" />
<img width="1366" height="768" alt="4GridUncheck" src="https://github.com/user-attachments/assets/012d4db3-84d1-4db3-b77b-4a5b4c4d8e24" />
<img width="1366" height="768" alt="5BgColorChange" src="https://github.com/user-attachments/assets/cef79d7f-3e07-47e0-b3de-5bfb77069cc8" />
<img width="1366" height="768" alt="6RearViewInteractionStateInputted" src="https://github.com/user-attachments/assets/1bab83bd-09ea-4b73-aa1c-dd46052f64d2" />
<img width="1366" height="768" alt="7RearViewInteractionStateSaved" src="https://github.com/user-attachments/assets/d89b9efc-c98c-4e53-9657-23546a9392b0" />
<img width="1366" height="768" alt="8PositionChangeToBackview" src="https://github.com/user-attachments/assets/c1e3b35f-e280-45a0-b614-59bd8cecb797" />
<img width="1366" height="768" alt="9RestoredRearViewSavedState" src="https://github.com/user-attachments/assets/bf2db021-1f3a-43fb-a2da-93b2db18584b" />
<img width="1366" height="768" alt="10EmptyBottom" src="https://github.com/user-attachments/assets/38a8cb6a-0d87-4dec-817f-8d53ba793696" />
<img width="1366" height="768" alt="11BottomSaveLastModelInBrowserChecked" src="https://github.com/user-attachments/assets/320c9611-607a-41d7-ad6f-4326dff5f926" />
<img width="1366" height="768" alt="12SwordObjectUploaded" src="https://github.com/user-attachments/assets/be9aa7ae-e0ed-4024-bbc0-48bf72b8e751" />
<img width="1366" height="768" alt="13BottomSaveLastModelInBrowserUnChecked" src="https://github.com/user-attachments/assets/04a51a6d-cdff-4cc8-a004-2b53a9c6e42a" />
<img width="1366" height="768" alt="14AgainCarObjectUploaded" src="https://github.com/user-attachments/assets/15b324f5-b7fe-400c-b2ba-37af12eb8902" />
<img width="1366" height="768" alt="15RestoreLastModelClickedAndSwordComes" src="https://github.com/user-attachments/assets/697f9edc-52c0-47f1-8b4c-213d1a0a11d5" />

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
```

---

## 📦 Installation & Usage

Clone the repo and run the frontend:

```bash
cd frontend
npm install
npm start
Open: http://localhost:3000
```

💾 Persistence Details

Saved States
Stored in localStorage under the key three_viewer_states_v1.
Includes camera settings, controls target, grid/axes visibility, and background color.

Saved Model
Stored in IndexedDB (three_viewer_db.models.lastModel_v1).
Keeps the last uploaded model available across sessions until cleared.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](../../issues) if you want to contribute.  

### How to Contribute
1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the project’s coding style and includes relevant updates to documentation.

---

## 📜 License

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.
