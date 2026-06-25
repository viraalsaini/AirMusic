import { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import PianoSynth from './audio/PianoSynth';
import GestureDetector from './gestures/GestureDetector';
import { NOTE_BANKS, noteName } from './config/settings';
import './index.css';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isReady, setIsReady] = useState(false);
  const [activeBank, setActiveBank] = useState(1);
  const [fingersUp, setFingersUp] = useState(0);
  const [activePinches, setActivePinches] = useState([]);
  const [activeNotes, setActiveNotes] = useState([]);
  const [debugError, setDebugError] = useState(null);
  
  const synthRef = useRef(null);
  const detectorRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationRef = useRef(null);
  
  // Refs to avoid stale closures in requestAnimationFrame
  const activeBankRef = useRef(1);
  const lastFingersUpRef = useRef(0);
  const lastPinchesStrRef = useRef("");
  const lastNotesStrRef = useRef("");

  useEffect(() => {
    // Initialize AI and Audio engines when user clicks Start
    // Browsers require a user gesture to start AudioContext
  }, []);

  const startApp = async () => {
    // 1. Initialize Audio
    synthRef.current = new PianoSynth();
    await synthRef.current.init();
    
    // 2. Initialize Gestures
    detectorRef.current = new GestureDetector();

    // 3. Initialize MediaPipe
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
    );
    landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.7,
      minTrackingConfidence: 0.7
    });

    // 4. Start Webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
    videoRef.current.srcObject = stream;
    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      setIsReady(true);
      predictWebcam();
    };
  };

  const stopApp = () => {
    setIsReady(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (synthRef.current) {
      synthRef.current.releaseAll();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  let lastVideoTime = -1;
  
  const predictWebcam = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !landmarkerRef.current) return;

    const ctx = canvas.getContext('2d');
    
    try {
      // Ensure canvas matches video dimensions
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        
        const results = landmarkerRef.current.detectForVideo(video, performance.now());
        
        ctx.save();
        // Mirror canvas to match selfie view
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let leftHand = null;
        let rightHand = null;

        if (results.landmarks) {
          for (let i = 0; i < results.landmarks.length; i++) {
            const landmarks = results.landmarks[i];
            const handedness = results.handednesses[i][0].categoryName;
            
            // Draw minimal landmarks (dots only)
            ctx.fillStyle = "rgb(255, 180, 50)"; // Bluish
            for (const point of landmarks) {
              ctx.beginPath();
              ctx.arc(point.x * canvas.width, point.y * canvas.height, 4, 0, 2 * Math.PI);
              ctx.fill();
            }

            // Due to mirror, physical Right is seen as Left by MediaPipe
            if (handedness === 'Left') rightHand = landmarks;
            if (handedness === 'Right') leftHand = landmarks;
          }
        }

        // Logic Updates
        let currentBank = activeBankRef.current;
        if (leftHand) {
          const count = detectorRef.current.countFingers(leftHand);
          if (count > 0) {
            if (count !== lastFingersUpRef.current) {
              setFingersUp(count);
              lastFingersUpRef.current = count;
            }
            if (count !== currentBank) {
              synthRef.current.releaseAll();
              activeBankRef.current = count;
              currentBank = count;
              setActiveBank(count);
              setActiveNotes([]);
              setActivePinches([]);
            }
          }
        }

        // Always pass right hand (even if null) to trigger release events
        const { newPinches, releasedPinches } = detectorRef.current.detectPinches(rightHand);
        
        // Handle Audio
        for (const finger of newPinches) {
          if (NOTE_BANKS[currentBank] && NOTE_BANKS[currentBank][finger]) {
            synthRef.current.playNotes(NOTE_BANKS[currentBank][finger]);
          }
        }
        for (const finger of releasedPinches) {
          if (NOTE_BANKS[currentBank] && NOTE_BANKS[currentBank][finger]) {
            synthRef.current.releaseNotes(NOTE_BANKS[currentBank][finger]);
          }
        }

        ctx.restore(); // Restore orientation so text isn't mirrored!

        // Draw Finger Labels
        if (rightHand && NOTE_BANKS[currentBank]) {
          ctx.font = "16px monospace";
          ctx.fillStyle = "white";
          ctx.textAlign = "left";
          
          for (const [finger, tipIdx] of Object.entries(detectorRef.current.fingerTips)) {
              if (NOTE_BANKS[currentBank][finger]) {
                  const notesArr = NOTE_BANKS[currentBank][finger];
                  const noteStr = notesArr.map(n => noteName(n)).join('+');
                  const point = rightHand[tipIdx];
                  
                  // Manually flip X since canvas is no longer mirrored
                  const x = canvas.width - (point.x * canvas.width) + 15;
                  const y = point.y * canvas.height - 15;
                  
                  // Text background
                  const textWidth = ctx.measureText(noteStr).width;
                  ctx.fillStyle = "rgba(0,0,0,0.5)";
                  ctx.fillRect(x - 4, y - 16, textWidth + 8, 22);
                  
                  // Text
                  ctx.fillStyle = "white";
                  ctx.fillText(noteStr, x, y);
              }
          }
        }
        
        // Update UI state efficiently
        const currentPinches = Object.keys(detectorRef.current.activePinches).filter(k => detectorRef.current.activePinches[k]);
        const currentPinchesStr = currentPinches.join(',');
        if (currentPinchesStr !== lastPinchesStrRef.current) {
            setActivePinches(currentPinches);
            lastPinchesStrRef.current = currentPinchesStr;
        }

        const currentNotes = Array.from(synthRef.current.activeNotes);
        const currentNotesStr = currentNotes.join(',');
        if (currentNotesStr !== lastNotesStrRef.current) {
            setActiveNotes(currentNotes);
            lastNotesStrRef.current = currentNotesStr;
        }
      }
    } catch (e) {
      setDebugError(e.message);
      console.error(e);
    }

    animationRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="app-container">
      {!isReady ? (
        <div className="overlay-menu">
          <h1>AirMusic Web</h1>
          <p>Turn your webcam into an invisible piano.</p>
          <button className="start-btn" onClick={startApp}>Start Experience</button>
        </div>
      ) : (
        <div className="ui-overlay">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2>AirPiano</h2>
              <button onClick={stopApp} style={{ background: 'rgba(255,0,0,0.5)', border: 'none', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Quit</button>
            </div>
            <div className="stats">
              <p>Active Bank: <span>{activeBank}</span> ({fingersUp} fingers)</p>
              <p>Pinches: <span>{activePinches.join(', ') || 'None'}</span></p>
              <p>Playing: <span className="notes">{activeNotes.map(n => noteName(n)).join(' ') || 'None'}</span></p>
              {debugError && <p style={{ color: 'red', marginTop: '10px' }}>ERROR: {debugError}</p>}
            </div>
          </div>
        </div>
      )}
      
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted className="webcam-feed"></video>
        <canvas ref={canvasRef} className="output-canvas"></canvas>
      </div>
    </div>
  );
}

export default App;
