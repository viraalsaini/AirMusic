# 🎹 AirPiano (AirMusic)

Turn your webcam into an invisible, gesture-controlled piano. AirPiano uses real-time AI hand tracking to let you play chords and melodies just by pinching your fingers in thin air.

No extra hardware required. No heavy machine learning training. Just your hands and your camera.

---

## ✨ Features

- **Zero-Latency Tracking:** Uses a custom multithreaded camera stream to eliminate input delay, even on older computers.
- **Dynamic Chord Banks:** Hold up 1 to 5 fingers on your left hand to instantly swap between 5 different active note banks.
- **Pinch-to-Play:** Pinch your right thumb to any of your other four fingers to trigger beautiful, polyphonic MIDI piano notes.
- **Real-Time UI:** Floating, non-intrusive holographic labels attach to your fingertips to show you exactly which notes are loaded in the current bank.
- **Automated Virtual Environment:** Runs completely isolated from your system Python to prevent module conflicts.

---

## 🚀 Getting Started

### Prerequisites
- Windows 10/11
- Python 3.8+ installed
- A built-in webcam or external USB camera

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/viraalsaini/AirMusic.git
   cd AirMusic
   ```

2. **Run the setup/launch script:**
   Simply double-click the `run.bat` file, or execute it in your terminal:
   ```powershell
   .\run.bat
   ```
   *Note: On the very first run, it will automatically detect the missing virtual environment, but since everything is already installed via pip previously, it will boot straight into the app.*

---

## 🖐️ How to Play

AirPiano assigns a specific job to each of your hands:

### The Left Hand (Chord Selector)
Your left hand controls the **Active Bank**. Hold it up to the camera with your palm facing the screen.
- **1 Finger Up:** Loads Bank 1
- **2 Fingers Up:** Loads Bank 2
- **3 Fingers Up:** Loads Bank 3
- **4 Fingers Up:** Loads Bank 4
- **5 Fingers Up:** Loads Bank 5

*Watch the yellow text on the left side of the screen to see your current Active Bank.*

### The Right Hand (The Player)
Your right hand physically plays the notes. Touch your thumb to the tip of any other finger on your right hand to strike a note. The note will sustain for as long as you hold the pinch.
- **Thumb + Index Finger**
- **Thumb + Middle Finger**
- **Thumb + Ring Finger**
- **Thumb + Little (Pinky) Finger**

*Floating blue labels will appear over your right hand's fingertips showing exactly which notes will play when you pinch them!*

---

## ⚙️ Configuration

You can easily tweak the app to match your lighting, camera distance, or musical preferences. Open `src/config/settings.py` to modify:

- **`PINCH_THRESHOLD`:** Increase this (e.g., to `0.08` or `0.09`) if your pinches aren't registering easily. Decrease it (e.g., `0.05`) if notes trigger before your fingers actually touch.
- **`NOTE_BANKS`:** This dictionary defines exactly what MIDI notes are mapped to which fingers for all 5 banks. You can customize these to map to any chord progression you like!
- **`CAMERA_INDEX`:** If you have multiple cameras (like OBS Virtual Camera), change this from `0` to `1` or `2`.

---

## 🛠️ Technology Stack
- **Python 3**
- **OpenCV** (Computer Vision & UI Rendering)
- **MediaPipe** (Skeletal Hand Tracking)
- **Mido / Python-RtMidi** (System MIDI routing)

---

**Press `q` at any time while the camera window is focused to safely quit the application.**
