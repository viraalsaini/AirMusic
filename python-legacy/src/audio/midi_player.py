import mido
import time
from src.config.settings import NOTE_BANKS, MIDI_PORT_NAME, DEFAULT_INSTRUMENT, note_name

class MidiPlayer:
    def __init__(self):
        self.port = None
        self.active_notes = [] # Keep track of currently playing note numbers
        self.setup_midi()

    def setup_midi(self):
        try:
            # mido will use python-rtmidi backend automatically if installed
            available_ports = mido.get_output_names()
            print("Available MIDI Ports:", available_ports)
            
            if MIDI_PORT_NAME and MIDI_PORT_NAME in available_ports:
                self.port = mido.open_output(MIDI_PORT_NAME)
                print(f"Opened MIDI Port: {MIDI_PORT_NAME}")
            else:
                self.port = mido.open_output() # Opens default port
                print(f"Opened Default MIDI Port: {self.port.name}")
            
            # Send program change for default instrument
            self.port.send(mido.Message('program_change', program=DEFAULT_INSTRUMENT))
            
        except Exception as e:
            print(f"Error initializing MIDI: {e}")
            self.port = None

    def play_notes(self, bank_id, finger_name):
        """
        Triggers the notes associated with the given bank and finger.
        """
        if bank_id not in NOTE_BANKS or finger_name not in NOTE_BANKS[bank_id]:
            return
        
        notes_to_play = NOTE_BANKS[bank_id][finger_name]
        
        for note in notes_to_play:
            if self.port:
                self.port.send(mido.Message('note_on', note=note, velocity=100))
            self.active_notes.append(note)

    def release_notes(self, bank_id, finger_name):
        """
        Releases the notes associated with the given bank and finger.
        """
        if bank_id not in NOTE_BANKS or finger_name not in NOTE_BANKS[bank_id]:
            return
            
        notes_to_release = NOTE_BANKS[bank_id][finger_name]
        
        for note in notes_to_release:
            if self.port:
                self.port.send(mido.Message('note_off', note=note, velocity=0))
            if note in self.active_notes:
                self.active_notes.remove(note)

    def release_all(self):
        """
        Releases all currently active notes. Useful for cleanup or bank changes.
        """
        for note in self.active_notes:
            if self.port:
                self.port.send(mido.Message('note_off', note=note, velocity=0))
        self.active_notes.clear()

    def get_active_note_names(self):
        """
        Returns a list of names for the currently playing notes.
        """
        return [note_name(note) for note in self.active_notes]

    def close(self):
        """
        Closes the MIDI port.
        """
        self.release_all()
        if self.port:
            self.port.close()
