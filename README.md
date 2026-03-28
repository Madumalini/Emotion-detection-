# EMZY • Emotion Music Website

A website that recommends music and plays local audio files based on emotion selection.

## 📦 Tech Stack
- **Frontend**: HTML, CSS, JavaScript, EJS templates
- **Backend**: Node.js + Express (server)
- **Authentication**: Simple in-memory login (Name + Date of Birth)
- **Camera Access**: Browser WebRTC (getUserMedia)

## ✅ Prerequisites
- Node.js (14+)

## 🚀 Running Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Node.js web server:
   ```bash
   npm start
   ```
3. Open in browser:
   - Website: http://localhost:3000

## 🧠 How It Works
- **Login/Register**: Users register with a name and date of birth (hashed in memory).
- **Emotion Detection**: The app returns a placeholder emotion internally.
- **Music Recommendation**: Based on the selected emotion, the site displays recommended songs.

## 📌 Notes
- This is a website-only version; no Python backend is required.
- User accounts are stored in memory and reset when the server restarts.

### 🎵 Custom Songs
The app recommends songs based on the detected emotion. To use your own tracks:
1. Place your audio files in `public/songs`.
2. Update the file names in `views/dashboard.ejs` (function `getSongsForEmotion`).

By default, the app expects:
- **Happy** → `public/songs/oorum-blood-unplugged.mp3`
- **Sad** → `public/songs/marana-mass-satisfy.mpeg`

## 🧪 Troubleshooting
- If the app can’t access the camera, ensure your browser is allowed to use the webcam.

## 📦 Project Structure
- `server.js` – Node/Express server
- `views/` – EJS templates for login/register/dashboard
- `public/` – Static assets (CSS, audio files, etc.)
