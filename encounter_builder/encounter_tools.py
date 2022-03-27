encounters = {}
quest_id = None
dialogue_id = None
trade_id = None


def Quest(key):
    global quest_id
    quest_id = key
    encounters[key] = {}


def Dialogue(key, text):
    global dialogue_id
    dialogue_id = key
    encounters[quest_id][key] = {
        "type": "dialogue",
        "text": text,
        "choices": []
    }


def Choice(text, target):
    encounters[quest_id][dialogue_id]["choices"].append({
        "text": text,
        "target": target
    })


def Fight(key, name, health, damage, target):
    encounters[quest_id][key] = {
        "type": "fight",
        "name": name,
        "image": "sketch",
        "health": health,
        "damage": damage,
        "target": target
    }


def Loot(key, text, gold, target):
    encounters[quest_id][key] = {
        "type": "loot",
        "text": text,
        "gold": gold,
        "target": target
    }


def Trade(key, text, cost, target):
    global trade_id
    trade_id = key
    encounters[quest_id][key] = {
        "type": "trade",
        "text": text,
        "cost": cost,
        "target": target,
        "gains": []
    }


def Gain(type, effect, level):
    encounters[quest_id][trade_id]["gains"].append({
        "type": type,
        "effect": effect,
        "level": level
    })


def End(key, text):
    encounters[quest_id][key] = {
        "type": "end",
        "text": text
    }
