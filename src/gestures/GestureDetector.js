import { PINCH_THRESHOLD } from '../config/settings';

class GestureDetector {
    constructor() {
        this.activePinches = {
            "Index": false,
            "Middle": false,
            "Ring": false,
            "Little": false
        };

        this.fingerTips = {
            "Index": 8, // INDEX_FINGER_TIP
            "Middle": 12, // MIDDLE_FINGER_TIP
            "Ring": 16, // RING_FINGER_TIP
            "Little": 20 // PINKY_TIP
        };
        
        this.fingerPips = {
            "Index": 6,
            "Middle": 10,
            "Ring": 14,
            "Little": 18
        };
        
        this.thumbTip = 4;
        this.thumbIp = 3;
    }

    countFingers(landmarks) {
        if (!landmarks) return 0;

        let fingersUp = 0;

        // Thumb logic
        const thumbTipX = landmarks[this.thumbTip].x;
        const thumbIpX = landmarks[this.thumbIp].x;
        // In Web, the camera is mirrored via CSS usually, but MediaPipe output varies.
        // Assuming user's Left Hand is the Chord Selector
        // We'll use a simple x distance check or y distance
        // Left hand thumb tip should have a higher X value than the IP joint
        if (thumbTipX > thumbIpX) {
            fingersUp += 1;
        }

        // Other 4 fingers
        const fingers = ["Index", "Middle", "Ring", "Little"];
        for (const finger of fingers) {
            const tipY = landmarks[this.fingerTips[finger]].y;
            const pipY = landmarks[this.fingerPips[finger]].y;
            if (tipY < pipY) {
                fingersUp += 1;
            }
        }

        return Math.max(1, Math.min(5, fingersUp));
    }

    detectPinches(landmarks) {
        const newPinches = [];
        const releasedPinches = [];

        if (!landmarks) {
            // Release all active
            for (const finger in this.activePinches) {
                if (this.activePinches[finger]) {
                    releasedPinches.push(finger);
                    this.activePinches[finger] = false;
                }
            }
            return { newPinches, releasedPinches };
        }

        const thumb = landmarks[this.thumbTip];

        for (const finger in this.fingerTips) {
            const tip = landmarks[this.fingerTips[finger]];
            const dist = Math.sqrt(Math.pow(thumb.x - tip.x, 2) + Math.pow(thumb.y - tip.y, 2));
            
            const isPinching = dist < PINCH_THRESHOLD;
            const wasPinching = this.activePinches[finger];

            if (isPinching && !wasPinching) {
                newPinches.push(finger);
                this.activePinches[finger] = true;
            } else if (!isPinching && wasPinching) {
                releasedPinches.push(finger);
                this.activePinches[finger] = false;
            }
        }

        return { newPinches, releasedPinches };
    }
}

export default GestureDetector;
