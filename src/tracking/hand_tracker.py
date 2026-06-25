import cv2
import mediapipe as mp
from src.config.settings import MIN_DETECTION_CONFIDENCE, MIN_TRACKING_CONFIDENCE

class HandTracker:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=MIN_DETECTION_CONFIDENCE,
            min_tracking_confidence=MIN_TRACKING_CONFIDENCE
        )

    def process_frame(self, frame):
        """
        Processes the BGR frame and returns MediaPipe results.
        """
        # Convert the BGR image to RGB before processing.
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)
        return results

    def get_hands_info(self, results):
        """
        Parses results to return a structured dict mapping 'Left' and 'Right'
        to their respective landmarks.
        """
        hands_info = {'Left': None, 'Right': None}
        
        if results.multi_hand_landmarks and results.multi_handedness:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                # Handedness label ('Left' or 'Right')
                # MediaPipe assumes the image is mirrored by default for selfie view.
                # Since we mirror the frame later or assume mirror, we might need to swap labels
                # or just use what MediaPipe outputs. We'll use the raw output first.
                label = handedness.classification[0].label
                hands_info[label] = hand_landmarks
                
        return hands_info
