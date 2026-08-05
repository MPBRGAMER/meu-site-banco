#!/usr/bin/env python3
"""
Audit prices.json for:
1. Items still in English
2. All items should be tradeable (droppable/transferable between players)
"""

import json
import re
from pathlib import Path

PRICES_PATH = Path('/home/z/my-project/src/data/prices.json')

with open(PRICES_PATH) as f:
    data = json.load(f)

all_items = []
for cat in data['categories']:
    for item in cat['items']:
        all_items.append({**item, 'category': cat['name'], 'cat_id': cat['id']})

print(f"Total de itens: {len(all_items)}")

# 1. Find English names
print("\n" + "=" * 60)
print("ITENS AINDA EM INGLES")
print("=" * 60)

# Common English words that indicate English names
english_indicators = [
    r'\bAmmo\b', r'\bAmmunition\b', r'\bArmor\b', r'\bBackpack\b',
    r'\bBandage\b', r'\bBattery\b', r'\bBullet\b', r'\bCan\b',
    r'\bCartridge\b', r'\bClothes\b', r'\bCoal\b', r'\bCure\b',
    r'\bEngine\b', r'\bFilter\b', r'\bFish\b', r'\bFlour\b',
    r'\bFuel\b', r'\bGas\b', r'\bGrenade\b', r'\bGun\b',
    r'\bHammer\b', r'\bHelmet\b', r'\bHoney\b', r'\bIron\b',
    r'\bKnife\b', r'\bLeather\b', r'\bMask\b', r'\bMeat\b',
    r'\bMedicine\b', r'\bMetal\b', r'\bMotor\b', r'\bOil\b',
    r'\bParts\b', r'\bPistol\b', r'\bPoison\b', r'\bPot\b',
    r'\bPotion\b', r'\bRifle\b', r'\bRope\b', r'\bSalt\b',
    r'\bScrap\b', r'\bSeeds\b', r'\bShell\b', r'\bSoup\b',
    r'\bSword\b', r'\bTea\b', r'\bTent\b', r'\bTool\b',
    r'\bVest\b', r'\bWater\b', r'\bWeapon\b', r'\bWine\b',
    r'\bWire\b', r'\bWood\b', r'\bWorm\b',
    # Phrases
    r'\bEnergy Drink\b', r'\bFirst Aid\b', r'\bGas Mask\b',
    r'\bMachine Gun\b', r'\bRepair Kit\b', r'\bBulletproof\b',
]

# More reliable: detect if name is purely ASCII English words
# (PT-BR names have accented chars like ã, é, ç, etc.)
# But some PT-BR words don't have accents (e.g., "Maca", "Carne")
# So we need a smarter approach

# Check for names that are clearly English
english_items = []

