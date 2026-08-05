/**
 * Remove acentos e caracteres especiais de uma string
 * Exemplo: "Água Limpa" → "agua limpa"
 */
export function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
