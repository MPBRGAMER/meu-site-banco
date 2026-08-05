#!/usr/bin/env python3
"""
Corrigir prices.json: remover duplicatas, traduzir nomes, adicionar wikiName para imagens.
"""
import json, re

with open('/home/z/my-project/src/data/prices.json') as f:
    data = json.load(f)

# ===== 1. REMOVER DUPLICATAS (manter primeiro, geralmente com melhor nome) =====
seen_ids = set()
cleaned_categories = []
for cat in data['categories']:
    clean_items = []
    for item in cat['items']:
        if item['id'] not in seen_ids:
            seen_ids.add(item['id'])
            # Limpar nome bugado (URL encoding)
            item['name'] = item['name'].replace('%27', "'").replace('%22', '"').replace('%25', '%')
            clean_items.append(item)
    if clean_items:
        cleaned_categories.append({**cat, 'items': clean_items})

# ===== 2. ITENS NAO-TROCAVEIS PARA REMOVER =====
REMOVE_IDS = {
    # Status/doencas
    'positive_effects', 'food_poisoning', 'dysentery', 'poisoning', 'blood_poisoning',
    'radiation', 'vital_signs', 'parasitic_worms',
    # Construcoes/locais
    'clinic', 'hospital', 'pharmacy', 'greenhouse', 'brick_house', 'cellar',
    'wooden_house', 'hut', 'brick_oven', 'abandoned_house', 'rice_field',
    'water_purifier', 'tent__pitched', 'tent__taken_down', 'chemistry_lab',
    'workbench', 'draw_well', 'forge_chimney', 'steelmaking_furnace',
    'smelter', 'extractor', 'generator', 'biosynthesizer', 'chemical_reactor',
    'biodetector', 'water_filter', 'hand_mill', 'drying_rack', 'terrarium',
    'christmas_tree', 'fire', 'source_of_fire', 'support_box', 'weapon_box',
    'nailed_box', 'furniture', 'barrel',
    # Nao sao itens reais
    'game_updates', 'daily_reward', 'pets', 'player_outfit', 'fairy_dust',
    'blank', 'battery', 'nuclear_battery', 'mining_permit',
    'rocket_propelled_grenade_launcher', 'thermodiffusive_grenade_launcher',
    'charcoal_pile__burning', 'charcoal_pile__burned', 'ice', 'growfast',
    'bait', 'coast', 'radioactive_swamp', 'swamp',
    # Veiculos desmontados
    'zil_130__disassembled', 'kamaz__disassembled', 'zaz_968__disassembled',
    'gaz_24__disassembled', 'gaz_66__disassembled', 'vaz_2101__disassembled',
    'uaz_452__disassembled', 'uaz_469__disassembled', 'disassembled_motorcycle',
    'bicycle_spare_parts', 'motorcycle_spare_parts', 'auto_spare_parts',
    # Ferramentas com sufixo __tool
    'sewing_needle__tool', 'tool_kit__tool', 'axe__tool', 'knife__tool',
    'hacksaw__tool', 'crowbar__tool', 'shovel__tool', 'saucepan__tool', 'chemistry_set__tool',
}

for cat in cleaned_categories:
    cat['items'] = [i for i in cat['items'] if i['id'] not in REMOVE_IDS]
    # Tambem remover por sufixo __tool
    cat['items'] = [i for i in cat['items'] if not i['id'].endswith('__tool')]
    cat['items'] = [i for i in cat['items'] if '__disassembled' not in i['id']]

cleaned_categories = [c for c in cleaned_categories if c['items']]