# Simple heuristic: if the name contains common English-only words/patterns
# and does NOT contain any Portuguese-specific patterns
for item in all_items:
    name = item['name']
    item_id = item['id']
    
    # Skip names with accented characters (likely PT-BR)
    has_accent = bool(re.search(r'[àáâãäéèêëíìîïóòôõöúùûüçÀÁÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]', name))
    
    # Common PT-BR words that don't need accents
    pt_br_words = [
        'Agua', 'Maca', 'Carne', 'Pao', 'Ovo', 'Mel', 'Sal', 'Pao',
        'Arroz', 'Feijao', 'Leite', 'Queijo', 'Manteiga', 'Açucar',
        'Farinha', 'Cebola', 'Alho', 'Tomate', 'Batata', 'Milho',
        'Cafe', 'Cha', 'Vinho', 'Cerveja', 'Vodka', 'Agua', 'Fogo',
        'Mesa', 'Cadeira', 'Porta', 'Janela', 'Parede', 'Chao', 'Teto',
        'Ferro', 'Aco', 'Ouro', 'Prata', 'Cobre', 'Chumbo', 'Aluminio',
        'Madeira', 'Pedra', 'Tijolo', 'Cimento', 'Areia', 'Vidro',
        'Roupa', 'Bota', 'Luva', 'Chapeu', 'Casaco', 'Calca',
        'Mochila', 'Bolsa', 'Caixa', 'Balde', 'Corda', 'Prego',
        'Parafuso', 'Ferramenta', 'Martelo', 'Serra', 'Chave',
        'Bala', 'Arma', 'Fuzil', 'Pistola', 'Espada', 'Faca',
        'Mascara', 'Colete', 'Armadura', 'Escudo', 'Capacete',
        'Comida', 'Bebida', 'Remedio', 'Veneno', 'Bomba',
        'Sangue', 'Osso', 'Pele', 'Couro', 'Tecido', 'Linha',
        'Agulha', 'Tesoura', 'Panela', 'Frigideira', 'Garrafa',
        'Copos', 'Prato', 'Colher', 'Faca', 'Garfo',
        'Gasolina', 'Diesel', 'Oleo', 'Bateria', 'Motor',
        'Radio', 'Lanterna', 'Isqueiro', 'Fosforo', 'Vela',
        'Semente', 'Planta', 'Arvore', 'Flor', 'Folha',
        'Cogumelo', 'Fruta', 'Verdura', 'Legume', 'Peixe',
        'Carne', 'Porco', 'Galinha', 'Vaca', 'Cachorro', 'Gato',
        'Tabaco', 'Cigarro', 'Charuto',
        'Tendencia', 'Preco', 'Moeda', 'Dinheiro', 'Troca',
        'Concreto', 'Tinta', 'Pincel', 'Papel', 'Livro',
        'Mapa', 'Bussola', 'Relogio', 'Termometro',
        'Pneu', 'Roda', 'Cano', 'Tubo', 'Valvula',
        'Eletrodo', 'Fio', 'Cabo', 'Plugue',
        'Gesso', 'Goma', 'Cola', 'Fita',
        'Cera', 'Enxofre', 'Salitre', 'Carvao',
        'Dinamite', 'Nitro', 'Polvora', 'Espingarda',
        'RPG', 'Lancador', 'Missil', 'Mina',
        'Barraca', 'Tenda', 'Fogueira', 'Lareira',
        'Jardim', 'Fazenda', 'Estufa',
        'Bunker', 'Bunker', 'Refugio', 'Abrigo',
        'Uniforme', 'Tatico', 'Militar', 'Camuflado',
        'Quimico', 'Radioativo', 'Toxico', 'Infectado',
        'Mutante', 'Zumbi', 'Monstro',
        'Energia', 'Stamina', 'Vida', 'Fome', 'Sede',
        'Experiencia', 'Nivel', 'Habilidade',
        'Sobrevivente', 'Bandit', 'Mercador', 'NPC',
        'Base', 'Laboratorio', 'Oficina', 'Hospital',
        'Cranio', 'Dente', 'Chifre', 'Pena',
        'Gordo', 'Magra', 'Fresca', 'Estragada',
        'Assado', 'Cozido', 'Frito', 'Defumado', 'Salgado', 'Seco',
        'Enlatado', 'Congelado', 'Podre', 'Apodrecido',
        'Comprimido', 'Xarope', 'Injecao', 'Soro', 'Vacina',
        'Antidoto', 'Antitoxina', 'Antibiotico', 'Vitamina',
        'Adesivo', 'Lubrificante', 'Solvente', 'Acido',
        'Oxido', 'Ferrugem', 'Poeira', 'Cinza',
        'Neve', 'Gelo', 'Agua', 'Vapor',
        'Titanio', 'Tungstenio', 'Uranio', 'Plutonio',
        'Kevlar', 'Ceramica', 'Composite', 'Titânio',
    ]

# Actually, let me take a much simpler and more reliable approach:
# Just check if ALL words in the name are common English words
# Portuguese words have distinct patterns

