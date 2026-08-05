// item-icons.ts - Sistema de icones dos itens
// As imagens sao baixadas do wiki (dayr.wiki.gg) e salvas em /public/items/
// Cada item no prices.json tem o campo "img" com o caminho da imagem

/**
 * Retorna o caminho da imagem local de um item.
 * Se o item tiver campo img, usa. Caso contrario, retorna null.
 */
export function getItemImagePath(itemId: string, imgPath?: string): string | null {
  if (imgPath) return imgPath;
  return null;
}

/**
 * Fallback emoji quando nao ha imagem
 */
export function getFallbackEmoji(itemId: string): string {
  const id = itemId.toLowerCase();
  if (id.includes("water") || id.includes("tea") || id.includes("coffee")) return "💧";
  if (id.includes("meat") || id.includes("fish") || id.includes("bacon") || id.includes("sausage")) return "🍖";
  if (id.includes("egg")) return "🥚";
  if (id.includes("bread") || id.includes("toast") || id.includes("bun") || id.includes("pie") || id.includes("cake") || id.includes("pasta") || id.includes("biscuit")) return "🍞";
  if (id.includes("mushroom") || id.includes("amanita")) return "🍄";
  if (id.includes("seed")) return "🌱";
  if (id.includes("berry") || id.includes("fruit") || id.includes("apple") || id.includes("strawberry")) return "🍎";
  if (id.includes("steel")) return "⚙️";
  if (id.includes("cement")) return "🏗️";
  if (id.includes("iron") || id.includes("scrap") || id.includes("metal")) return "🔩";
  if (id.includes("copper")) return "🔌";
  if (id.includes("ammo") || id.includes("cartridge") || id.includes("bullet") || id.includes("shell")) return "🔫";
  if (id.includes("grenade") || id.includes("explosive") || id.includes("molotov") || id.includes("bomb")) return "💣";
  if (id.includes("bandage") || id.includes("medicine") || id.includes("potion") || id.includes("antidote") || id.includes("antibiotic") || id.includes("painkiller")) return "💊";
  if (id.includes("gas_mask") || id.includes("respirator") || id.includes("mask")) return "😷";
  if (id.includes("armor") || id.includes("vest") || id.includes("suit")) return "🛡️";
  if (id.includes("backpack") || id.includes("knapsack") || id.includes("sack") || id.includes("bag")) return "🎒";
  if (id.includes("rifle") || id.includes("shotgun") || id.includes("gun") || id.includes("revolver") || id.includes("pistol")) return "🔫";
  if (id.includes("crossbow") || id.includes("bow") || id.includes("spear")) return "🏹";
  if (id.includes("leather") || id.includes("skin")) return "🟤";
  if (id.includes("chitin")) return "🦗";
  if (id.includes("bone")) return "🦴";
  if (id.includes("bottle") || id.includes("vodka") || id.includes("wine") || id.includes("whiskey") || id.includes("beer")) return "🍾";
  if (id.includes("cigarette") || id.includes("cigar")) return "🚬";
  if (id.includes("lantern") || id.includes("flashlight") || id.includes("torch")) return "🔦";
  if (id.includes("shovel")) return "⛏️";
  if (id.includes("crowbar") || id.includes("axe") || id.includes("machete") || id.includes("knife") || id.includes("sword")) return "🔪";
  if (id.includes("needle") || id.includes("thread") || id.includes("fabric") || id.includes("cloth")) return "🧵";
  if (id.includes("wire") || id.includes("cable") || id.includes("tape")) return "🔌";
  if (id.includes("pot") || id.includes("pan") || id.includes("stove")) return "🍳";
  if (id.includes("oil") || id.includes("gasoline") || id.includes("diesel")) return "🛢️";
  if (id.includes("coal") || id.includes("charcoal") || id.includes("firewood")) return "⬛";
  if (id.includes("sulfur") || id.includes("acid")) return "⚗️";
  if (id.includes("brick") || id.includes("board") || id.includes("plank")) return "🧱";
  return "📦";
}
