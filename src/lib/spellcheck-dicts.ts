/**
 * Dicionário estático de correção ortográfica para 13 idiomas.
 * Lookup O(1) — zero rede, zero bloqueio.
 */

export type VocativeRule = [RegExp, string];

