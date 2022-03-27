import json
from encounter_tools import *


Quest("Test Quest")
Dialogue("START", "choose someone to fight")
Choice("Fight a gnome", "Gnome")
Choice("Fight a dragon", "Dragon")
Fight("Gnome", "Furious Gnome", 20, 1, "Reward")
Fight("Dragon", "Smokey Dragon", 120, 15, "Reward")
Loot("Reward", "You won! Take this payment for your trouble! (40gp)", 40, "FINISH")
End("FINISH", "Your quest is over...")

with open('encounters.json', 'w') as f:
    f.write(json.dumps(encounters, indent=4))
