#!/usr/bin/env python3
"""Fix remaining English item names in prices.json to PT-BR."""
import json

with open('/home/z/my-project/src/data/prices.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Translation dictionary for the 55 remaining English items
translations = {
    # Food, Drinks & Ingredients
    "blood_mold": "Bolor de Sangue",
    "chinese_energy_drink": "Energético Chinês",
    "cooked_pasta": "Massa Cozida",
    "cooked_rice": "Arroz Cozido",
    "dirty_water": "Água Suja",
    "easter_cake": "Bolo de Páscoa",
    "easter_egg": "Ovo de Páscoa",
    "energy_drink": "Energético",
    "fresh_fish": "Peixe Fresco",
    "fried_tough_meat": "Carne Dura Frita",
    "fried_fatty_meat": "Carne Gordurosa Frita",
    "fried_mutant_meat": "Carne de Mutante Frita",
    "fried_potato": "Batata Frita",
    "golden_easter_egg": "Ovo de Páscoa Dourado",
    "holiday_energy_drink": "Energético de Feriado",
    "mushroom_with_eyes": "Cogumelo com Olhos",
    "old_canned_meat": "Carne Enlatada Velha",
    "rat_meat": "Carne de Rato",
    "smuggled_energy_drink": "Energético Contrabandeado",
    "snake_meat": "Carne de Cobra",
    "tough_meat": "Carne Dura",
    
    # Materials & Components
    "boiled_leather": "Couro Fervido",
    "electric_motor": "Motor Elétrico",
    "iron_pot": "Panela de Ferro",
    "metal_plate": "Chapa de Metal",
    "quality_hide": "Pele de Qualidade",
    "quality_leather": "Couro de Qualidade",
    "raw_hide": "Pele Crua",
    "steel_pot": "Panela de Aço",
    "titanium_pot": "Panela de Titânio",
    "transport_repair_kit": "Kit de Reparo de Transporte",
    "vehicle_repair_kit": "Kit de Reparo de Veículo",
    "weapon_repair_kit": "Kit de Reparo de Arma",
    
    # Ammo & Explosives
    "assault_rifle_shell": "Cartucho de Fuzil de Assalto",
    "lead_bullet": "Bala de Chumbo",
    "pistol_shell": "Cartucho de Pistola",
    "rifle_shell": "Cartucho de Rifle",
    
    # Weapons
    "formalin_gas_pistol": "Pistola de Gás Formalina",
    "heavy_machine_gun": "Metralhadora Pesada",
    "light_machine_gun": "Metralhadora Leve",
    "machine_gun_parts": "Peças de Metralhadora",
    "nuclear_battery": "Bateria Nuclear",
    "rainbow_easter_egg": "Ovo de Páscoa Arco-Íris",
    "steel_axe": "Machado de Aço",
    "steel_knife": "Faca de Aço",
    "titanium_axe": "Machado de Titânio",
    "titanium_knife": "Faca de Titânio",
    
    # Tools
    "steel_crowbar": "Pé de Cabra de Aço",
    "steel_needle": "Agulha de Aço",
    "steel_shovel": "Pá de Aço",
    "titanium_shovel": "Pá de Titânio",
    "titanium_crowbar": "Pé de Cabra de Titânio",
    "tool_kit": "Kit de Ferramentas",
    
    # Gas Masks
    "comfortable_gas_mask": "Máscara de Gás Confortável",
    "gas_mask_filter": "Filtro de Máscara de Gás",
}

# Apply translations
count = 0
for cat in data['categories']:
    for item in cat['items']:
        item_id = item['id']
        if item_id in translations:
            old_name = item['name']
            item['name'] = translations[item_id]
            count += 1
            print(f'  {item_id}: "{old_name}" -> "{item["name"]}"')

print(f"\nTotal items translated: {count}")

# Save
with open('/home/z/my-project/src/data/prices.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("prices.json saved!")

# Verify no English names remain
english_remaining = []
for cat in data['categories']:
    for item in cat['items']:
        name = item['name']
        words = name.split()
        if len(words) >= 2:
            eng_indicators = ['the', 'and', 'for', 'with', 'energy', 'drink', 'water',
                'mold', 'meat', 'cake', 'egg', 'rice', 'pasta', 'corn', 'milk', 'fish',
                'soup', 'bread', 'salt', 'sugar', 'sauce', 'oil', 'tea', 'coffee',
                'wine', 'beer', 'juice', 'cooked', 'raw', 'dirty', 'clean', 'rotten',
                'dried', 'fried', 'roasted', 'boiled', 'canned', 'fresh', 'frozen',
                'radioactive', 'contaminated', 'spooky', 'chinese', 'easter', 'blood',
                'medicinal', 'medical', 'first', 'aid', 'kit', 'set', 'part', 'piece',
                'metal', 'wood', 'stone', 'iron', 'steel', 'copper', 'cloth', 'leather',
                'rubber', 'plastic', 'paper', 'glass', 'rope', 'wire', 'nail', 'screw',
                'bolt', 'spring', 'gear', 'wheel', 'engine', 'motor', 'fuel', 'gas',
                'bullet', 'shell', 'cartridge', 'gun', 'rifle', 'pistol', 'shotgun',
                'armor', 'helmet', 'boots', 'gloves', 'jacket', 'shirt', 'pants',
                'hat', 'mask', 'backpack', 'bag', 'belt', 'bandage', 'antibiotic',
                'vitamin', 'poison', 'acid', 'explosive', 'bomb', 'grenade', 'mine',
                'trap', 'fence', 'door', 'window', 'wall', 'floor', 'roof', 'table',
                'chair', 'bed', 'shelf', 'locker', 'safe', 'box', 'chest', 'crate',
                'barrel', 'bucket', 'bottle', 'cup', 'plate', 'pot', 'pan', 'fork',
                'knife', 'axe', 'hammer', 'saw', 'shovel', 'pickaxe', 'crowbar',
                'wrench', 'pliers', 'drill', 'file', 'chisel', 'tape', 'glue',
                'paint', 'brush', 'tuna', 'salmon', 'shrimp', 'crab',
                'mushroom', 'berry', 'apple', 'pear', 'grape', 'cherry', 'lemon',
                'orange', 'banana', 'peach', 'plum', 'melon', 'pumpkin', 'cabbage',
                'carrot', 'potato', 'tomato', 'onion', 'garlic', 'pepper', 'herb',
                'tobacco', 'cigar', 'cigarette', 'chocolate', 'candy', 'honey',
                'butter', 'cheese', 'cream', 'yogurt', 'kefir',
                'cotton', 'silk', 'wool', 'thread', 'needle', 'button', 'zipper',
                'match', 'candle', 'lamp', 'flashlight', 'battery', 'radio',
                'compass', 'map', 'book', 'newspaper', 'photo', 'mirror',
                'clock', 'watch', 'thermometer', 'barometer', 'scale',
                'wolf', 'bear', 'dog', 'cat', 'rat', 'snake', 'spider',
                'scorpion', 'fly', 'mosquito', 'bee', 'wasp', 'ant',
                'feather', 'bone', 'horn', 'tusk', 'fur', 'pelt', 'hide',
                'skin', 'claw', 'fang', 'tooth', 'beak', 'wing', 'tail', 'fin',
                'heart', 'liver', 'kidney', 'brain', 'lung',
                'crystal', 'diamond', 'emerald', 'ruby', 'sapphire', 'amethyst',
                'topaz', 'opal', 'pearl', 'coral', 'amber', 'jade', 'obsidian',
                'granite', 'marble', 'basalt', 'sandstone', 'limestone', 'slate',
                'quartz', 'mica', 'clay', 'chalk', 'coal', 'charcoal',
                'sulfur', 'phosphorus', 'nitrogen', 'oxygen', 'hydrogen', 'helium',
                'carbon', 'silicon', 'uranium', 'plutonium', 'radium', 'thorium',
                'lead', 'tin', 'zinc', 'nickel', 'chromium', 'manganese',
                'titanium', 'tungsten', 'cobalt', 'molybdenum', 'vanadium',
                'silver', 'gold', 'platinum', 'palladium', 'iridium',
                'aluminum', 'magnesium', 'calcium', 'sodium', 'potassium',
                'circuit', 'chip', 'processor', 'sensor', 'switch', 'button',
                'keyboard', 'screen', 'display', 'monitor', 'speaker', 'microphone',
                'camera', 'lens', 'telescope', 'microscope', 'binoculars',
                'antenna', 'satellite', 'radar', 'sonar', 'gps', 'laser',
                'solar', 'panel', 'cell', 'battery', 'generator', 'transformer',
                'cable', 'plug', 'socket', 'outlet', 'adapter', 'converter',
                'inverter', 'charger', 'controller', 'module', 'unit', 'system',
                'device', 'machine', 'tool', 'instrument', 'equipment', 'apparatus',
                'mechanism', 'structure', 'construction', 'material',
                'component', 'element', 'part', 'piece', 'fragment', 'section',
                'segment', 'portion', 'quantity', 'amount', 'number',
                'type', 'kind', 'sort', 'variety', 'class', 'category',
                'level', 'rank', 'grade', 'quality', 'standard', 'model',
                'version', 'edition', 'variant', 'modification', 'upgrade',
                'repair', 'fix', 'patch', 'restore', 'recover', 'heal', 'cure',
                'damage', 'hurt', 'wound', 'injury', 'pain', 'disease', 'illness',
                'sickness', 'infection', 'poisoning', 'radiation', 'contamination',
                'hunger', 'thirst', 'exhaustion', 'fatigue', 'stress', 'fear',
                'anger', 'sadness', 'happiness', 'confidence', 'morale',
                'craft', 'build', 'create', 'make', 'produce', 'manufacture',
                'gather', 'collect', 'harvest', 'mine', 'fish', 'hunt',
                'cook', 'bake', 'roast', 'fry', 'boil', 'grill', 'steam',
                'preserve', 'store', 'keep', 'hold', 'carry', 'transport',
                'buy', 'sell', 'trade', 'exchange', 'swap', 'barter',
                'find', 'search', 'explore', 'discover', 'investigate',
                'read', 'write', 'draw', 'paint', 'carve', 'sculpt',
                'play', 'sing', 'dance', 'fight', 'shoot', 'throw',
                'run', 'walk', 'climb', 'swim', 'fly', 'drive', 'ride',
                'open', 'close', 'lock', 'unlock', 'break', 'repair',
                'attach', 'detach', 'connect', 'disconnect', 'combine', 'separate',
                'fill', 'empty', 'pour', 'spill', 'leak', 'block', 'unblock',
                'boost', 'reduce', 'increase', 'decrease', 'improve', 'worsen',
                'manual', 'automatic', 'electric', 'electronic', 'digital',
                'analog', 'mechanical', 'thermal', 'chemical', 'biological',
                'nuclear', 'atomic', 'magnetic', 'optical', 'acoustic',
                'small', 'medium', 'large', 'tiny', 'huge', 'giant',
                'light', 'heavy', 'soft', 'hard', 'sharp', 'blunt',
                'fast', 'slow', 'strong', 'weak', 'tough', 'brittle',
                'hot', 'cold', 'warm', 'cool', 'wet', 'dry',
                'new', 'old', 'young', 'ancient', 'modern', 'future',
                'good', 'bad', 'better', 'worse', 'best', 'worst',
                'common', 'uncommon', 'rare', 'epic', 'legendary',
                'simple', 'complex', 'basic', 'advanced', 'superior',
                'starter', 'beginner', 'intermediate', 'expert', 'master',
                'white', 'black', 'red', 'blue', 'green', 'yellow',
                'brown', 'gray', 'grey', 'orange', 'pink', 'purple',
                'wooden', 'wood', 'metal', 'leather', 'cloth', 'rubber',
                'military', 'civilian', 'medical', 'scientific', 'industrial',
                'domestic', 'outdoor', 'indoor', 'portable', 'stationary',
                'single', 'double', 'triple', 'quad', 'multi',
                'half', 'quarter', 'third', 'fifth', 'tenth',
                'one', 'two', 'three', 'four', 'five',
                'six', 'seven', 'eight', 'nine', 'ten',
                'first', 'second', 'primary', 'secondary', 'tertiary', 'final', 'ultimate',
                'left', 'right', 'top', 'bottom', 'front', 'back',
                'upper', 'lower', 'inner', 'outer', 'central', 'side',
                'north', 'south', 'east', 'west',
                'spring', 'summer', 'autumn', 'winter',
                'dawn', 'day', 'dusk', 'night',
                'morning', 'afternoon', 'evening', 'midnight',
                'smuggled', 'holiday', 'rainbow', 'golden',
                'comfortable', 'nuclear', 'heavy', 'light',
                'machine', 'assault', 'lead', 'steel', 'titanium',
                'tool', 'vehicle', 'transport', 'weapon',
                'gas', 'mask', 'filter', 'pot', 'plate', 'hide',
                'raw', 'quality', 'boiled', 'electric',
                'pistol', 'rifle', 'shotgun', 'shell', 'parts']
            lower_words = [w.lower() for w in words]
            eng_count = sum(1 for w in lower_words if w in eng_indicators)
            if len(lower_words) > 1 and eng_count >= len(lower_words) * 0.6:
                english_remaining.append(f"  {item['id']}: \"{item['name']}\"")

if english_remaining:
    print(f"\nStill in English ({len(english_remaining)}):")
    for e in english_remaining:
        print(e)
else:
    print("\nAll items are now in PT-BR!")
