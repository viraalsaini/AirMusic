import cv2
import time
import sys
import os

# Ensure the root project directory is in the sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.config.settings import CAMERA_INDEX, WINDOW_WIDTH, WINDOW_HEIGHT, TARGET_FPS  # noqa: E402
from src.tracking.hand_tracker import HandTracker  # noqa: E402
from src.gestures.chord_selector import ChordSelector  # noqa: E402
from src.gestures.pinch_detector import PinchDetector  # noqa: E402
from src.audio.midi_player import MidiPlayer  # noqa: E402
from src.ui.overlay import Overlay  # noqa: E402
from src.tracking.camera import CameraStream  # noqa: E402

def main():
    # Initialize components
    tracker = HandTracker()
    chord_selector = ChordSelector()
    pinch_detector = PinchDetector()
    midi_player = MidiPlayer()
    overlay = Overlay()

    # Application state
    active_bank = 1
    fingers_up = 0
    active_pinches_names = []

    # Initialize threaded video capture
    cap = CameraStream(src=CAMERA_INDEX, width=WINDOW_WIDTH, height=WINDOW_HEIGHT)
    
    if not cap.grabbed:
        print(f"Error: Could not open webcam with index {CAMERA_INDEX}")
        return
        
    cap.start()

    print("Starting AirPiano. Press 'q' to quit.")

    p_time = 0

    try:
        while True:
            success, frame = cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            # Flip the frame horizontally for a selfie-view display
            frame = cv2.flip(frame, 1)

            # Process frame for hands
            results = tracker.process_frame(frame)
            hands_info = tracker.get_hands_info(results)

            # Draw landmarks first
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    overlay.draw_landmarks(frame, hand_landmarks)

            # Analyze hands
            left_hand = hands_info.get('Left')
            right_hand = hands_info.get('Right')

            # --- Left Hand (Chord Selector) ---
            if left_hand:
                # Count fingers and update active bank
                new_fingers_up = chord_selector.count_fingers(left_hand, 'Left')
                if new_fingers_up > 0:
                    fingers_up = new_fingers_up
                    # If bank changes, release all active notes to avoid hanging notes
                    if fingers_up != active_bank:
                        midi_player.release_all()
                        active_bank = fingers_up

            # --- Right Hand (Playing Hand) ---
            # Even if right_hand is None, we call detect_pinches to trigger release events
            new_pinches, released_pinches = pinch_detector.detect_pinches(right_hand)
            
            for finger in new_pinches:
                midi_player.play_notes(active_bank, finger)
            
            for finger in released_pinches:
                midi_player.release_notes(active_bank, finger)

            # Get current active pinches for display
            active_pinches_names = [f for f, is_active in pinch_detector.active_pinches.items() if is_active]

            # Calculate FPS
            c_time = time.time()
            fps = int(1 / (c_time - p_time)) if (c_time - p_time) > 0 else 0
            p_time = c_time

            # Draw UI overlay
            active_notes = midi_player.get_active_note_names()
            overlay.draw_status(frame, fps, active_bank, fingers_up, active_pinches_names, active_notes)
            overlay.draw_finger_labels(frame, right_hand, active_bank)

            # Display the frame
            cv2.imshow("AirPiano", frame)

            # Exit condition
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    finally:
        # Cleanup
        cap.release()
        cv2.destroyAllWindows()
        midi_player.close()
        print("AirPiano closed successfully.")

if __name__ == "__main__":
    main()
