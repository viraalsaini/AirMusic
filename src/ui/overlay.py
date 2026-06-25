import cv2
import mediapipe as mp
from src.config.settings import NOTE_BANKS, note_name

class Overlay:
    def __init__(self):
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_hands = mp.solutions.hands
        # Create a custom bluish style
        self.landmark_style = self.mp_drawing.DrawingSpec(color=(255, 180, 50), thickness=2, circle_radius=3) # Bluish in BGR

    def draw_landmarks(self, frame, hand_landmarks):
        """
        Draws MediaPipe landmarks on the frame using a clean, single-color style.
        """
        if hand_landmarks:
            self.mp_drawing.draw_landmarks(
                frame,
                hand_landmarks,
                None,  # No connections
                self.landmark_style,
                None
            )

    def draw_finger_labels(self, frame, right_hand, active_bank):
        """
        Draws text boxes on the playing hand showing which notes are mapped to which fingers.
        """
        if not right_hand or active_bank not in NOTE_BANKS:
            return

        h, w, _ = frame.shape
        landmarks = right_hand.landmark
        
        # Map of finger names to their tip landmark index
        finger_tips = {
            "Index": self.mp_hands.HandLandmark.INDEX_FINGER_TIP,
            "Middle": self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
            "Ring": self.mp_hands.HandLandmark.RING_FINGER_TIP,
            "Little": self.mp_hands.HandLandmark.PINKY_TIP
        }

        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.35
        thickness = 1
        
        for finger_name, tip_idx in finger_tips.items():
            if finger_name in NOTE_BANKS[active_bank]:
                notes = NOTE_BANKS[active_bank][finger_name]
                note_str = "+".join([note_name(n) for n in notes])
                
                # Get pixel coordinates
                tip = landmarks[tip_idx]
                cx, cy = int(tip.x * w), int(tip.y * h)
                
                # Draw a small semi-transparent black background box for readability
                (text_w, text_h), baseline = cv2.getTextSize(note_str, font, font_scale, thickness)
                # Offset text slightly above and to the right of the fingertip
                tx, ty = cx + 15, cy - 15
                
                # Box coordinates
                cv2.rectangle(frame, (tx - 5, ty - text_h - 5), (tx + text_w + 5, ty + 5), (0, 0, 0), -1)
                
                # White text
                cv2.putText(frame, note_str, (tx, ty), font, font_scale, (255, 255, 255), thickness, cv2.LINE_AA)

    def draw_status(self, frame, fps, bank, fingers_up, pinches, active_notes):
        """
        Draws text overlay on the frame.
        """
        # Define text parameters using a cleaner font
        font = cv2.FONT_HERSHEY_DUPLEX
        font_scale = 0.6
        color = (255, 255, 255) # White for all stats
        thickness = 1
        line_type = cv2.LINE_AA

        # FPS counter removed as requested

        # Chord Selector Status
        cv2.putText(frame, f"Left Fingers: {fingers_up}", (10, 40), font, font_scale, color, thickness, line_type)
        cv2.putText(frame, f"Active Bank: {bank}", (10, 70), font, font_scale, color, thickness, line_type)

        # Playing Hand Status
        pinch_str = ", ".join(pinches) if pinches else "None"
        cv2.putText(frame, f"Current Pinch: {pinch_str}", (10, 110), font, font_scale, color, thickness, line_type)

        # Active Notes
        notes_str = " ".join(active_notes) if active_notes else "None"
        cv2.putText(frame, f"Playing: {notes_str}", (10, 150), font, font_scale, color, thickness, line_type)
