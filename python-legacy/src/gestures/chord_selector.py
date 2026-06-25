import mediapipe as mp

class ChordSelector:
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        # Define tip and pip (or dip) landmarks for 5 fingers to count if extended
        self.tip_ids = [
            self.mp_hands.HandLandmark.THUMB_TIP,
            self.mp_hands.HandLandmark.INDEX_FINGER_TIP,
            self.mp_hands.HandLandmark.MIDDLE_FINGER_TIP,
            self.mp_hands.HandLandmark.RING_FINGER_TIP,
            self.mp_hands.HandLandmark.PINKY_TIP
        ]
        # Using PIP for other fingers and IP for thumb to check if extended
        self.dip_ids = [
            self.mp_hands.HandLandmark.THUMB_IP,
            self.mp_hands.HandLandmark.INDEX_FINGER_PIP,
            self.mp_hands.HandLandmark.MIDDLE_FINGER_PIP,
            self.mp_hands.HandLandmark.RING_FINGER_PIP,
            self.mp_hands.HandLandmark.PINKY_PIP
        ]

    def count_fingers(self, hand_landmarks, handedness_label):
        """
        Counts the number of extended fingers for a given hand.
        """
        if not hand_landmarks:
            return 0

        fingers_up = 0
        landmarks = hand_landmarks.landmark

        # Thumb: check X coordinate relative to IP depending on Left/Right hand
        # Assuming the image is mirrored (selfie view). 
        # If it's the physical Left hand (Chord Selector), the thumb tip should be to the right (higher x)
        # of the IP joint if palm is facing the camera, or opposite depending on hand orientation.
        # A more robust way for thumb is checking distance or x-axis. 
        # Let's use simple x-axis check for thumb.
        thumb_tip_x = landmarks[self.tip_ids[0]].x
        thumb_ip_x = landmarks[self.dip_ids[0]].x
        
        # This logic might need tweaking based on whether palm is facing camera or not.
        if handedness_label == 'Left':
            if thumb_tip_x > thumb_ip_x:  # Thumb is pointing right
                fingers_up += 1
        else:
            if thumb_tip_x < thumb_ip_x:  # Thumb is pointing left
                fingers_up += 1

        # Other 4 fingers: check Y coordinate
        # y goes top to bottom (0 at top, 1 at bottom)
        # So tip should be < pip (higher up in the image)
        for i in range(1, 5):
            tip_y = landmarks[self.tip_ids[i]].y
            dip_y = landmarks[self.dip_ids[i]].y
            if tip_y < dip_y:
                fingers_up += 1

        # Cap it between 1 and 5 (0 means 1 bank active, or maybe handle 0 separately)
        # We will clamp it between 1 and 5
        return max(1, min(5, fingers_up))
