# AirPiano Setup Instructions

## Prerequisites
- Python 3.8+ installed on your system.
- A built-in webcam or external USB webcam.
- Built-in Microsoft GS Wavetable Synth (available by default on Windows).

## Installation

1. Open a terminal or command prompt and navigate to the project directory:
   ```bash
   cd c:\Users\Viraal\Desktop\airpiano
   ```

2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Ensure your webcam is connected.
2. Run the main script:
   ```bash
   python src/main.py
   ```
3. A window will open showing the webcam feed.
   - Use your **Left Hand** to change the active note bank by raising 1 to 5 fingers.
   - Use your **Right Hand** to play notes by pinching your thumb to your other fingers.
   - To exit, press the `q` key on your keyboard while the webcam window is focused.
