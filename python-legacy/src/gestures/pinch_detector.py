import math
import mediapipe as mp
from src.config.settings import PINCH_THRESHOLD

class PinchDetector:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.thumb_tip = self.mp_hands.HandLandmark.THUMB_TIP
        self.finger_tips = {
            "Index": self.mp_hands.HandLandmark.INDEX_FINGER_TIP,
            "Middle": self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
            "Ring": self.mp_hands.HandLandmark.RING_FINGER_TIP,
            "Little": self.mp_hands.HandLandmark.PINKY_TIP
        }
        
        # Keep track of active pinches for debouncing
        self.active_pinches = {finger: False for finger in self.finger_tips}

    def detect_pinches(self, hand_landmarks):
        """
        Calculates distance from thumb tip to other fingertips.
        Returns a dict of finger names to boolean indicating if newly pinched,
        and updates the active_pinches state.
        
        Returns:
            new_pinches (list): Names of fingers that just started pinching.
            released_pinches (list): Names of fingers that just released.
        """
        new_pinches = []
        released_pinches = []
        
        if not hand_landmarks:
            # If hand is lost, release all active pinches
            for finger, is_active in self.active_pinches.items():
                if is_active:
                    released_pinches.append(finger)
                    self.active_pinches[finger] = False
            return new_pinches, released_pinches

        landmarks = hand_landmarks.landmark
        thumb = landmarks[self.thumb_tip]

        for finger, tip_id in self.finger_tips.items():
            tip = landmarks[tip_id]
            # Calculate Euclidean distance in 2D normalized space
            # Can also include z if needed: (thumb.z - tip.z)**2
            dist = math.sqrt((thumb.x - tip.x)**2 + (thumb.y - tip.y)**2)
            
            is_pinching = dist < PINCH_THRESHOLD
            
            # Debounce logic
            was_pinching = self.active_pinches[finger]
            
            if is_pinching and not was_pinching:
                new_pinches.append(finger)
                self.active_pinches[finger] = True
            elif not is_pinching and was_pinching:
                released_pinches.append(finger)
                self.active_pinches[finger] = False

        return new_pinches, released_pinches
