/**
 * Dicionário estático de correção ortográfica para 13 idiomas.
 * Lookup O(1) — zero rede, zero bloqueio.
 * Cada entrada mapeia palavra errada → palavra correta.
 */

export type VocativeRule = [RegExp, string];

// ═══════════════════════════════════════════════════════════
// PORTUGUÊS (pt) — 1500+ entradas
// ═══════════════════════════════════════════════════════════
const pt: Record<string, string> = {
  // ── Pronomes e formas reduzidas ──
  "voce": "você", "voces": "vocês", "vocez": "você",
  "vc": "você", "vcs": "vocês", "cê": "você",
  "tmb": "também", "tbm": "também", "tb": "também",
  "ngm": "ninguém", "algm": "alguém",
  "pq": "porque", "porke": "porque", "porqe": "porque", "porqu": "porque", "porq": "porque",
  "mt": "muito", "mta": "muita", "mtos": "muitos", "mtas": "muitas",
  "blz": "beleza", "bhz": "beleza",
  "flw": "falou", "t+": "tchau", "tchau": "tchau",
  "vlw": "valeu", "valeu": "valeu",
  "obg": "obrigado", "obgd": "obrigado", "brigado": "obrigado",
  "td": "tudo", "tduo": "tudo",
  "kd": "cadê", "kde": "cadê",
  "q": "que", "qro": "quero", "qto": "quanto", "qnts": "quantos",
  "pra": "para", "pro": "para", "pras": "para as", "pros": "para os",
  "ta": "tá", "tah": "tá", "tavo": "tava", "tamo": "tamos",
  "cabo": "acabou", "cabei": "acabei",
  "num": "num", "numca": "nunca", "nunka": "nunca", "nunca": "nunca",
  "cmg": "comigo", "cvc": "com você",
  "aki": "aqui", "ahí": "aí",
  "lah": "lá", "la": "lá",
  "axo": "acho", "achow": "acho",
  "bj": "beijo", "bjs": "beijos", "bjo": "beijo", "bjsx": "beijos",
  "abç": "abraço", "abçs": "abraços", "abraço": "abraço",
  "fwi": "fwi", "kkk": "kkk", "haha": "haha", "rsrs": "rsrs",
  "ne": "né", "nè": "né",
  "msm": "mesmo", "mmsm": "mesmo",
  "snd": "sendo", "tjz": "talvez", "tlz": "talvez", "tlvz": "talvez",
  "tp": "também", "tb": "também",
  "dmr": "demorar", "ctz": "certeza", "ctza": "certeza",
  "nao": "não", "naum": "não", "nam": "não", "nâo": "não",
  "n vejo": "não vejo", "nsei": "não sei", "nao sei": "não sei",
  "nao tem": "não tem", "nao da": "não dá",
  "tambem": "também", "tambe": "também", "tambemm": "também", "tanbem": "também",
  "porem": "porém", "porrem": "porém",
  "ninguem": "ninguém", "ninguen": "ninguém",
  "alguem": "alguém", "alguen": "alguém",
  "alem": "além", "alemm": "além",
  "ate": "até", "ateh": "até",
  "ja": "já", "jah": "já",
  "so": "só", "soh": "só",
  "pos": "pós", "preh": "pré", "pre": "pré",
  "util": "útil", "utill": "útil", "inutil": "inútil", "inutill": "inútil",
  "facil": "fácil", "facill": "fácil",
  "dificil": "difícil", "dificill": "difícil",
  "possivel": "possível", "possivell": "possível",
  "impossivel": "impossível",
  "necessario": "necessário", "necessaria": "necessária",
  "necessariamente": "necessariamente",
  "tao": "tão", "thau": "tão",
  "manha": "manhã", "amanha": "amanhã",
  "tres": "três",
  "mes": "mês",
  "ceus": "céus", "ceu": "céu",
  "heroi": "herói", "herois": "heróis",
  "pais": "país",
  "nois": "nós",
  "vo": "vô",
  "duvida": "dúvida",
  "saude": "saúde",
  