def is_likely_english(name):
    """Check if a name is likely English rather than PT-BR."""
    # If it has accented chars, it's definitely not pure English
    if re.search(r'[àáâãäéèêëíìîïóòôõöúùûüçÀÁÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ]', name):
        return False
    
    # Common PT-BR indicators (even without accents)
    pt_indicators = [
        'Agua', 'Aco', 'Ferro', 'Ouro', 'Prata', 'Cobre', 'Chumbo',
        'Madeira', 'Pedra', 'Tijolo', 'Cimento', 'Areia', 'Vidro',
        'Carne', 'Peixe', 'Fruta', 'Semente', 'Arroz', 'Feijao',
        'Leite', 'Queijo', 'Manteiga', 'Açucar', 'Farinha', 'Cebola',
        'Alho', 'Tomate', 'Batata', 'Milho', 'Cafe', 'Cha', 'Vinho',
        'Cerveja', 'Vodka', 'Gasolina', 'Diesel', 'Oleo', 'Bateria',
        'Motor', 'Radio', 'Lanterna', 'Isqueiro', 'Fosforo',
        'Mochila', 'Bolsa', 'Caixa', 'Balde', 'Corda', 'Prego',
        'Parafuso', 'Ferramenta', 'Martelo', 'Serra', 'Chave',
        'Bala', 'Arma', 'Fuzil', 'Pistola', 'Espada', 'Faca',
        'Mascara', 'Colete', 'Armadura', 'Escudo', 'Capacete',
        'Remedio', 'Veneno', 'Bomba', 'Sangue', 'Osso', 'Pele',
        'Couro', 'Tecido', 'Linha', 'Agulha', 'Tesoura', 'Panela',
        'Garrafa', 'Prato', 'Colher', 'Pneu', 'Roda', 'Cano', 'Tubo',
        'Tabaco', 'Cigarro', 'Charuto', 'Comida', 'Bebida',
        'Cranio', 'Dente', 'Chifre', 'Pena', 'Gordo', 'Magra',
        'Assado', 'Cozido', 'Frito', 'Defumado', 'Salgado', 'Seco',
        'Enlatado', 'Podre', 'Apodrecido', 'Comprimido', 'Xarope',
        'Injecao', 'Soro', 'Vacina', 'Antidoto', 'Antibiotico',
        'Gelo', 'Neve', 'Cinza', 'Poeira', 'Titanio',
        'Uniforme', 'Tatico', 'Militar', 'Quimico', 'Radioativo',
        'Toxico', 'Infectado', 'Mutante', 'Energia', 'Sobrevivente',
        'Base', 'Laboratorio', 'Oficina', 'Hospital', 'Barraca',
        'Tenda', 'Fogueira', 'Jardim', 'Fazenda', 'Estufa',
        'Abrigo', 'Gesso', 'Cola', 'Fita', 'Cera', 'Enxofre',
        'Salitre', 'Carvao', 'Dinamite', 'Polvora', 'Mina',
        'Relogio', 'Termometro', 'Bussola', 'Mapa', 'Livro', 'Papel',
        'Tinta', 'Pincel', 'Moeda', 'Dinheiro', 'Troca', 'Preco',
        'Concreto', 'Eletrodo', 'Fio', 'Cabo', 'Valvula',
        'Vaca', 'Porco', 'Galinha', 'Cachorro', 'Gato',
        'Roupa', 'Bota', 'Luva', 'Chapeu', 'Casaco', 'Calca',
        'Churrasco', 'Forno', 'Fogao', 'Lareira',
        'Ladrilho', 'Telha', 'Vigas', 'Pilar',
        'Aluguel', 'Compra', 'Venda', 'Negocio',
        'Guerra', 'Paz', 'Combate', 'Defesa', 'Ataque',
        'Porta', 'Janela', 'Parede', 'Chao', 'Teto',
        'Saco', 'Pacote', 'Embalagem', 'Rolo', 'Tubo',
        'Cortina', 'Tapete', 'Almofada', 'Cama', 'Mesa',
        'Cadeira', 'Estante', 'Armario', 'Prateleira',
        'Tesoura', 'Agulha', 'Linha', 'Botao', 'Ziper',
        'Gatilho', 'Canon', 'Silenciador', 'Mira', 'Luneta',
        'Cartucho', 'Projétil', 'Estilhaço', 'Fragmento',
        'Bolsa', 'Necessaire', 'Porta-moedas', 'Carteira',
        'Agasalho', 'Jaqueta', 'Camiseta', 'Calça', 'Cinto',
        'Cachecol', 'Luvas', 'Meias', 'Sapato', 'Chinelo',
        'Touca', 'Cofia', 'Bandeira', 'Poster', 'Quadro',
        'Brinco', 'Colar', 'Anel', 'Pulseira', 'Relogio',
        'Chave', 'Cadeado', 'Corrente', 'Cadeia',
        'Vela', 'Lampada', 'Gerador', 'Painel', 'Bateria',
        'Antena', 'Roteador', 'Computador', 'Telefone',
        'Câmera', 'Filmadora', 'Alto-falante', 'Microfone',
        'Livro', 'Jornal', 'Revista', 'Caderno', 'Papel',
        'Caneta', 'Lapis', 'Borracha', 'Apagador', 'Régua',
        'Metal', 'Plastico', 'Borracha', 'Vidro', 'Ceramica',
        'Marmor', 'Granito', 'Arenito', 'Calcario',
        'Ferrugem', 'Oxido', 'Zinco', 'Niquel', 'Cromo',
        'Estanho', 'Magnésio', 'Manganês', 'Cobalto',
        'Osmio', 'Paládio', 'Ródio', 'Iridio', 'Platina',
    ]
    
    for pt_word in pt_indicators:
        if pt_word.lower() in name.lower():
            return False
    
    # Names that are clearly PT-BR even without accents
    pt_br_names = [
        'Bala de', 'Pao de', 'Sopa de', 'Carne de', 'Peixe de',
        'Faca de', 'Espada de', 'Mascara de', 'Colete de',
        'Semente de', 'Oleo de', 'Coroa de', 'Anel de',
    ]
    for pattern in pt_br_names:
        if pattern.lower() in name.lower():
            return False
    
    return True

english_items = []
for item in all_items:
    if is_likely_english(item['name']):
        english_items.append(item)

print(f"\nItens possivelmente em ingles: {len(english_items)}")
for item in english_items:
    print(f"  [{item['cat_id']}] {item['name']} (id: {item['id']})")

# 2. Check for non-tradeable items
print("\n" + "=" * 60)
print("VERIFICACAO DE ITENS TRANSFERIVEIS")
print("=" * 60)
print("\nVerificando via API do wiki quais itens sao dropaveis/transferiveis...\n")
