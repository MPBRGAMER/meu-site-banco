// Mapa de ícones dos itens - URLs de imagens do wiki dayr.wiki.gg
// O padrao da URL: https://dayr.wiki.gg/images/thumb/{WikiName}.png/32px-{WikiName}.png
// Caso a imagem nao carregue, exibe fallback

// Mapeamento de item ID -> nome da imagem no wiki (geralmente o nome em ingles com underscores)
// Para itens cujo nome do arquivo de imagem difere do ID
const wikiImageMap: Record<string, string> = {
  // Comida e Bebidas
  clean_water: "Clean_Water",
  dirty_water: "Dirty_water",
  salt: "Salt",
  sugar: "Sugar",
  flour: "Flour",
  pasta: "Pasta",
  eggs: "Eggs",
  milk: "Milk",
  condensed_milk: "Condensed_milk",
  rice_grains: "Rice_grains",
  buckwheat: "Buckwheat",
  lard: "Lard",
  honey: "Honey",
  canned_meat: "Canned_meat",
  canned_soup: "Canned_soup",
  sausage: "Sausage",
  jelly: "Jelly",
  chocolate: "Chocolate",
  cheese: "Cheese",
  rice_bowl: "Rice_bowl",
  smoked_bacon: "Smoked_bacon",
  dried_toast: "Dried_toast",
  salted_fish: "Salted_fish",
  salted_meat: "Salted_meat",
  russian_salad: "Russian_salad",
  snake_snack: "Snake_snack",
  olivier_salad: "Olivier_salad",
  pancakes: "Pancakes",
  pelmeni_dumplings: "Pelmeni",
  rice_bun: "Rice_bun",
  cutlet_rice: "Cutlet_rice",
  meat_loaf: "Meat_loaf",
  canned_beef: "Canned_beef",
  canned_porridge: "Canned_porridge",
  raw_meat: "Raw_meat",
  pepsi: "Pepsi",
  dried_meat: "Dried_meat",
  red_wine: "Red_wine",
  sushi: "Sushi",
  pizza: "Pizza",
  energy_drink: "Energy_Drink",
  hot_coffee: "Hot_coffee",
  cold_coffee: "Cold_coffee",
  hot_tea: "Hot_tea",
  cold_tea: "Cold_tea",
  champagne: "Champagne",
  cake: "Cake",
  egg: "Egg",
  fried_egg: "Fried_egg",
  fried_fish: "Fried_fish",
  shashlik: "Shashlik",
  boiled_egg: "Boiled_egg",
  pie: "Pie",
  fish_pie: "Fish_pie",
  mushroom_pasta: "Mushroom_pasta",
  mushroom_soup: "Mushroom_soup",
  blini: "Blini",
  cooked_pasta: "Cooked_pasta",
  cooked_rice: "Cooked_rice",
  pilaf: "Pilaf",
  chocolate_bunny: "Chocolate_bunny",
  easter_egg: "Easter_egg",
  candy_cane: "Candy_cane",
  ice_cream: "Ice_cream",
  canned_beans: "Canned_beans",
  canned_pork: "Canned_pork",
  canned_water: "Canned_water",
  stale_pryanik: "Stale_pryanik",
  tula_pryanik: "Tula_pryanik",
  cake_napoleon: "Cake_napoleon",
  easter_cake: "Easter_cake",
  caviar_sandwich: "Caviar_sandwich",
  coulibiac: "Coulibiac",
  fried_meat: "Fried_meat",
  fried_snake: "Fried_snake",
  grilled_meat: "Grilled_meat",
  meat_cutlet: "Meat_cutlet",
  meat_rissole: "Meat_rissole",
  minced_meat: "Minced_meat",
  shawarma: "Shawarma",
  stew_meat: "Stew_meat",
  stuffed_cabbage: "Stuffed_cabbage",
  tailed_rissole: "Tailed_rissole",
  salmon: "Salmon",
  // Ervas e Sementes
  wheat: "Wheat",
  corn: "Corn",
  potatoes: "Potatoes",
  potato: "Potato",
  pumpkin: "Pumpkin",
  apple: "Apple",
  strawberry: "Strawberry",
  cranberry: "Cranberry",
  tangerine: "Tangerine",
  vegetables: "Vegetables",
  chanterelle: "Chanterelle",
  radioactive_mushroom: "Radioactive_mushroom",
  fly_agaric: "Fly_agaric",
  moss: "Moss",
  dandelion: "Dandelion",
  deer_ear: "Deer_ear",
  nettle: "Nettle",
  belladonna: "Belladonna",
  serrated_grass: "Serrated_grass",
  bloody_mold: "Bloody_mold",
  buckwheat_grains: "Buckwheat_grains",
  wheat_seeds: "Wheat_seeds",
  corn_seeds: "Corn_seeds",
  potato_seeds: "Potato_seeds",
  pumpkin_seeds: "Pumpkin_seeds",
  apple_seeds: "Apple_seeds",
  tangerine_seeds: "Tangerine_seeds",
  strawberry_seed: "Strawberry_seed",
  mysterious_fruit: "Mysterious_fruit",
  mysterious_fruit_seeds: "Mysterious_fruit_Seeds",
  potato_pancakes: "Potato_pancakes",
  mashed_potatoes: "Mashed_potatoes",
  fried_potato: "Fried_potato",
  boiled_corn: "Boiled_corn",
  cooked_buckwheat: "Cooked_buckwheat",
  bamboo_steamer: "Bamboo_steamer",
  candy_apple: "Candy_apple",
  strawberry_cake: "Strawberry_cake",
  pumpkin_soup: "Pumpkin_soup",
  // Componentes
  steel: "Steel",
  cement: "Cement",
  iron: "Iron",
  lead: "Lead",
  copper: "Copper",
  aluminum: "Aluminum",
  iron_scrap: "Iron_scrap",
  copper_scrap: "Copper_scrap",
  aluminum_scrap: "Aluminum_scrap",
  saltpeter: "Saltpeter",
  sulfur: "Sulfur",
  charcoal: "Charcoal",
  coal: "Coal",
  hellish_coal: "Hellish_coal",
  firewood: "Firewood",
  stick: "Stick",
  log: "Log",
  board: "Board",
  brick: "Brick",
  refractory_brick: "Refractory_brick",
  flint: "Flint",
  electrical_tape: "Electrical_tape",
  nails: "Nails",
  screws: "Screws",
  spring: "Spring",
  electrical_wire: "Electrical_wire",
  metal_plate: "Metal_plate",
  soap: "Soap",
  soap_powder: "Soap_powder",
  sandpaper: "Sandpaper",
  bone_glue: "Bone_glue",
  fabric: "Fabric",
  rags: "Rags",
  thread: "Thread",
  rope: "Rope",
  cooked_leather: "Cooked_leather",
  tanned_leather: "Tanned_leather",
  thick_leather: "Thick_leather",
  quality_leather: "Quality_leather",
  can: "Can",
  spark_plug: "Spark_plug",
  tires: "Tires",
  machine_parts: "Machine_parts",
  electrical_parts: "Electrical_parts",
  gun_parts: "Gun_parts",
  gas_mask_filter: "Gas_mask_filter",
  autoparts: "Autoparts",
  chainsaw_motor: "Chainsaw_motor",
  car_battery: "Car_battery",
  broken_car_battery: "Broken_car_battery",
  broken_gas_engine: "Broken_gas_engine",
  broken_diesel_engine: "Broken_diesel_engine",
  machine_oil: "Machine_oil",
  diesel: "Diesel",
  gasoline: "Gasoline",
  titanium_alloy: "Titanium_alloy",
  titanium_ore: "Titanium_ore",
  rubber: "Rubber",
  plank: "Plank",
  iron_pipe: "Iron_pipe",
  nail: "Nail",
  wire: "Wire",
  electrodes: "Electrodes",
  // Medicamentos
  sterile_bandage: "Sterile_bandage",
  healing_ointment: "Healing_ointment",
  briocarmo: "Briocarmo",
  metocaine: "Metocaine",
  lidiacida34: "Lidiacida-34",
  antibiotics: "Antibiotics",
  painkillers: "Painkillers",
  chlorcistamine: "Chlorcistamine",
  ir190: "IR-190",
  antirad: "Antirad",
  activated_charcoal: "Activated_charcoal",
  alcohol: "Alcohol",
  sulfuric_acid: "Sulfuric_acid",
  energy_potion: "Energy_potion",
  detox_potion: "Detox_potion",
  coffee: "Coffee",
  tea: "Tea",
  beetle_juice: "Beetle_juice",
  cigarettes: "Cigarettes",
  russian_cigarettes: "Russian_cigarettes",
  cuban_cigar: "Cuban_cigar",
  vodka: "Vodka",
  whiskey: "Whiskey",
  homemade_wine: "Homemade_wine",
  moonshine: "Moonshine",
  apple_liqueur: "Apple_liqueur",
  diluted_liqueur: "Diluted_liqueur",
  kvass: "Kvass",
  kompot: "Kompot",
  soda: "Soda",
  poison: "Poison",
  antidote: "Antidote",
  biotonic: "Biotonic",
  stimulant: "Stimulant",
  first_aid_kit: "First_Aid_Kit",
  painkiller: "Painkiller",
  // Municoes
  pistol_ammo: "Pistol_ammo",
  shotgun_ammo: "Shotgun_ammo",
  assault_rifle_ammo: "Assault_rifle_ammo",
  rifle_ammo: "Rifle_ammo",
  empty_pistol_cartridge: "Empty_pistol_cartridge",
  empty_shotgun_cartridge: "Empty_shotgun_cartridge",
  empty_assault_cartridge: "Empty_assault_cartridge",
  empty_rifle_cartridge: "Empty_rifle_cartridge",
  blank_cartridge: "Blank_cartridge",
  handmade_cartridge: "Handmade_cartridge",
  crossbow_bolt: "Crossbow_bolt",
  training_ammo: "Training_ammo",
  gunpowder: "Gunpowder",
  primer: "Primer",
  plastic_explosive: "Plastic_explosive",
  molotov: "Molotov",
  powder_grenade: "Powder_grenade",
  stun_grenade: "Stun_grenade",
  // Produtos Animais
  contaminated_meat: "Contaminated_meat",
  tough_meat: "Tough_meat",
  fatty_meat: "Fatty_meat",
  snake_meat: "Snake_meat",
  ground_meat: "Ground_meat",
  mutant_meat: "Mutant_meat",
  raw_bacon: "Raw_bacon",
  raw_fish: "Raw_fish",
  caviar: "Caviar",
  lymph: "Lymph",
  acid_glands: "Acid_glands",
  raw_skin: "Raw_skin",
  thick_skin: "Thick_skin",
  quality_skin: "Quality_skin",
  chitin: "Chitin",
  bones: "Bones",
  fresh_bones: "Fresh_bones",
  wax: "Wax",
};