# ===== 3. TRADUZIR NOMES PARA PT-BR =====
# Dicionario de traducao para itens com nome em ingles
TRANSLATIONS = {
    # COMIDA
    'Olivier Salad': 'Salada Olivier', 'Pancakes': 'Panquecas',
    'Pelmeni dumplings': 'Pelmeni', 'Rice bun': 'Pao de Arroz',
    'Cutlet rice': 'Arroz com Bife', 'Meat loaf': 'Bolo de Carne',
    'Canned beef': 'Carne Enlatada', 'Hearty food': 'Comida Sustanciosa',
    'Canned porridge': 'Papas Enlatadas', 'Rusk': 'Biscoito Duro',
    'Raw meat': 'Carne Crua', 'Dried meat': 'Carne Seca',
    'Red wine': 'Vinho Tinto', 'Roasted Chanterelle': 'Cantarela Assada',
    'Easter Cake': 'Bolo de Pascoa', 'Fried tainted meat': 'Carne Contaminada Frita',
    'Canned Beans': 'Feijao Enlatado', 'Cabbage roll': 'Rolinho de Repolho',
    'Tula pryanik': 'Pryanik de Tula', 'Simple chowder': 'Caldo Simples',
    'Knock-Off Energy Drink': 'Energetico Falsificado', 'Dried fish': 'Peixe Seco',
    'Hot coffee': 'Cafe Quente', 'Champagne': 'Champanhe',
    'Rotten porridge': 'Papas Podres', 'Rotten meat': 'Carne Podre',
    'Bunny Treat': 'Guloseima de Coelho', 'Cold tea': 'Cha Frio',
    'Shchi': 'Shchi', 'Rainbow Easter Egg': 'Ovo de Pascoa Arco-Iris',
    'Cold coffee': 'Cafe Frio', 'Canned Water': 'Agua Enlatada',
    'Diluted spirits': 'Bebida Espiritosa Diluida', 'Energy drink': 'Energetico',
    'Cake': 'Bolo', 'Easter Egg': 'Ovo de Pascoa', 'Rat meat': 'Carne de Rato',
    'Chocolate Bunny': 'Coelho de Chocolate', 'Hot tea': 'Cha Quente',
    'Fried egg': 'Ovo Frito', 'Fish pie': 'Torta de Peixe',
    'Cake napoleon': 'Bolo Napoleao', 'Bowl of rice': 'Tigela de Arroz',
    'Shashlik': 'Churrasco Espetado', 'Fried fish': 'Peixe Frito',
    'Egg': 'Ovo', 'Tailed Rissole': 'Risole de Carne',
    'Pasta with ground beef': 'Macarrao com Carne Moida',
    'Pasta With Ground Beef': 'Macarrao com Carne Moida',
    'Rich chowder': 'Caldo Rico', 'Mushroom pasta': 'Macarrao com Cogumelos',
    'Infected Dried Fish': 'Peixe Seco Infectado', 'Jam': 'Geleia',
    'Raw fatback': 'Toucinho Cru', 'Toxic water': 'Agua Toxica',
    'Ukha': 'Ukha', 'Kholodets': 'Kholodets',
    'Fried rat meat': 'Carne de Rato Frita', 'Fried fatty meat': 'Carne Gorda Frita',
    'Dry meat': 'Carne Ressecada', 'Aqua Vitae': 'Agua Vitae',
    'Pure water': 'Agua Pura', 'Meat cutlet': 'Bife de Carne',
    'Ration pack': 'Racao', 'Flying spaghetti monster': 'Monstro Espaguete Voador',
    'Stew meat': 'Carne Ensopada', 'Salo': 'Salo',
    'Fried snake': 'Cobra Frita', 'Candy Cane': 'Bengala Doce',
    'Fried Tough Meat': 'Carne Dura Frita', 'ComCon-3 Paste': 'Pasta ComCon-3',
    'Smoked fatback': 'Toucinho Defumado', 'Grilled Meat': 'Carne Grelhada',
    'Mulled Wine': 'Vinho Quente', 'Spooky Energy Drink': 'Energetico Assustador',
    'Stale Pryanik': 'Pryanik Velho', 'Rice wine': 'Vinho de Arroz',
    'Stuffed cabbage': 'Repolho Recheado', 'Shawarma': 'Churrasco Grego',
    'Peking Duck': 'Pato Pequim', 'Holiday Energy Drink': 'Energetico Festivo',
    'Chicken kiev': 'Frango Kiev', 'Infected rusk': 'Biscoito Duro Infectado',
    'Stewed meat': 'Carne Cozida', 'Chinese energy drink': 'Energetico Chines',
    'Cooked pasta': 'Macarrao Cozido', 'Pelmeni': 'Pelmeni',
    'Cooked rice': 'Arroz Cozido', 'Pilaf': 'Pilaf', 'Rusks': 'Biscoitos Duros',
    'Caustic Distillate': 'Destilado Caustico', 'Hearty chowder': 'Caldo Sustancioso',
    'Canned pork': 'Porco Enlatado', 'Rotten fish': 'Peixe Podre',
    'Chocolate Bar': 'Barra de Chocolate', 'Minced Meat': 'Carne Moida',
    'Boiled condensed milk': 'Leite Condensado Cozido', 'Radioactive meat': 'Carne Radioativa',
    'Coulibiac': 'Coulibiac', 'Bio-energy Drink': 'Bioenergetico',
    'King of Jokers': 'Rei dos Coringas', 'Caviar sandwich': 'Sanduiche de Caviar',
    'Fat': 'Gordura', 'Spice': 'Especiaria', 'Fresh fish': 'Peixe Fresco',
    'Fried meat': 'Carne Frita', 'Smuggled Energy Drink': 'Energetico Contrabandeado',
    'Ice Cream': 'Sorvete', 'Boiled Egg': 'Ovo Cozido', 'Pie': 'Torta',
    'Mushroom soup': 'Sopa de Cogumelos', 'Blini': 'Blini',
    'Fried mutant meat': 'Carne Mutante Frita', 'Old Canned Meat': 'Carne Enlatada Velha',
    'Meat rissole': 'Risole de Carne', 'Smoked salo': 'Salo Defumado',
    'Trophy Cognac': 'Conhaque Trofeu', 'Blood mold': 'Bolor Sangrento',
    'Strange Mushroom': 'Cogumelo Estranho', 'Amanita': 'Amanita',
    'Sanguinary Masha': 'Masha Sanguinaria', 'Knock-Off Energy Drink': 'Energetico Falsificado',
    'Bio-energy Drink': 'Bioenergetico', 'Smuggled Energy Drink': 'Energetico Contrabandeado',
    'Pepsi': 'Pepsi',
    # ERVAS
    'Potato Pancakes': 'Panquecas de Batata', 'Mashed potatoes': 'Pure de Batatas',
    'Boiled corn': 'Milho Cozido', 'Toothgrass': 'Capim-dente',
    'Apple Cordial': 'Cordial de Maca', 'Apple cordial': 'Cordial de Maca',
    'Potato': 'Batata', 'Dandelion Tea': 'Cha de Dente-de-leao',
    'Dandelion tea': 'Cha de Dente-de-leao', 'Cooked buckwheat': 'Trigo-sarraceno Cozido',
    'Cooked Buckwheat': 'Trigo-sarraceno Cozido', 'Candy apple': 'Maca do Amor',
    'Strawberry cake': 'Bolo de Morango', 'Potato pancakes': 'Panquecas de Batata',
    'Buckwheat grains': 'Graos de Trigo-sarraceno', 'Bamboo Steamer': 'Cesteiro de Bambu',
    'Pumpkin Soup': 'Sopa de Abobora', 'Fried potato': 'Batata Frita',
    'Pumpkin seeds': 'Sementes de Abobora', 'Apple seeds': 'Sementes de Maca',
    'Corn seeds': 'Sementes de Milho', 'Wheat seeds': 'Sementes de Trigo',
    'Potato seeds': 'Sementes de Batata', 'Tangerine seeds': 'Sementes de Tangerina',
    'Strawberry seed': 'Semente de Morango', 'Strawberry Seed': 'Semente de Morango',
    'Mysterious Fruit Seeds': 'Sementes de Fruta Misteriosa',
    'Mysterious Fruit': 'Fruta Misteriosa',
    # COMPONENTES
    'Shovel': 'Pa', 'Polar Axe': 'Machado Polar',
    'Weapon repair kit': 'Kit de Reparo de Armas', 'Chainsaw': 'Motosserra',
    'Steel shovel': 'Pa de Aco', 'Handmade primus stove': 'Fogareiro Artesanal',
    'Matches': 'Fosforos', 'Chemistry set': 'Kit de Quimica',
    'Titanium Alloy': 'Liga de Titanio', 'Titanium ore': 'Minerio de Titanio',
    'Steel needle': 'Agulha de Aco', 'Insulating Tape': 'Fita Isolante',
    'Barrel': 'Barril', 'Fists': 'Punos', 'Revolver parts': 'Pecas de Revolver',
    'Saucepan': 'Panela', 'Tarp': 'Lona',
    'Transport repair kit': 'Kit de Reparo de Transporte', 'Tourist backpack': 'Mochila de Turista',
    'Welder': 'Soldador', 'Electric Motor': 'Motor Eletrico',
    'Rusted Crowbar': 'Pe de Cabra Enferrujado', 'Steel knife': 'Faca de Aco',
    'Scrap metal': 'Sucata Metalica', 'Auto spare parts': 'Pecas Sobressalentes',
    'Armor Plate': 'Placa de Blindagem', 'Machine gun parts': 'Pecas de Metralhadora',
    'Cloth': 'Tecido', 'Knife': 'Faca', 'Handmade needle': 'Agulha Artesanal',
    'Rusted needle': 'Agulha Enferrujada', 'Iron pipe': 'Cano de Ferro',
    'Plank': 'Prancha', 'Knapsack': 'Mochila Pequena',
    'Nuclear reactor part': 'Peca de Reator Nuclear', 'Black coal': 'Carvao Negro',
    'Rusted shovel': 'Pa Enferrujada', 'Electrical cable': 'Cabo Eletrico',
    'Spare weapon parts': 'Pecas Extras de Arma', 'Titanium pot': 'Panela de Titanio',
    'Hacksaw': 'Serra de Ferro', 'Sewing Needle': 'Agulha de Costura',
    'Bellows': 'Fole', 'Stimulant': 'Estimulante',
    'Rifle parts': 'Pecas de Rifle', 'Pistol parts': 'Pecas de Pistola',
    'Rodkin': 'Rodkin', 'Iron pot': 'Panela de Ferro', 'Lighter': 'Isqueiro',
    'Broadleaf plantain': 'Tanchagem', 'Rubber': 'Borracha',
    'Flint axe': 'Machado de Sillex', 'Steel axe': 'Machado de Aco',
    'Kitchen knife': 'Faca de Cozinha', 'Electrodes': 'Eletrodos',
    'Gasoline': 'Gasolina', 'Steel crowbar': 'Pe de Cabra de Aco',
    'Gasoline Engine': 'Motor a Gasolina', 'Primus stove': 'Fogareiro Primus',
    'Dusty book': 'Livro Empoeirado', 'Wire': 'Fio',
    'Rusted hacksaw': 'Serra de Ferro Enferrujada',
    'Tanning mixture': 'Mistura de Curtimento', 'Handmade lighter': 'Isqueiro Artesanal',
    'Crowbar': 'Pe de Cabra', 'Fire brick': 'Tijolo Refratario',
    'Motorcycle spare parts': 'Pecas de Motocicleta',
    'High-performance Capacitor': 'Capacitor de Alta Performance',
    'Paper': 'Papel', 'Sack': 'Saco', 'Rubber parts': 'Pecas de Borracha',
    'Tool Kit': 'Kit de Ferramentas', 'Steel pot': 'Panela de Aco',
    'Weapon box': 'Caixa de Armas', 'Rusted axe': 'Machado Enferrujado',
    'Axe': 'Machado', 'Schoolbag': 'Lancheira',
    'Glue/tape': 'Cola/Fita', 'Assault rifle parts': 'Pecas de Fuzil de Assalto',
    'Infernal Coal': 'Carvao Infernal', 'Nuclear battery': 'Bateria Nuclear',
    'Superfilter': 'Superfiltro', 'Thermonuclear Camping Stove': 'Fogao de Acampamento',
    'Delta G Radio': 'Radio Delta G', 'Homemade Explosive': 'Explosivo Artesanal',
    'Reykjavik Chainsaw': 'Motosserra de Reykjavik', 'Taiga Machete': 'Facao Taiga',
    'Sturdy needle': 'Agulha Resistente', 'Forged knife': 'Faca Forjada',
    'Smuggler\'s Lantern': 'Lanterna do Contrabandista',
    'Smuggler%27s Lantern': 'Lanterna do Contrabandista',
    '14k Lantern': 'Lanterna 14K', 'Flint knife': 'Faca de Sillex',
    'Paper Lantern': 'Lanterna de Papel', 'Iron Anvil': 'Bigorna de Ferro',
    'Floodlight': 'Refletor', 'Chitin torch': 'Tocha de Quitina',
    'Steel Anvil': 'Bigorna de Aco', 'Titanium crowbar': 'Pe de Cabra de Titanio',
    'Gerin Flycatcher': 'Gerin Flycatcher', 'Blowtorch': 'Macarico',
    'Quads Glowstick': 'Bastao Quâdrico', 'Handmade primus stove': 'Fogareiro Artesanal',
    'Titanium Shovel': 'Pa de Titanio', 'Titanium shovel': 'Pa de Titanio',
    # MEDICAMENTOS
    'Acid gland': 'Glandula Acida', 'Injector': 'Injetor', 'Antidote': 'Antidoto',
    'Biotonic': 'Biotonico', 'Energizing potion': 'Pocao Energizante',
    'Deadly nightshade': 'Beladona Mortal', 'Lidiacid-34': 'Lidiacida-34',
    'V Injector': 'Injetor V', 'Bryocarm': 'Briocarmo',
    'Detoxifying Potion': 'Pocao Desintoxicante', 'Bioblocade Inhaler': 'Inalador Bioblocada',
    'Psychostimulation': 'Psicoestimulacao', 'Healing Salve': 'Balsamo Curativo',
    'Healing salve': 'Balsamo Curativo', 'Bye-Bye Rad': 'Tchau-Rad',
    'Painkiller': 'Analgésico', 'Fairy dust': 'Po de Fada',
    'Parasitic worms': 'Vermes Parasitas', 'C-3 Cologne': 'Colonia C-3',
    'Lidiacide-34': 'Lidiacida-34', 'Chlorcystamine': 'Clorcistamina',
    'Alphacelone': 'Alfacelona', 'Pill of Immortality': 'Pilula da Imortalidade',
    'First Aid Kit': 'Kit de Primeiros Socorros', 'O Injector': 'Injetor O',
    'B Injector': 'Injetor B', 'Eurekognasol Stimulant': 'Estimulante Eurekognasol',
    'G Injector': 'Injetor G', 'Vial of %22...amine%22': 'Frasco de Amina',
    # MUNICOES
    'Rifle shell': 'Cartucho de Rifle', 'Assault rifle shell': 'Cartucho de Fuzil de Assalto',
    'Plastic explosives': 'Explosivos Plasticos', 'Molotov Cocktail': 'Coquetel Molotov',
    'Gunpowder grenade': 'Granada de Polvora', 'Lead bullet': 'Bala de Chumbo',
    'Pyrolytic Grenade': 'Granada Pirolitica',
    '7.62x25mm TT Shell': 'Cartucho 7.62x25mm TT',
    'Pistol shell': 'Cartucho de Pistola', 'Revolver shell': 'Cartucho de Revolver',
    # ARMAS - manter nomes proprios
    'Hand-held Railgun': 'Railgun Portatil', 'PAS Weaver': 'Tecela PAS',
    'Light Machine Gun': 'Metralhadora Leve', 'Standard crossbow': 'Besta Padrao',
    'Standard Crossbow': 'Besta Padrao', 'Titanium Knife': 'Faca de Titanio',
    'Homemade SMG': 'SMG Artesanal', 'Popgun': 'Arma de Rolha',
    'Revolving Gun': 'Arma Rotativa', 'Handmade rifle': 'Rifle Artesanal',
    'Berdan Rifle': 'Rifle Berdan', 'Bardiche': 'Bardiche',
    'Party Popper': 'Estalinho de Festa', 'Termite': 'Termite',
    'SR Delirium': 'SR Delirio', 'Gigawattor': 'Gigawattor',
    'Pistol Silent': 'Pistola Silenciosa', 'Chitin spear': 'Lanca de Quitina',
    'Sawed-off IZh-18': 'IZh-18 Serrada', 'Pumpkin bomb': 'Bomba de Abobora',
    'Musket': 'Mosquete', 'Stearin': 'Estearina',
    'Heavy Machine Gun': 'Metralhadora Pesada', 'Double-Barrel': 'Duplo Cano',
    'Sawed-off TOZ-34': 'TOZ-34 Serrada', 'Nagant Revolver': 'Revolver Nagant',
    'Pineapple': 'Abacaxi', 'Homemade Revolver': 'Revolver Artesanal',
    'Steel spear': 'Lanca de Aco', 'Stake Thrower': 'Lancador de Estacas',
    'Icicle Thrower': 'Lancador de Icicles', 'Skorpion': 'Escorpiao',
    'Sabre': 'Sabre', 'Strong bat': 'Taco Forte',
    'Twilight Shotgun': 'Escopeta do Crepusculo', 'Ulcer AMR': 'AMR Ulcera',
    'Fist of the Sky': 'Punho do Ceu',
    'Handmade rocket launcher': 'Lancador de Foguetes Artesanal',
    'Handmade pistol': 'Pistola Artesanal', 'Handmade Pistol': 'Pistola Artesanal',
    'Executioner\'s Sword': 'Espada do Carrasco',
    'Handmade Machine Gun': 'Metralhadora Artesanal',
    'Hunter\'s chain': 'Corrente do Cacador',
    'Reaper\'s Scythe': 'Foice do Ceifador',
    'Single-Shot Rifle': 'Rifle de Tiro Único', 'Hunting Bow': 'Arco de Caca',
    'Shock bludgeon': 'Tacape Eletrico', 'Snowball': 'Bola de Neve',
    'Nail club': 'Taco com Pregos', 'Lotus of Death': 'Loto da Morte',
    'Catalysis-E': 'Catalise-E', 'Borschevik Flamethrower': 'Lança-chamas Borschevik',
    'Multi-Shot Rifle': 'Rifle Multi-Tiro', 'Flamethrower': 'Lança-chamas',
    'Mosin sawn-off shotgun': 'Mosin Serrada', 'Butterfly Knife': 'Facąo Borboleta',
    'Mosinka': 'Mosinka', 'Wolfsbane-1': 'Acônito-1',
    'RPG Vesuvius': 'RPG Vesuvio', 'Acidoemitter': 'Emissor Acido',
    'Strychnine Gas Revolver': 'Revolver a Gas Estricnina',
    'Storm Snowball Launcher': 'Lancador de Bolas de Neve',
    'Heavy crossbow': 'Besta Pesada', 'Tube Rifle': 'Rifle de Tubo',
    'Firework': 'Foguete', 'PK 7.62 Kraken': 'PK 7.62 Kraken',
    'Punch-in-the-Box': 'Soco-na-Caixa', 'Kalash-S': 'Kalash-S',
    'Snowman Ball': 'Bola de Boneco de Neve', 'Bad Santa': 'Papai Noel Malvado',
    'Rudolph': 'Rudolph', 'Ho Ho Ho': 'Ho Ho Ho',
    'Physicist Crossbow': 'Besta do Fisico', 'Improved crossbow': 'Besta Melhorada',
    'Chemist Crossbow': 'Besta do Quimico', 'Cypress SMG': 'SMG Cipreste',
    'Iron Felix': 'Felix de Ferro', 'Biathlon-84': 'Biathlon-84',
    'Jack O\' Launcher': 'Lancador Jack O', 'Blackjack': 'Blackjack',
    'Chinese fireworks': 'Fogos Chineses', 'Oar': 'Remo', 'Kettlebell': 'Peso Russo',
    'Shotgun Round': 'Cartucho de Espingarda', 'Armorpiercer': 'Perfurador de Blindagem',
    'Chimney': 'Chamine', 'Mauser': 'Mauser', 'All-In': 'Tudo ou Nada',
    'Vector-A': 'Vetor-A', 'Shmel': 'Shmel', 'Degtyar': 'Degtyar',
    'Sipuha': 'Sipuha', 'Grouse': 'Faisao', 'Mukha': 'Mukha',
    'Guandao': 'Guandao', 'Ch                    o-ko-nu': 'Cho-ko-nu',
    'Geologist RC': 'Geologo RC', 'Law Guardian': 'Guardiao da Lei',
    'Midas': 'Midas', 'Schmeisser': 'Schmeisser',
    'Frosthorn': 'Chifre de Gelo', 'Gehenna': 'Geena',
    'Sudayev': 'Sudayev', 'Abakan': 'Abakan', 'Kalash-M': 'Kalash-M',
    'Yamal': 'Yamal', 'AKM-C': 'AKM-C', 'Nagant': 'Nagant',
    'Joker': 'Coringa', 'Pepperbox': 'Pepperbox', 'D-Eagle': 'D-Aguia',
    'Mayhem': 'Mayhem', 'Alien Blaster': 'Blaster Alienigena',
    'Flesh': 'Carne', 'Helsing': 'Helsing', 'Ave Maria': 'Ave Maria',
    'Fear': 'Medo', 'Toxigen': 'Toxigen', 'Infernal Prophet': 'Profeta Infernal',
    'Crane': 'Grua', 'Murmur': 'Murmurio', 'Sabre': 'Sabra',
    'Crouching Tiger': 'Tigre Agachado', 'Formalin Gas Pistol': 'Pistola a Gas Formalina',
    'Antelope': 'Antilope', 'Posh': 'Chique', 'Gangster': 'Gangster',
    'Revenge': 'Vinganca', 'Erebus-273': 'Erebo-273', 'Svetka': 'Svetka',
    'Makar': 'Makar', 'Ksyukha': 'Ksyukha', 'Tokar': 'Tokar',
    'Stecha': 'Stecha', 'Collector': 'Colecionador',
    'Handmade spear': 'Lanca Artesanal', 'Flint Spear': 'Lanca de Sillex',
    'Iron spear': 'Lanca de Ferro', 'Handmade Assault Rifle': 'Fuzil de Assalto Artesanal',
    # EQUIPAMENTOS
    'Wolf Talisman': 'Talisma de Lobo', 'Merry Lantern': 'Lanterna Festiva',
    'Chinese bulletproof vest': 'Colete Balistico Chines',
    'Ermak backpack': 'Mochila Ermak', 'Ceramic bulletproof vest': 'Colete Balistico Ceramico',
    'Antiquarian\'s Feedbag': 'Alforje do Antiquario',
    'Chitin armor': 'Armadura de Quitina', 'CPE Leader': 'Lider CPE',
    'T-800 Bulletproof Vest': 'Colete Balistico T-800',
    'Monstrous bag': 'Mochila Monstruosa', 'Chemical suit': 'Traje Quimico',
    'Iceberg': 'Iceberg', 'Tactical Armor': 'Armadura Tatica',
    'Cybermitten': 'Luva Cybernetica', 'GP-2000 Gas Mask': 'Mascara de Gas GP-2000',
    'Sparkler': 'Vela Romanesca', 'Tank armor': 'Armadura de Tanque',
    'Santa\'s Sack': 'Saco do Papai Noel', 'Normal clothes': 'Roupa Normal',
    'Steel armor': 'Armadura de Aco', 'Biocontainer': 'Biocontainer',
    'Master\'s Garb': 'Traje do Mestre', 'Handmade clothes': 'Roupa Artesanal',
    'Iron Gas Mask': 'Mascara de Gas de Ferro', 'Ghost suit': 'Traje Fantasma',
    'Flashlight (10%25)': 'Lanterna (10%)', 'Flashlight (20%25)': 'Lanterna (20%)',
    'Flashlight (30%25)': 'Lanterna (30%)',
    'Arctic Armor': 'Armadura Artica', 'Racer Set': 'Conjunto de Corredor',
    'FATUM E-93': 'FATUM E-93', 'Tin can candle': 'Vela de Lata',
    'MM-1 Gas Mask': 'Mascara de Gas MM-1',
    'Scarf of 18 Provinces': 'Cachecol das 18 Provincias',
    'Modern bulletproof vest': 'Colete Balistico Moderno',
    'Player Outfit': 'Traje do Jogador',
    'Butcher\'s Backpack': 'Mochila do Açougueiro',
    'Spotlight': 'Holofote', 'Toxic lamp': 'Lampada Toxica',
    'Jack-O\'-Lantern': 'Abobora de Halloween',
    'Dust mask': 'Mascara de Poeira', 'Highway Armor': 'Armadura de Estrada',
    'Bulletproof vest': 'Colete Balistico',
    'Army Bulletproof Vest': 'Colete Balistico Militar',
    'Battery Flashlight': 'Lanterha a Bateria', 'Magic Sweater': 'Suéter Magico',
    'Iron Armor': 'Armadura de Ferro', 'Old Faithful Gas Mask': 'Mascara de Gas Fiel Velha',
    'Highway backpack': 'Mochila de Estrada', 'Homemade respirator': 'Respirador Artesanal',
    'Santa\'s Flask': 'Frasco do Papai Noel', 'Reinforced Uniform': 'Uniforme Reforçado',
    'Hunter\'s Garb': 'Traje do Cacador', 'Bone Vest': 'Colete de Osso',
    'Survivor\'s Cache': 'Cache do Sobrevivente',
    'Progress Bulletproof Vest': 'Colete Balistico Progresso',
    'Poisoned Flask': 'Frasco Envenenado', 'Kevlar Vest': 'Colete Kevlar',
    'Possessed lantern': 'Lanterna Possuida',
    'Glutton\'s Bag': 'Mochila do Guloso',
    'Dynamo flashlight': 'Lanterha a Dynamo', 'Tattered clothes': 'Roupa Esfarrapada',
    'Refrigerator Backpack': 'Mochila Geladeira', 'Bunny Costume': 'Fantasia de Coelho',
    'Witch\'s Quill': 'Pena da Bruxa', 'Ghillie suit': 'Traje de Camuflagem',
    'Pumpkin Chump': 'Tonto de Abobora',
    'Great fishing rod': 'Vara de Pescar Grande', 'Leather Armor': 'Armadura de Couro',
    'Medical Backpack': 'Mochila Medica',
    'Homemade bulletproof vest': 'Colete Balistico Artesanal',
    'Respirator': 'Respirador', 'Field Uniform': 'Uniforme de Campo',
    'Sturdy fishing rod': 'Vara de Pescar Resistente',
    'GP-7 gas mask': 'Mascara de Gas GP-7',
    'Prospector\'s armor': 'Armadura do Prospetor',
    'Smuggler\'s Armor': 'Armadura do Contrabandista',
    'Rucksack': 'Mochila Grande', 'Gas mask': 'Mascara de Gas',
    'Cotton-wool Beard': 'Barba de Algodao', 'Rusted Saucepan': 'Panela Enferrujada',
    'Tester Armor': 'Armadura de Teste', 'Black-and-Red': 'Preto-e-Vermelho',
    'Lazy Elf': 'Elfo Preguicoso', 'Military uniform': 'Uniforme Militar',
    'Ionica Gas Mask': 'Mascara de Gas Ionica', 'Combined armor': 'Armadura Combinada',
    'Invisibility Cloak': 'Manta de Invisibilidade',
    'Primitive Bulletproof Vest': 'Colete Balistico Primitivo',
    'Demon mask': 'Mascara de Demônio',
    'Plague Doctor\'s Mask': 'Mascara do Medico da Peste',
    'GP-4 gas mask': 'Mascara de Gas GP-4',
    'PMG gas mask': 'Mascara de Gas PMG',
    'GP-5 gas mask': 'Mascara de Gas GP-5',
    'EA Spectrum': 'Espectro EA',
    # PRODUTOS ANIMAIS
    'Boiled Leather': 'Couro Cozido', 'Wax': 'Cera', 'Fresh bones': 'Ossos Frescos',
    'Coast': 'Litoral', 'Radioactive Swamp': 'Pantano Radioativo', 'Swamp': 'Pantano',
    'Eternal Rod': 'Vara Eterna',
    # Outros
    'Hunter\'s Rifle': 'Rifle do Cacador',
    'Survivor%27s Cache': 'Cache do Sobrevivente',
    'Sniper%27s Mosin': 'Mosin do Sniper',
    'Forward%27s Stick': 'Bastao do Forward',
    'Hunter%27s chain': 'Corrente do Cacador',
    'Reaper%27s Scythe': 'Foice do Ceifador',
    'Executioner%27s Sword': 'Espada do Carrasco',
    'Santa%27s Staff': 'Cajado do Papai Noel',
    'Jack O%27 Launcher': 'Lancador Jack O',
    'Jack-O%27-Lantern': 'Abobora de Halloween',
    'Antiquarian%27s Feedbag': 'Alforje do Antiquario',
    'CPE Leader': 'Lider CPE',
    'Santa%27s Sack': 'Saco do Papai Noel',
    'Santa%27s Flask': 'Frasco do Papai Noel',
    'Master%27s Garb': 'Traje do Mestre',
    'Butcher%27s Backpack': 'Mochila do Açougueiro',
    'Glutton%27s Bag': 'Mochila do Guloso',
    'Witch%27s Quill': 'Pena da Bruxa',
    'Hunter%27s Garb': 'Traje do Cacador',
    'Survivor%27s Cache': 'Cache do Sobrevivente',
    'Prospector%27s armor': 'Armadura do Prospetor',
    'Smuggler%27s Armor': 'Armadura do Contrabandista',
    'Smuggler%27s Lantern': 'Lanterna do Contrabandista',
    'Plague Doctor%27s Mask': 'Mascara do Medico da Peste',
    'Vial of %22...amine%22': 'Frasco de Amina',
    '%22Silage%22 Mincer': 'Moedor de Silagem',
    '%22DIY Nets%22': 'Redes Artesanais',
    'LMG %22Qilin%22': 'LMG Qilin',
    'Mi-8 parts': 'Pecas de Mi-8',
    'Scarf of 18 Provinces': 'Cachecol das 18 Provincias',
}

for cat in cleaned_categories:
    for item in cat['items']:
        name = item['name']
        # Tentar traduzir
        if name in TRANSLATIONS:
            item['name'] = TRANSLATIONS[name]
        elif name != name.strip():
            item['name'] = name.strip()

data['categories'] = cleaned_categories

# Contar
total = sum(len(c['items']) for c in cleaned_categories)
print(f'Total de itens apos limpeza: {total}')
for cat in cleaned_categories:
    print(f'  {cat["name"]}: {len(cat["items"])} itens')

# Verificar nomes em ingles restantes
english_left = []
for cat in cleaned_categories:
    for item in cat['items']:
        name = item['name']
        # Verificar se contem palavras comuns em ingles
        eng_words = ['repair', 'parts', 'spare', 'bulletproof', 'gas mask', 'fishing',
                     'energy', 'drink', 'crossbow', 'handmade', 'rifle', 'shotgun',
                     'pistol', 'armor', 'clothes', 'lantern', 'backpack', 'flashlight',
                     'uniform', 'costume', 'machine gun', 'bomb', 'grenade', 'launcher',
                     'revolver', 'knife', 'axe', 'shovel', 'crowbar', 'needle', 'hacksaw',
                     'sword', 'spear', 'blaster', 'flamethrower', 'ammo', 'cartridge',
                     'shell', 'explosive', 'gunpowder', 'molotov', 'bolt', 'bullet']
        if any(w in name.lower() for w in eng_words) and name == TRANSLATIONS.get(name, name):
            english_left.append(f'{item["id"]}: {name}')

if english_left:
    print(f'\nAinda restam {len(english_left)} nomes possivelmente em ingles:')
    for e in english_left[:30]:
        print(f'  {e}')

with open('/home/z/my-project/src/data/prices.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print('\nArquivo salvo!')