const WIKI_IMG_BASE = "https://dayr.wiki.gg/images/thumb/";
const WIKI_IMG_SUFFIX = "/32px-";
const WIKI_IMG_EXT = ".png";

/**
 * Gera a URL da imagem do wiki para um item.
 * Retorna null se nao houver mapeamento.
 */
export function getItemImageUrl(itemId: string): string | null {
  const wikiName = wikiImageMap[itemId];
  if (!wikiName) return null;
  return `${WIKI_IMG_BASE}${wikiName}${WIKI_IMG_SUFFIX}${wikiName}${WIKI_IMG_EXT}`;
}

/**
 * Converte item ID em nome de wiki automaticamente (fallback).
 * Ex: "clean_water" -> "Clean_water", "AKM-C" -> "AKM-C"
 */
function idToWikiName(itemId: string): string {
  // Tratar casos especiais com numeros e caracteres
  return itemId
    .split(/[_ ]+/)
    .map((part) => {
      // Manter siglas como AKM, SMG, LMG, etc
      if (/^[A-Z]+$/.test(part)) return part;
      // Manter numeros junto com letras (7.62x25mm, 14k, etc)
      if (/^[0-9]/.test(part)) return part;
      // Capitalizar primeira letra
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("_");
}

/**
 * Retorna a URL da imagem para um item.
 * Se tiver mapeamento manual, usa. Caso contrario, gera automaticamente.
 */
export function getItemImageUrlAuto(itemId: string): string {
  const mapped = wikiImageMap[itemId];
  const wikiName = mapped || idToWikiName(itemId);
  return `${WIKI_IMG_BASE}${wikiName}${WIKI_IMG_SUFFIX}${wikiName}${WIKI_IMG_EXT}`;
}

// Fallback emoji para quando a imagem nao carrega
const fallbackEmoji: Record<string, string> = {
  clean_water: "💧", salt: "🧂", sugar: "🍬", flour: "🌾",
  pasta: "🍝", eggs: "🥚", milk: "🥛", honey: "🍯",
  cheese: "🧀", chocolate: "🍫", sausage: "🌭", bread: "🍞",
  apple: "🍎", strawberry: "🍓", mushrooms: "🍄",
  steel: "⚙️", cement: "🏗️", iron: "🔩", copper: "🔌",
  bullets: "🔫", medicine: "💊", armor: "🛡️",
};

export function getFallbackEmoji(itemId: string): string {
  // Tentar achar por categoria
  const id = itemId.toLowerCase();
  if (id.includes("water") || id.includes("tea") || id.includes("coffee")) return "💧";
  if (id.includes("meat") || id.includes("fish") || id.includes("bacon")) return "🍖";
  if (id.includes("egg")) return "🥚";
  if (id.includes("bread") || id.includes("toast") || id.includes("bun") || id.includes("pie") || id.includes("cake")) return "🍞";
  if (id.includes("mushroom") || id.includes("amanita")) return "🍄";
  if (id.includes("seed")) return "🌱";
  if (id.includes("berry") || id.includes("fruit") || id.includes("apple")) return "🍎";
  if (id.includes("steel") || id.includes("iron") || id.includes("metal") || id.includes("scrap")) return "⚙️";
  if (id.includes("cement") || id.includes("brick")) return "🧱";
  if (id.includes("ammo") || id.includes("cartridge") || id.includes("bullet") || id.includes("shell")) return "🔫";
  if (id.includes("grenade") || id.includes("explosive") || id.includes("molotov")) return "💣";
  if (id.includes("bandage") || id.includes("medicine") || id.includes("potion") || id.includes("antidote")) return "💊";
  if (id.includes("gas_mask") || id.includes("respirator") || id.includes("mask")) return "😷";
  if (id.includes("armor") || id.includes("vest") || id.includes("suit")) return "🛡️";
  if (id.includes("backpack") || id.includes("knapsack") || id.includes("sack") || id.includes("bag")) return "🎒";
  if (id.includes("knife") || id.includes("machete") || id.includes("axe") || id.includes("sword")) return "🔪";
  if (id.includes("rifle") || id.includes("shotgun") || id.includes("gun") || id.includes("revolver") || id.includes("pistol")) return "🔫";
  if (id.includes("crossbow") || id.includes("bow") || id.includes("spear")) return "🏹";
  if (id.includes("leather") || id.includes("skin")) return "🟤";
  if (id.includes("chitin")) return "🦗";
  if (id.includes("bone")) return "🦴";
  if (id.includes("bottle") || id.includes("vodka") || id.includes("wine") || id.includes("whiskey")) return "🍾";
  if (id.includes("cigarette") || id.includes("cigar")) return "🚬";
  if (id.includes("lantern") || id.includes("flashlight") || id.includes("torch")) return "🔦";
  if (id.includes("shovel")) return "⛏️";
  if (id.includes("crowbar")) return "🔧";
  if (id.includes("needle") || id.includes("thread") || id.includes("fabric")) return "🧵";
  if (id.includes("wire") || id.includes("cable") || id.includes("tape")) return "🔌";
  if (id.includes("pot") || id.includes("saucepan") || id.includes("stove")) return "🍳";
  if (id.includes("oil") || id.includes("gasoline") || id.includes("diesel")) return "🛢️";
  if (id.includes("coal") || id.includes("charcoal") || id.includes("firewood")) return "⬛";
  if (id.includes("sulfur") || id.includes("acid") || id.includes("saltpeter")) return "⚗️";
  return "📦";
}
