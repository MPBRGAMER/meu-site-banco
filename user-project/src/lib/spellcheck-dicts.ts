/**
 * Dicionário estático de correção ortográfica para 13 idiomas.
 * Lookup O(1) — zero rede, zero bloqueio.
 * Cada entrada mapeia palavra errada → palavra correta.
 */

// ═══════════════════════════════════════════════════════════
// PORTUGUÊS (pt)
// ═══════════════════════════════════════════════════════════
const pt: Record<string, string> = {
  // ── Acentuação ──
  "voce": "você", "vocez": "você", "voces": "vocês",
  "tambem": "também", "tambe": "também", "tambemm": "também",
  "nao": "não", "naum": "não", "nam": "não",
  "porem": "porém",
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
  "necessario": "necessário",
  "porke": "porque", "porqe": "porque",
  "tao": "tão", "thau": "tão",
  "lah": "lá",
  "amanha": "amanhã",
  "manha": "manhã",
  "tres": "três",
  "mes": "mês",
  "ceus": "céus",
  // ── Palavras terminadas em -ção/-ção ──
  "acao": "ação", "acoes": "ações",
  "administracao": "administração",
  "aplicacao": "aplicação",
  "avaliacao": "avaliação",
  "comunicacao": "comunicação",
  "composicao": "composição",
  "condicao": "condição",
  "confirmacao": "confirmação",
  "conclusao": "conclusão",
  "conexcao": "conexão",
  "construcao": "construção",
  "correcao": "correção",
  "decisao": "decisão", "decisoes": "decisões",
  "destruicao": "destruição",
  "direcao": "direção",
  "divisao": "divisão",
  "educacao": "educação",
  "eleicao": "eleição",
  "emocao": "emoção", "emocoes": "emoções",
  "excecao": "exceção", "excecoes": "exceções",
  "expansao": "expansão",
  "experiencia": "experiência",
  "explosao": "explosão",
  "expressao": "expressão",
  "funcao": "função", "funcoes": "funções",
  "ilusao": "ilusão",
  "informacao": "informação", "informacoes": "informações",
  "intecao": "intenção", "intencao": "intenção",
  "invasao": "invasão",
  "missao": "missão",
  "nacao": "nação",
  "operacao": "operação",
  "opiniao": "opinião", "opinioes": "opiniões",
  "organizacao": "organização",
  "poluicao": "poluição",
  "populacao": "população",
  "posicao": "posição",
  "preparacao": "preparação",
  "prevencao": "prevenção",
  "producao": "produção",
  "profissao": "profissão",
  "programacao": "programação",
  "promocao": "promoção",
  "protecao": "proteção",
  "reclamacao": "reclamação",
  "recomendacao": "recomendação",
  "reducao": "redução",
  "reflexao": "reflexão",
  "relacao": "relação",
  "reuniao": "reunião", "reunioes": "reuniões",
  "satisfacao": "satisfação",
  "sensacao": "sensação", "sensacoes": "sensações",
  "selecao": "seleção",
  "sessao": "sessão",
  "situacao": "situação", "situacoes": "situações",
  "solucao": "solução", "solucoes": "soluções",
  "tensao": "tensão",
  "tradicao": "tradição",
  "versao": "versão",
  "visao": "visão",
  // ── Palavras terminadas em -ção (continuação) ──
  "adicao": "adição",
  "admissao": "admissão",
  "atencao": "atenção",
  "colecao": "coleção",
  "comissao": "comissão",
  "consciencia": "consciência",
  "contaminacao": "contaminação",
  "declaracao": "declaração",
  "dimensao": "dimensão",
  "dispensao": "dispensão",
  "essencia": "essência",
  "exposicao": "exposição",
  "ficcao": "ficção",

  "independencia": "independência",
  "inocencia": "inocência",
  "instalacao": "instalação",
  "investigacao": "investigação",
  "lembranca": "lembrança",
  "licao": "lição",
  "municao": "munição",
  "obrigacao": "obrigação",
  "ocasiao": "ocasião",
  "perfeicao": "perfeição",
  "permissao": "permissão",
  "perseguicao": "perseguição",
  "pretensao": "pretensão",
  "procuracao": "procuração",
  "progressao": "progressão",
  "provisao": "provisão",
  "reivindicacao": "reivindicação",
  "sobrevivencia": "sobrevivência",
  "transmissao": "transmissão",

  "vitoria": "vitória", "vitorias": "vitórias",
  // ── Palavras com -ência/-ência ──
  "presenca": "presença",
  "ausencia": "ausência",
  "violencia": "violência",
  "silencio": "silêncio",
  "existencia": "existência",
  "residencia": "residência",
  "competencia": "competência",
  "procedencia": "procedência",
  // ── Palavras com -ído ──
  "beneficio": "benefício", "beneficios": "benefícios",
  "exercicio": "exercício", "exercicios": "exercícios",
  "prejuizo": "prejuízo", "prejuisos": "prejuízos",
  "sacrificio": "sacrifício",
  "suplicio": "suplício",
  "particio": "partício",
  // ── Erros comuns de digitação ──
  "cisa": "coisa", "cizas": "coisas",
  "txei": "tive",
  "porfavor": "por favor",
  "porisso": "por isso",
  // ── Abreviações comuns ──
  "tbm": "também", "tmb": "também",
  "vc": "você", "vcs": "vocês",
  "pq": "porque", "q": "que", "qq": "qualquer",
  "kd": "cadê",
  "blz": "beleza", "mto": "muito", "mt": "muito",
  "nt": "não",
  "sdd": "saudades", "sdds": "saudades",
  "td": "tudo", "tds": "todos",
  "flw": "falou", "vlw": "valeu",
  "obg": "obrigado", "obgd": "obrigado",
  // ── Corpo / saúde ──
  "cabeca": "cabeça",
  "braco": "braço",
  "mao": "mão",
  "pe": "pé",
  "coracao": "coração", "coracoes": "corações",
  "pulmao": "pulmão",
  "figado": "fígado",
  "estomago": "estômago",
  "infecao": "infecção",
  "virus": "vírus",
  "bacteria": "bactéria",
  "doenca": "doença",
  "antidoto": "antídoto",
  "antibiotico": "antibiótico",
  "anestesico": "anestésico",
  "analgesico": "analgésico",
  "remedio": "remédio", "remedios": "remédios",
  "saude": "saúde",
  // ── Comida / bebida ──
  "feijao": "feijão",
  "pao": "pão", "paes": "pães",
  "macarrao": "macarrão",
  "acucar": "açúcar",
  "oleo": "óleo",
  "cafe": "café",
  "cha": "chá",
  "agua": "água",
  "limao": "limão",
  "maca": "maçã",
  // ── Transporte / lugares ──
  "aviao": "avião", "avioes": "aviões",
  "onibus": "ônibus",
  "gas": "gás",
  "lampada": "lâmpada",
  "radio": "rádio",
  "refugio": "refúgio",
  "caminhao": "caminhão",
  "helicoptero": "helicóptero",
  "combustivel": "combustível",
  "aluminio": "alumínio",
  "edificio": "edifício",
  "predio": "prédio",
  "tunel": "túnel",
  "imovel": "imóvel",
  // ── Família ──
  "mae": "mãe",
  "irmao": "irmão", "irmaos": "irmãos",
  "irma": "irmã", "irmas": "irmãs",
  "avo": "avô", "avos": "avós",
  // ── Verbos ──
  "esta": "está",
  "estao": "estão",
  "vao": "vão",
  "sera": "será", "serao": "serão",
  "tera": "terá", "terao": "terão",
  "fara": "fará", "farao": "farão",

  // ── Outros ──
  "parabens": "parabéns",
  "gratidao": "gratidão",
  "compaixao": "compaixão",
  "paixao": "paixão",
  "heroi": "herói", "herois": "heróis",
  "historia": "história", "historias": "histórias",
  "chapeu": "chapéu",
  "calcado": "calçado",
  "forca": "força",
  "graca": "graça",
  "justica": "justiça",
  "ciencia": "ciência",
  "paciencia": "paciência",
  "urgencia": "urgência",
  "frequencia": "frequência",
  "sequencia": "sequência",
  "excelencia": "excelência",
  "transparencia": "transparência",
  "providencia": "providência",
  "inteligencia": "inteligência",

  "genero": "gênero",
  "numero": "número",



  "fabrica": "fábrica",
  "farmacia": "farmácia",
  "praca": "praça",
  "servico": "serviço",

  "pais": "país", "paises": "países",


  "secrecao": "secreção",
  "recepcao": "recepção",
  "adocao": "adoção",
  "injecao": "injeção",
  "circulacao": "circulação",
  "elaboracao": "elaboração",
  "modificacao": "modificação",
  "classificacao": "classificação",
  "sinalizacao": "sinalização",
  "autorizacao": "autorização",
  "realizacao": "realização",
  "utilizacao": "utilização",
  "finalizacao": "finalização",
  "localizacao": "localização",
  "migracao": "migração",
  "navegacao": "navegação",
  "transacao": "transação",
  "interacao": "interação",
  "fiscalizacao": "fiscalização",
  "notificacao": "notificação",
  "homologacao": "homologação",
  "certificacao": "certificação",
  "verificacao": "verificação",




  "linguica": "lingüiça",





  "requeijao": "requeijão",








  "hamburguer": "hambúrguer",
  "hotdog": "hot dog",





  "acaraje": "acarajé",

  "acorda": "açorda",




  "vatapa": "vatapá",




};

// ═══════════════════════════════════════════════════════════
// ENGLISH (en)
// ═══════════════════════════════════════════════════════════
const en: Record<string, string> = {
  // ── Common typos ──
  "teh": "the", "hte": "the", "tha": "the",
  "adn": "and", "amd": "and", "abd": "and", "nad": "and",
  "taht": "that", "thta": "that", "htat": "that", "thar": "that",
  "fro": "for", "ofr": "for",
  "ot": "to",
  "wiht": "with", "wit": "with", "wih": "with",
  "oyu": "you", "yuo": "you", "yu": "you", "ouy": "you",
  "si": "is",
  "ti": "it", "ut": "it",
  "ni": "in", "im": "in",
  "thsi": "this", "tihs": "this",
  "hvae": "have", "ahve": "have", "hsve": "have",
  "hda": "had", "wsa": "was",
  "weer": "were", "wree": "were",
  "beign": "being", "beeen": "been",
  "rare": "are", "aer": "are",
  "od": "do", "dose": "does", "ddi": "did",
  "wil": "will", "wll": "will",
  "woudl": "would", "wuld": "would",
  "coudl": "could", "culd": "could", "colud": "could",
  "shoudl": "should", "shuld": "should",
  "cna": "can", "acn": "can",
  "migth": "might", "mihgt": "might",
  "msut": "must", "muts": "must",
  "shlal": "shall",
  "nto": "not",
  "btu": "but", "ubt": "but",
  "ro": "or",
  "fi": "if",
  "hten": "then", "thne": "then", "tehn": "then",
  "htan": "than", "thna": "than", "tahn": "than",
  "os": "so",
  "sa": "as", "ta": "at", "yb": "by",
  "form": "from", "frm": "from", "rfom": "from",
  "donw": "down", "dwon": "down",
  "otu": "out",
  "fof": "off",
  "ovre": "over", "ove": "over",
  "unedr": "under", "undre": "under", "udner": "under",
  "agian": "again", "agani": "again",
  "futher": "further", "futrher": "further",
  "noce": "once", "ocne": "once",
  "hre": "here",
  "thre": "there", "ther": "there",
  "whne": "when", "wen": "when", "wehn": "when",
  "whre": "where", "whree": "where",
  "wyh": "why", "hyw": "why",
  "ohw": "how",
  "lal": "all",
  "eac": "each", "ech": "each",
  "evry": "every", "evrey": "every", "eveyr": "every",
  "boht": "both", "btoh": "both",
  "mroe": "more", "moer": "more",
  "mos": "most", "omst": "most",
  "othre": "other", "ohter": "other", "othr": "other",
  "soem": "some", "smoe": "some", "osme": "some",
  "suhc": "such", "scuh": "such",
  "ayn": "any", "nya": "any",
  "onyl": "only", "oly": "only",
  "smae": "same", "saem": "same",
  "aslo": "also", "alos": "also",
  "jsut": "just", "juts": "just",
  "veyr": "very", "vrey": "very",
  "oten": "often", "oftne": "often",
  "wlle": "well", "wlel": "well",
  "bakc": "back",
  "evne": "even",
  "stlil": "still", "stli": "still",
  "alreday": "already", "alrady": "already",
  "awlays": "always", "alawys": "always", "alwyas": "always",
  "nevre": "never", "nver": "never", "neevr": "never",
  "abuot": "about", "abot": "about", "abotu": "about",
  "aftre": "after", "afetr": "after",
  "befor": "before", "befroe": "before", "befoer": "before",
  "bewteen": "between", "betwen": "between",
  "throuhg": "through", "thorugh": "through",
  "durign": "during", "duirng": "during",
  "whiel": "while", "whle": "while",
  "untl": "until", "untli": "until",
  "sice": "since", "sinse": "since",
  "becuase": "because", "beacuse": "because", "becaus": "because",
  "hoever": "however", "howver": "however",
  "althogh": "although", "althouh": "although",
  "thogh": "though", "thouh": "though",
  "eithe": "either", "eithr": "either", "eihter": "either",
  "niether": "neither", "nehtier": "neither",
  "wheter": "whether", "whehter": "whether",
  "thsee": "these", "thees": "these",
  "thsoe": "those", "thoes": "those",
  "whcih": "which", "whihc": "which", "hwich": "which",
  "waht": "what", "whta": "what", "hwat": "what",
  "hwo": "who", "woh": "who",
  "whmo": "whom",
  "whoes": "whose",
  "amny": "many", "mnay": "many",
  "mcuh": "much", "muhc": "much",
  // ── Contractions ──
  "thier": "their", "tehir": "their",
  "theyre": "they're",
  "yuor": "your", "yoru": "your",
  "youre": "you're",
  "dont": "don't", "doesnt": "doesn't", "didnt": "didn't",
  "wont": "won't", "cant": "can't",
  "shouldnt": "shouldn't", "wouldnt": "wouldn't", "couldnt": "couldn't",
  "isnt": "isn't", "arent": "aren't",
  "wasnt": "wasn't", "werent": "weren't",
  "hasnt": "hasn't", "havent": "haven't", "hadnt": "hadn't",
  "ive": "I've",
  "youve": "you've", "theyve": "they've", "weve": "we've",
  "ill": "I'll", "youd": "you'd", "hed": "he'd",
  "shed": "she'd", "wed": "we'd", "theyd": "they'd",
  "lets": "let's", "thats": "that's",
  "whos": "who's", "whats": "what's",
  "hes": "he's", "shes": "she's",
  // ── Common misspellings ──
  "realy": "really", "realyy": "really",
  "beleive": "believe", "belive": "believe",
  "recieve": "receive", "receve": "receive", "recevie": "receive",
  "acheive": "achieve", "achive": "achieve",
  "occured": "occurred", "ocurred": "occurred",
  "happend": "happened",
  "begining": "beginning",
  "definately": "definitely", "definatly": "definitely", "definitley": "definitely",
  "seperate": "separate", "seperat": "separate",
  "occassion": "occasion",
  "accomodate": "accommodate", "acommodate": "accommodate",
  "accomodation": "accommodation", "acomodation": "accommodation",
  "occurrance": "occurrence",
  "adress": "address", "addres": "address",
  "accidentaly": "accidentally", "accidently": "accidentally",
  "arguement": "argument",
  "basicly": "basically",
  "beautifull": "beautiful", "beautful": "beautiful",
  "benifit": "benefit",
  "buisness": "business", "busness": "business",
  "calender": "calendar",
  "catagory": "category",
  "cemetary": "cemetery",
  "comming": "coming",
  "commitee": "committee",
  "completly": "completely",
  "concious": "conscious",
  "curiousity": "curiosity",
  "definetly": "definitely",
  "developement": "development",
  "dilemna": "dilemma",
  "dissapoint": "disappoint",
  "dissappear": "disappear",
  "embarras": "embarrass", "embarass": "embarrass",
  "enviroment": "environment",
  "equiptment": "equipment",
  "existance": "existence",
  "experiance": "experience", "expirience": "experience",
  "explaination": "explanation",
  "facinate": "fascinate",
  "Febuary": "February",
  "foriegn": "foreign",
  "fourty": "forty",
  "freind": "friend",
  "gaurd": "guard",
  "goverment": "government",
  "gratefull": "grateful", "greatful": "grateful",
  "garantee": "guarantee",
  "hierachy": "hierarchy",
  "immediatly": "immediately",
  "importent": "important",
  "independant": "independent",
  "inteligence": "intelligence",
  "intrest": "interest",
  "irresistable": "irresistible",
  "jewlery": "jewelry",
  "knowlege": "knowledge",
  "labratory": "laboratory",
  "langauge": "language",
  "layed": "laid",
  "lesure": "leisure",
  "libary": "library",
  "licsence": "license",
  "lightening": "lightning",
  "maintainance": "maintenance",
  "manuever": "maneuver",
  "medival": "medieval",
  "millenium": "millennium",
  "minature": "miniature",
  "mischievious": "mischievous",
  "mispell": "misspell", "misspel": "misspell",
  "naturaly": "naturally",
  "neccessary": "necessary", "necesary": "necessary",
  "neice": "niece",
  "noticable": "noticeable",
  "occurence": "occurrence",
  "offically": "officially",
  "oportunity": "opportunity", "oppurtunity": "opportunity",
  "optimisim": "optimism",
  "outragous": "outrageous",
  "paralel": "parallel",
  "pasttime": "pastime",
  "persistant": "persistent",
  "pharoah": "pharaoh",
  "playwrite": "playwright",
  "posession": "possession",
  "potatos": "potatoes",
  "practicle": "practical",
  "preceed": "precede",
  "priviledge": "privilege", "privelage": "privilege",
  "probly": "probably", "probabbly": "probably",
  "procede": "proceed",
  "pronounciation": "pronunciation",
  "publically": "publicly",
  "questionaire": "questionnaire",
  "reccomend": "recommend",
  "refered": "referred", "reffered": "referred",
  "referance": "reference",
  "religous": "religious",
  "rember": "remember",
  "repetion": "repetition",
  "restaraunt": "restaurant", "resturant": "restaurant",
  "rythm": "rhythm",
  "sacrafice": "sacrifice",
  "sandwhich": "sandwich",
  "sargent": "sergeant",
  "scisors": "scissors",
  "secretery": "secretary",
  "sieze": "seize",
  "sentance": "sentence",
  "sholder": "shoulder",
  "speach": "speech",
  "succesful": "successful", "successfull": "successful",
  "supercede": "supersede",
  "suprise": "surprise", "surprize": "surprise",
  "suspence": "suspense",
  "symathy": "sympathy",
  "tommorow": "tomorrow", "tomorow": "tomorrow",
  "tonite": "tonight",
  "truley": "truly", "truely": "truly",
  "unfortunatly": "unfortunately",
  "unnecesary": "unnecessary",
  "unusal": "unusual",
  "usally": "usually", "usualy": "usually",
  "vaccum": "vacuum",
  "vegatable": "vegetable", "vegitable": "vegetable",
  "visious": "vicious",
  "wierd": "weird", "wiered": "weird",
  "writting": "writing",
  "yatch": "yacht",
  // ── Grammar fixes ──
  "irregardless": "regardless",
  "supposably": "supposedly",
  "expresso": "espresso",
  "noone": "no one",
  "everytime": "every time",
  "alright": "all right",
  "alot": "a lot",
  "infact": "in fact",
  "aswell": "as well",
  // ── More vocabulary ──
  "absolutly": "absolutely",
  "acknowlege": "acknowledge",
  "aquire": "acquire",
  "assasinate": "assassinate",
  "apropriate": "appropriate",
  "awfull": "awful",
  "baloon": "balloon",
  "barbeque": "barbecue",
  "basicaly": "basically",
  "beautifuly": "beautifully",
  "biscut": "biscuit",
  "boundry": "boundary",
  "burgler": "burglar",
  "challange": "challenge",
  "charactor": "character",
  "cheif": "chief",
  "choclate": "chocolate",
  "colledge": "college",
  "comission": "commission",
  "comitment": "commitment",
  "comparision": "comparison",
  "competeive": "competitive",
  "complyed": "complied",
  "congradulate": "congratulate",
  "consciencious": "conscientious",
  "conscent": "consent",
  "convertable": "convertible",
  "corection": "correction",
  "corresspondence": "correspondence",
  "cruicial": "crucial",
  "curosity": "curiosity",
  "decaffinated": "decaffeinated",
  "decieve": "deceive",
  "desparate": "desperate",
  "diaster": "disaster",
  "documant": "document",
  "dominent": "dominant",
  "dumbell": "dumbbell",
  "efficent": "efficient",

  "encourgae": "encourage",
  "epitomy": "epitome",
  "essense": "essence",
  "exagerrate": "exaggerate",
  "excercise": "exercise",
  "exept": "except",
  "expresion": "expression",
  "fasinate": "fascinate",
  "familar": "familiar",
  "fatique": "fatigue",
  "favourite": "favorite",
  "figgure": "figure",
  "flourescent": "fluorescent",
  "foilage": "foliage",
  "forword": "forward",
  "fulfil": "fulfill",
  "grammer": "grammar",
  "granduer": "grandeur",
  "guidence": "guidance",
  "handfull": "handful",
  "harrass": "harass",
  "harasment": "harassment",
  "heighth": "height",
  "heros": "heroes",
  "higest": "highest",
  "hopful": "hopeful",
  "humourous": "humorous",
  "hygeine": "hygiene",
  "ignorence": "ignorance",
  "imaginery": "imaginary",
  "implict": "implicit",
  "inevitible": "inevitable",
  "insistance": "insistence",
  "insurence": "insurance",
  "intellegent": "intelligent",
  "intolorance": "intolerance",
  "jewellry": "jewelry",
  "judgement": "judgment",
  "kernal": "kernel",
  "ledgend": "legend",
  "legitamate": "legitimate",
  "liberry": "library",
  "lieing": "lying",
  "liscense": "license",
  "litterature": "literature",
  "loosly": "loosely",
  "luxery": "luxury",
  "managment": "management",
  "medevil": "medieval",
  "miniscule": "minuscule",
  "morgage": "mortgage",

  "mutiple": "multiple",
  "narative": "narrative",
  "nieghbor": "neighbor",
  "ninty": "ninety",
  "nowdays": "nowadays",
  "occasionaly": "occasionally",
  "omited": "omitted",
  "oponent": "opponent",

  "overide": "override",
  "pamplet": "pamphlet",
  "panick": "panic",
  "particually": "particularly",


  "plagarism": "plagiarism",
  "planing": "planning",
  "pleasent": "pleasant",
  "ploting": "plotting",
  "polotics": "politics",
  "preperation": "preparation",
  "presance": "presence",

  "proove": "prove",
  "quarentine": "quarantine",
  "recomend": "recommend",
  "relevent": "relevant",
  "repitition": "repetition",
  "restraunt": "restaurant",
  "releif": "relief",
  "resistence": "resistance",
  "sincerly": "sincerely",
  "sissors": "scissors",
  "sofware": "software",
  "stomache": "stomach",
  "stragedy": "strategy",
  "strenght": "strength",
  "stuborn": "stubborn",
  "subpena": "subpoena",
  "technolgy": "technology",
  "temperture": "temperature",
  "testemony": "testimony",
  "therefor": "therefore",
  "thouroughly": "thoroughly",
  "trustworthly": "trustworthy",
  "tyrany": "tyranny",
  "ultimatly": "ultimately",
  "umong": "among",
  "underate": "underrate",
  "unfortuntely": "unfortunately",
  "upholstry": "upholstery",
  "valuble": "valuable",
  "villian": "villain",
  "volenteer": "volunteer",
  "warrent": "warrant",
  "weigth": "weight",
  "whereever": "wherever",
  "whitch": "which",
};

// ═══════════════════════════════════════════════════════════
// ESPAÑOL (es)
// ═══════════════════════════════════════════════════════════
const es: Record<string, string> = {
  // ── Acentuación ──
  "tambien": "también", "tbn": "también", "tmb": "también",
  "ademas": "además",
  "hacia": "hacía", "habia": "había", "habian": "habían",
  "dia": "día", "dias": "días",
  "musica": "música", "magica": "mágica", "magico": "mágico",
  "energia": "energía", "energetico": "energético",
  "comunicacion": "comunicación",
  "educacion": "educación",
  "organizacion": "organización",
  "situacion": "situación",
  "informacion": "información",
  "decision": "decisión", "decicion": "decisión",
  "atencion": "atención",
  "pasion": "pasión",
  "nacion": "nación",
  "relacion": "relación",
  "funcion": "función",
  "opcion": "opción",
  "opinion": "opinión",
  "vision": "visión",
  "mision": "misión",
  "explosion": "explosión",
  "invasion": "invasión",
  "correccion": "corrección",
  "produccion": "producción",
  "reduccion": "reducción",
  "extension": "extensión",
  "leccion": "lección",
  "direccion": "dirección",
  "seccion": "sección",
  "version": "versión",
  "television": "televisión",
  "accion": "acción",
  "reaccion": "reacción",
  "creacion": "creación",
  "evaluacion": "evaluación",
  "operacion": "operación",
  "preparacion": "preparación",
  "programacion": "programación",
  "autorizacion": "autorización",
  "validacion": "validación",
  "aplicacion": "aplicación",
  "administracion": "administración",
  "conservacion": "conservación",
  "modificacion": "modificación",
  "clasificacion": "clasificación",
  "verificacion": "verificación",
  "recepcion": "recepción",
  "interrupcion": "interrupción",
  "contradiccion": "contradicción",
  "comprension": "comprensión",
  "ubicacion": "ubicación",
  "calificacion": "calificación",
  "recomendacion": "recomendación",
  "simplificacion": "simplificación",
  "ampliacion": "ampliación",
  "reproduccion": "reproducción",
  "distribucion": "distribución",
  "participacion": "participación",
  "celebracion": "celebración",
  "reunificacion": "reunificación",
  "transmision": "transmisión",
  "revelacion": "revelación",
  "confirmacion": "confirmación",
  "cancelacion": "cancelación",
  "reservacion": "reservación",
  "habitacion": "habitación",
  "combinacion": "combinación",
  "correlacion": "correlación",



























  "inspeccion": "inspección",
  "proteccion": "protección",
  "reparacion": "reparación",
  "instalacion": "instalación",
  "señalizacion": "señalización",
  "consolidacion": "consolidación",
  "modernizacion": "modernización",
  "industrializacion": "industrialización",
  "tecnificacion": "tecnificación",
  "automatizacion": "automatización",
  "digitalizacion": "digitalización",
  "globalizacion": "globalización",
  "liberalizacion": "liberalización",
  "privatizacion": "privatización",
  "regulacion": "regulación",
  "normalizacion": "normalización",
  "estandarizacion": "estandarización",
  "optimizacion": "optimización",
  "maximizacion": "maximización",
  "minimizacion": "minimización",
  // ── Erros comuns ──
  "xq": "por qué", "xque": "por qué", "k": "que",
  "dnd": "donde", "aki": "aquí", "porfa": "por favor",
  "porfas": "por favor", "xfavor": "por favor",
  "bno": "bueno", "bna": "buena",
  "np": "no pues", "nt": "no te", "ns": "no sé",
  "despues": "después",
  "frio": "frío", "rapido": "rápido",
  "ultimo": "último", "pagina": "página",
  "linea": "línea", "animacion": "animación",
  "corazon": "corazón",
  "camion": "camión",
  "jabon": "jabón",
  "bendicion": "bendición",
  "maldicion": "maldición",
  "estacion": "estación",
  "avion": "avión",
  "periodico": "periódico",
  "lastima": "lástima",




  "codigo": "código",
  "titulo": "título",


  "tamano": "tamaño",





  "presion": "presión",

























  "rectangulo": "rectángulo",
  "triangulo": "triángulo",
  "circulo": "círculo",




  "piramide": "pirámide",
  // ── Abreviações e gírias ──

  // ── Expressões ──



  "perdon": "perdón",



  "cuanto": "cuánto",

  "aqui": "aquí", "alli": "allí",
};

// ═══════════════════════════════════════════════════════════
// FRANÇAIS (fr)
// ═══════════════════════════════════════════════════════════
const fr: Record<string, string> = {
  // ── Accents ──
  "etre": "être", "etres": "êtres",
  "cote": "côte",
  "sur": "sûr", "mur": "mûr",
  "daccord": "d'accord",
  "biensur": "bien sûr",
  "egalement": "également",
  "evidemment": "évidemment",
  "different": "différent", "differente": "différente",
  "necessaire": "nécessaire",
  "probleme": "problème",
  "systeme": "système",
  "theme": "thème",
  "poeme": "poème",
  "extreme": "extrême",
  "recemment": "récemment",
  "generalement": "généralement",
  "eventuellement": "éventuellement",
  "frequemment": "fréquemment",
  "complement": "complément",
  "evenement": "événement", "evenements": "événements",
  "activite": "activité",
  "societe": "société",
  "liberte": "liberté",
  "egalite": "égalité",
  "fraternite": "fraternité",
  "opportunite": "opportunité",
  "possibilite": "possibilité",
  "capacite": "capacité",
  "qualite": "qualité",
  "quantite": "quantité",
  "specialite": "spécialité",
  "universite": "université",
  "cite": "cité",
  "verite": "vérité",
  "beaute": "beauté",
  "volonte": "volonté",
  "dignite": "dignité",
  "autorite": "autorité",
  "priorite": "priorité",
  "majorite": "majorité",
  "minorite": "minorité",
  "sante": "santé",
  "creation": "création",

  "reaction": "réaction",



  "precision": "précision",









  "reduction": "réduction",



  "education": "éducation",


  "evaluation": "évaluation",
  "operation": "opération",



  "reponse": "réponse",
  "experience": "expérience",

  "presence": "présence",

  "difference": "différence",








  "evidence": "évidence",
  "sequence": "séquence",
  "frequence": "fréquence",


  "independance": "indépendance",


  "resistance": "résistance",

  "existente": "existant",


  "tolerance": "tolérance",

  "elegance": "élégance",
  "significance": "signifiance",
  // ── Erros comuns ──
  "cest": "c'est",
  "na": "n'a", "nest": "n'est",
  "desole": "désolé", "desolee": "désolée",
  "peut-etre": "peut-être",
  "apres": "après", "deja": "déjà",
  "bientot": "bientôt",
  "tjrs": "toujours", "bcp": "beaucoup",
  "tt": "tout", "tds": "tous",
  "prq": "pourquoi", "pk": "pourquoi",
  "jsui": "je suis", "jsuis": "je suis",
  "chui": "je suis",
  // ── Substantivos comuns ──

  "ecole": "école",



  "hopital": "hôpital",

  "aeroport": "aéroport",
  "hotel": "hôtel",
  "eglise": "église",
  "musee": "musée",
  "cinema": "cinéma",
  "theatre": "théâtre",
  "bibliotheque": "bibliothèque",
  // ── Verbos comuns ──

  "ecouter": "écouter",
  "echouer": "échouer",
  // ── Adjetivos ──
  // ── Conectivos ──



  // ── Saudações ──
  "s'il vous plait": "s'il vous plaît",
};

// ═══════════════════════════════════════════════════════════
// DEUTSCH (de)
// ═══════════════════════════════════════════════════════════
const de: Record<string, string> = {
  // ── Umlaut / ß errors ──
  "gross": "groß", "grosz": "groß",
  "Fuss": "Fuß", "fuss": "Fuß",
  "Strasse": "Straße", "strasse": "Straße",
  "schon": "schön",
  "uber": "über", "ueber": "über",
  "fuer": "für", "fur": "für",
  "wuerde": "würde",
  "koennen": "können", "konnen": "können",
  "mussen": "müssen", "musssen": "müssen",
  "koennte": "könnte", "konnte": "könnte",
  "muesste": "müsste",
  "wuensche": "wünsche", "wunsche": "wünsche",
  "Kuche": "Küche",
  "hoechlich": "höflich",
  "hoehe": "Höhe", "naehe": "Nähe",
  "Muedchen": "Mädchen", "maedchen": "Mädchen",
  "muede": "müde",
  "froehlich": "fröhlich",
  "gluecklich": "glücklich",
  "ungluecklich": "unglücklich",
  "nervoes": "nervös",
  "eifersuechtig": "eifersüchtig",
  "veraergert": "verärgert",
  "shoen": "schön",
  "natuerlich": "natürlich",

  "heiss": "heiß",

  "hasslich": "hässlich",




  "moechlich": "möglich",





















  "wuetend": "wütend",


  // ── Substantivos ──

  "Tuer": "Tür",




  "Fruehling": "Frühling",
  "Maerz": "März",

  // ── Erros de digitação ──




  // ── Verbos ──

  "hoeren": "hören",
  "erklaeren": "erklären",

  "erzaehlen": "erzählen",
  "aendern": "ändern",
  "zerstoeren": "zerstören",
  "eroeffnen": "eröffnen",
  "schliessen": "schließen",
  "oeffnen": "öffnen",


  "geniessen": "genießen",
  "ueben": "üben",

  "waehlen": "wählen",
};

// ═══════════════════════════════════════════════════════════
// ITALIANO (it)
// ═══════════════════════════════════════════════════════════
const it: Record<string, string> = {
  // ── Acentos ──
  "pero": "però",
  "perche": "perché", "xche": "perché", "perke": "perché",
  "piu": "più", "puo": "può",
  "cioe": "cioè",
  "gia": "già",
  "datoche": "dato che", "poiche": "poiché",
  // ── Erros comuns de acento ──
  "citta": "città", "cittá": "città",
  "universita": "università",
  "eta": "età", "qualita": "qualità",
  "quantita": "quantità", "capacita": "capacità",
  "dignita": "dignità", "volonta": "volontà",
  "liberta": "libertà", "equalta": "uguaglianza",
  "belezza": "bellezza", "belleza": "bellezza",
  "felicita": "felicità",
  "gravita": "gravità", "autorita": "autorità",
  "priorita": "priorità",
  "possibilita": "possibilità",
  "opportunita": "opportunità",
  "attivita": "attività",
  "societa": "società",
  "specialita": "specialità",





































  // ── Erros comuns de digitação ──
  "grazzie": "grazie",








  "occasionlamente": "occasionalmente",




  "basicamente": "basicalmente",


  // ── Substantivos ──












  // ── Verbos ──










  // ── Adjetivos ──







  // ── Conectivos ──


  // ── Saudações ──





};

// ═══════════════════════════════════════════════════════════
// TÜRKÇE (tr)
// ═══════════════════════════════════════════════════════════
const tr: Record<string, string> = {
  // ── Caracteres turcos ──
  "guzel": "güzel", "oglu": "oğlu",
  "dusunmek": "düşünmek", "dusuncu": "düşünce",
  "ogrenmek": "öğrenmek", "ogretmen": "öğretmen",

  "calismak": "çalışmak",
  "baslamak": "başlamak",



  "degistirmek": "değiştirmek",
  "gelistirmek": "geliştirmek",
  "artirmak": "artırmak",

  "olusturmak": "oluşturmak",


  "cikarmak": "çıkarmak",
  "birlestirmek": "birleştirmek",
  "ayirmak": "ayırmak",
  "secmek": "seçmek",

  "saglamak": "sağlamak",


  "yikmak": "yıkmak",


  "tasimak": "taşımak",
  "tasinmak": "taşınmak",
  "yuklenmek": "yüklenmek",

  "guc": "güç",
  "dusunce": "düşünce",
  "ogrenci": "öğrenci",

  "cok": "çok",





  "mumkun": "mümkün",


  "onemli": "önemli",
  "onemsiz": "önemsiz",
  "faydali": "faydalı",
  "zararli": "zararlı",
  "guvenli": "güvenli",




  "karmasik": "karmaşık",
  "acik": "açık",
  "kapali": "kapalı",

  "bos": "boş",
  "buyuk": "büyük",
  "kucuk": "küçük",

  "kisa": "kısa",
  "yuksek": "yüksek",
  "dusuk": "düşük",
  "genis": "geniş",

  "kalin": "kalın",

  "agir": "ağır",

  "sicak": "sıcak",
  "soguk": "soğuk",




  "hizli": "hızlı",
  "yavas": "yavaş",
  "guclu": "güçlü",
  "zayif": "zayıf",



  "uzgun": "üzgün",
  "kizgin": "kızgın",


  "sabir": "sabır",


  "saygi": "saygı",
  "hosgoru": "hoşgörü",

  "ozgurluk": "özgürlük",
  "esitlik": "eşitlik",
  "kardeslik": "kardeşlik",
  "baris": "barış",
  "savas": "savaş",
  "dusmanlik": "düşmanlık",
  "arkadaslik": "arkadaşlık",
  "yardimlasma": "yardımlaşma",
  "isbirligi": "işbirliği",
  // ── Substantivos ──
  "sehir": "şehir",
  "ulke": "ülke", "dunya": "dünya",
  "gun": "gün",
  "yil": "yıl",
  "cocuk": "çocuk", "kadin": "kadın",
  "es": "eş",

  "hemsire": "hemşire",


  "havalimani": "havalimanı",
  "yatakodasi": "yatak odası",
  "kapi": "kapı",

  // ── Conectivos ──
  "simdi": "şimdi", "hala": "hâlâ",
  "hic": "hiç",
  // ── Saudações ──


  "gunaydin": "günaydın",

  "tesekkurler": "teşekkürler",



  "gorusuruz": "görüşürüz",



  "sanirim": "sanırım",
};

// ═══════════════════════════════════════════════════════════
// РУССКИЙ (ru)
// ═══════════════════════════════════════════════════════════
const ru: Record<string, string> = {
  // ── Common misspellings using Latin characters ──
  "privet": "привет",
  "spasibo": "спасибо",
  "pozhaluysta": "пожалуйста",
  "da": "да",
  "net": "нет",
  "mozhno": "можно",
  "nuzhno": "нужно",
  "nado": "надо",
  "horosho": "хорошо",
  "ploho": "плохо",
  "bolshoy": "большой",
  "malenkiy": "маленький",
  "novyy": "новый",
  "staryy": "старый",
  "dlinnyy": "длинный",
  "korotkiy": "короткий",
  "vysokiy": "высокий",
  "nizkiy": "низкий",
  "shirokiy": "широкий",
  "uzkiy": "узкий",
  "goryachiy": "горячий",
  "holodnyy": "холодный",
  "bystryy": "быстрый",
  "medlennyy": "медленный",
  "silnyy": "сильный",
  "slabyy": "слабый",
  "bogatey": "богатый",
  "bednyy": "бедный",
  "schastlivyy": "счастливый",
  "grustnyy": "грустный",
  "zdorovyy": "здоровый",
  "bolnoy": "больной",
  "krasivyy": "красивый",
  "gryaznyy": "грязный",
  "chistyy": "чистый",
  "tyazhelyy": "тяжелый",
  "legkiy": "легкий",
  "golodnyy": "голодный",
  "syytnyy": "сытный",
  "umnyy": "умный",
  "glupyy": "глупый",
  "dobryy": "добрый",
  "zloy": "злой",
  "veselyy": "веселый",
  "skuchnyy": "скучный",
  "interesnyy": "интересный",
  "vazhnyy": "важный",
  "nuzhnyy": "нужный",
  "poleznyy": "полезный",
  "vrednyy": "вредный",
  "opasnyy": "опасный",
  "bezopasnyy": "безопасный",
  "prostoy": "простой",
  "slozhnyy": "сложный",
  "trudnyy": "трудный",
  "vozmozhnyy": "возможный",
  "nevozmozhnyy": "невозможный",
  "osobennyy": "особенный",
  "obychnyy": "обычный",
  "strannyy": "странный",
  "strashnyy": "страшный",
  "milyy": "милый",
  "zabavnyy": "забавный",
  "serioznyy": "серьезный",
  // ── Nouns ──
  "chelovek": "человек",
  "lyudi": "люди",
  "rebenok": "ребенок",
  "muzhchina": "мужчина",
  "zhenschina": "женщина",
  "drug": "друг",
  "podruga": "подруга",
  "semya": "семья",
  "dom": "дом",
  "kvartira": "квартира",
  "gorod": "город",
  "strana": "страна",
  "mir": "мир",
  "zhizn": "жизнь",
  "vremya": "время",
  "den": "день",
  "noch": "ночь",
  "utro": "утро",
  "vecher": "вечер",
  "rabota": "работа",
  "shkola": "школа",
  "universitet": "университет",
  "magazin": "магазин",
  "restoran": "ресторан",
  "bolnitsa": "больница",
  "avtobus": "автобус",
  "mashina": "машина",
  "samolet": "самолет",
  "poezd": "поезд",
  "metkro": "метро",
  "voda": "вода",
  "eda": "еда",
  "khleb": "хлеб",
  "myaso": "мясо",
  "ryba": "рыба",
  "ovoshchi": "овощи",
  "frukty": "фрукты",
  "chay": "чай",
  "kofe": "кофе",
  "moloko": "молоко",
  "sakhar": "сахар",
  "sol": "соль",
  // ── Verbs ──
  "byt": "быть",
  "imet": "иметь",
  "delat": "делать",
  "idti": "идти",
  "yekhat": "ехать",
  "pisat": "писать",
  "chitat": "читать",
  "govorit": "говорить",
  "slushat": "слушать",
  "ponimat": "понимать",
  "znat": "знать",
  "dumat": "думать",
  "verit": "верить",
  "lyubit": "любить",
  "nosit": "носить",
  "kupit": "купить",
  "prodat": "продать",
  "rabotat": "работать",
  "uchit": "учить",
  "uchitsya": "учиться",
  "igrat": "играть",
  "est": "есть",
  "pit": "пить",
  "spat": "спать",
  "zhit": "жить",
  "umirat": "умирать",
  "rodit": "родить",
  "rastit": "растить",
  "pomogat": "помогать",
  "zashchishchat": "защищать",
  "borotsya": "бороться",
  "pobezhdat": "побеждать",
  "proigryvat": "проигрывать",
  "nachinat": "начинать",
  "zakanchivat": "заканчивать",
  "prodolzhat": "продолжать",
  "ostanavlivat": "останавливать",
  "otkryvat": "открывать",
  "zakryvat": "закрывать",
  "vklyuchat": "включать",
  "vyklyuchat": "выключать",
  "ispolzovat": "использовать",
  "sozidat": "создать",
  "uniktozhat": "уничтожить",
  "ispravit": "исправить",
  "uluchshit": "улучшить",
  "ukrepit": "укрепить",
  "razrushit": "разрушить",
  "postroit": "построить",
  // ── Conjunctions ──
  "i": "и",
  "ili": "или",
  "no": "но",
  "a": "а",
  "poetomu": "поэтому",
  "odnako": "однако",
  "krome": "кроме",
  "takzhe": "также",
  "vsego": "всего",
  "vozmozhno": "возможно",
  "navernoye": "наверное",
  "tochno": "точно",
  "obyazatelno": "обязательно",

  "esli": "если",
  "kogda": "когда",
  "gde": "где",
  "kuda": "куда",
  "otkuda": "откуда",
  "kak": "как",
  "pochemu": "почему",
  "zachem": "зачем",
  "skolko": "сколько",
  "kotoryy": "который",
  "chto": "что",
  "kto": "кто",
  "chey": "чей",
  "vsyo": "всё",
  "vse": "все",
  "nichto": "ничто",
  "nikto": "никто",
  "kazhdyy": "каждый",
  "lyuboy": "любой",
  "drugoy": "другой",
  "samyy": "самый",
  "ochen": "очень",
  "dostaatochno": "достаточно",
  "mnogo": "много",
  "malo": "мало",
  "bolshe": "больше",
  "menshe": "меньше",
  "pervyy": "первый",
  "posledniy": "последний",
  "sleduyushchiy": "следующий",
  "predydushchiy": "предыдущий",
  "verkhniy": "верхний",
  "nizhniy": "нижний",
  "pravyy": "правый",
  "levyy": "левый",
  "tsentralnyy": "центральный",
  "severnyy": "северный",
  "yuzhnyy": "южный",
  "vostochnyy": "восточный",
  "zapadnyy": "западный",
};


// ═══════════════════════════════════════════════════════════
// 日本語 (ja) — Homophone/visual confusion corrections
// ═══════════════════════════════════════════════════════════
const ja: Record<string, string> = {
  // ── Homophone confusions (same reading, wrong kanji) ──
  "-demo": "でも", "-temo": "ても", "-nado": "など",
  "sokudo": "速度", "sokudou": "速い", "hayai": "速い",
  "omoi": "重い", "karui": "軽い",
  "ookii": "大きい", "chiisai": "小さい",
  "nagai": "長い", "mijikai": "短い",
  "takai": "高い", "yasui": "安い",
  "atsui": "暑い", "samui": "寒い",
  "oishii": "美味しい", "mazui": "不味い",
  "utsukushii": "美しい", "minikui": "醜い",
  "atarashii": "新しい", "furui": "古い",
  "osoi": "遅い",
  "tozai": "東西", "nanboku": "南北",
  "chizu": "地図", "sekai": "世界",
  "tenki": "天気", "kumo": "雲",
  "ame": "雨", "yuki": "雪",
  "kaze": "風", "hi": "火",
  "mizu": "水", "tsuchi": "土",
  "ki": "木", "hana": "花",
  "tori": "鳥", "sakana": "魚",
  "neko": "猫", "inu": "犬",
  // ── Common homophone kanji errors ──
  "kikan": "期間",
  "shiken": "試験",
  "seihin": "製品",
  "jikan": "時間",
  "koutei": "工程",
  "yotei": "予定",
  "shite": "して", "sute": "捨て",
  "tsukau": "使う", "tsukuru": "作る",
  "miru": "見る", "kiku": "聞く",
  "yomu": "読む", "kaku": "書く",
  "hanasu": "話す", "iu": "言う",
  "wakaru": "分かる", "shiru": "知る",
  "suru": "する", "naru": "なる",
  "iku": "行く", "kuru": "来る",
  "kaeru": "帰る", "deru": "出る",
  "iru": "いる", "aru": "ある",
  "taberu": "食べる", "nomu": "飲む",
  "neru": "寝る", "okiru": "起きる",
  // ── Common words ──
  "arigatou": "ありがとうございます",
  "sumimasen": "すみません",
  "gomen": "ごめん",
  "onegaishimasu": "お願いします",
  "konnichiwa": "こんにちは",
  "sayounara": "さようなら",
  "ohayou": "おはよう",
  "oyasumi": "おやすみ",
  "hai": "はい",
  "iie": "いいえ",
  "sore": "それ", "kore": "これ", "are": "あれ",
  "doko": "どこ", "koko": "ここ", "asoko": "あそこ",
  "itsu": "いつ", "ima": "今", "ashita": "明日",
  "kinou": "昨日", "kyou": "今日",
  "watashi": "私", "anata": "あなた",
  "kare": "彼", "kanojo": "彼女",
  "tomodachi": "友達", "kazoku": "家族",
  "sensei": "先生", "gakusei": "学生",
  "shigoto": "仕事", "gakkou": "学校",
  "ie": "家", "machi": "町",
  "heya": "部屋", "kuruma": "車",
  "densha": "電車", "hikouki": "飛行機",
  "tabemono": "食べ物", "nomimono": "飲み物",
  "mise": "店", "ginkou": "銀行",
  "byouin": "病院", "koubaan": "交番",
  "toshokan": "図書館",
  "suuji": "数字", "moji": "文字",
  "kotoba": "言葉", "imi": "意味",
  "mondai": "問題", "kotae": "答え",
  "hanashi": "話", "rekishi": "歴史",
  "bunka": "文化", "shakai": "社会",
  "seiji": "政治", "keizai": "経済",
  "kagaku": "科学", "gijutsu": "技術",
  "bijutsu": "美術", "ongaku": "音楽",
  "supootsu": "スポーツ",
  "ryokou": "旅行", "tokubetsu": "特別",
  "futsuu": "普通", "tokuni": "特に",
  "taihen": "大変", "totemo": "とても",
  "sukoshi": "少し", "takusan": "たくさん",
  "mou": "もう", "mada": "まだ",
  "sugu": "すぐ", "yukkuri": "ゆっくり",
  "kitto": "きっと", "zutto": "ずっと",
  "dandan": "だんだん", "daitai": "大体",
  "tabun": "たぶん",
  "zehi": "ぜひ", "douzo": "どうぞ",
  "chotto": "ちょっと", "demo": "でも",
  "toka": "とか", "nanka": "なんか",
  "nante": "なんて", "deshiyou": "でしょう",
  "darou": "だろう", "kamo": "かも",
  "beki": "べき", "hazu": "はず",
  "tsumori": "つもり", "wake": "わけ",
  "kara": "から", "made": "まで",
  "yori": "より", "hodo": "ほど",
  "bakari": "ばかり", "dake": "だけ",
  "mo": "も", "ga": "が",
  "wa": "は", "wo": "を",
  "to": "と", "no": "の",
  "ka": "か", "ne": "ね",
  "yo": "よ", "na": "な",
};

// ═══════════════════════════════════════════════════════════
// 中文 (zh) — Homophone/visual confusion corrections
// ═══════════════════════════════════════════════════════════
const zh: Record<string, string> = {
  // ── Homophone confusions (pinyin input → wrong character) ──
  "de": "的", "di": "地", "de2": "得",
  "zai": "在", "zai2": "再",
  "ta": "他", "ta2": "她", "ta3": "它",
  "zuo": "做", "zuo2": "作",
  "zhi": "只", "zhi2": "知", "zhi3": "之",
  "jin": "进", "jin2": "近", "jin3": "今",
  "yuan": "远", "yuan2": "原", "yuan3": "元",
  "li": "里", "li2": "理", "li3": "力",
  "shi": "是", "shi2": "事", "shi3": "时",
  "sheng": "生", "sheng2": "声", "sheng3": "省",
  "xing": "行", "xing2": "型", "xing3": "形",
  "dong": "东", "dong2": "懂", "dong3": "动",
  "xia": "下", "xia2": "夏", "xia3": "小",
  "shang": "上", "shang2": "商",
  "zhong": "中", "zhong2": "重",
  "guo": "国", "guo2": "过", "guo3": "果",
  "he": "和", "he2": "合", "he3": "喝",
  "hui": "会", "hui2": "回", "hui3": "汇",
  "qi": "起", "qi2": "七", "qi3": "气",
  "you": "有", "you2": "又", "you3": "由",
  "dui": "对", "dui2": "队",
  "fa": "发", "fa2": "法", "fa3": "发",
  "ming": "明", "ming2": "名", "ming3": "命",
  // ── Common words ──
  "wo": "我", "ni": "你",
  "women": "我们", "nimen": "你们", "tamen": "他们",
  "zhege": "这个", "nage": "那个",
  "shenme": "什么", "zenme": "怎么",
  "weishenme": "为什么",
  "naer": "哪儿", "zher": "这儿",
  "duoshao": "多少", "ji": "几",
  "shihou": "时候", "diandian": "点",
  "tian": "天", "nian": "年", "yue": "月",
  "hao": "好", "huai": "坏",
  "duo": "多", "shao": "少",
  "chang": "长", "duan": "短",
  "gao": "高", "ai": "矮",
  "kuai": "快", "man": "慢",
  "zao": "早", "wan": "晚",
  "xin": "新", "jiu": "旧",
  "mei": "美", "chou": "丑",
  "gui": "贵", "pianyi": "便宜",
  // ── Places/Things ──
  "jia": "家", "xuexiao": "学校",
  "gongsi": "公司", "yiyuan": "医院",
  "dianying": "电影", "yinyue": "音乐",
  "shu": "书", "baozhi": "报纸",
  "chifan": "吃饭", "hecha": "喝茶",
  "shuijiao": "睡觉", "gongzuo": "工作",
  "xuexi": "学习", "youxi": "游戏",
  "pengyou": "朋友", "jiaren": "家人",
  "laoshi": "老师", "tongxue": "同学",
  // ── Grammar particles ──
  "le": "了",
  "ma": "吗", "ne": "呢", "ba": "吧",
  "zhe": "着", "gei": "给",
  "cong": "从", "dao": "到",
  "gen": "跟",
  "haiyou": "还有", "suoyi": "所以",
  "danshi": "但是", "ruguole": "如果",
  "yinwei": "因为", "jiushi": "就是",
  "huozhe": "或者", "buguo": "不过",
  "suiran": "虽然", "raner": "然而",
  "bingqie": "并且",
  "keneng": "可能", "yinggai": "应该",
  "bixu": "必须", "keyi": "可以",
  "xuyao": "需要", "xiang": "想",
  "yao": "要", "neng": "能",
};

// ═══════════════════════════════════════════════════════════
// 한국어 (ko) — Homophone/visual confusion corrections
// ═══════════════════════════════════════════════════════════
const ko: Record<string, string> = {
  // ── Homophone confusions ──
  "deul": "들", "geot": "것",
  "eun": "은", "neun": "는",
  "eul": "을", "reul": "를",
  "gwa": "과", "wa": "와",
  "euro": "으로", "ro": "로",
  // ── Common words ──
  "annyeong": "안녕",
  "annyeonghaseyo": "안녕하세요",
  "gamsahamnida": "감사합니다",
  "mianhamnida": "미안합니다",
  "ye": "예", "aniyo": "아니요",
  "jeogiyo": "저기요",
  "gwaenchanayo": "괜찮아요",
  // ── Pronouns ──
  "neo": "너", "dangsin": "당신",
  "uri": "우리",
  "igeot": "이것", "geugeot": "그것",
  "jeogeot": "저것",
  "eodi": "어디", "eojje": "어째",
  "wae": "왜", "eotteoke": "어떻게",
  "mwo": "뭐", "nugu": "누구",
  "eonje": "언제",
  // ── Adjectives ──
  "keun": "큰", "jageun": "작은",
  "nopeun": "높은", "najeun": "낮은",
  "jinan": "긴", "jjareun": "짧은",
  "meonjin": "먼", "gaeun": "가까운",
  "manyeak": "많은", "jeogeun": "적은",
  "kkeun": "큰",
  "jjigeun": "작은",
  "nareun": "빠른", "neuryeogeun": "느린",
  "mareun": "많은", "jeodoeun": "적은",
  "ppareun": "빠른", "neuryeobeorin": "느린",
  "noryeok": "놀라운", "gamsanghan": "감상한",
  // ── Verbs ──
  "hada": "하다", "gada": "가다",
  "oda": "오다", "manna": "만나다",
  "deulda": "들다", "boda": "보다",
  "meokda": "먹다", "masida": "마시다",
  "sada": "사다", "palda": "팔다",
  "jada": "자다", "ilda": "일어나다",
  "gongbuhada": "공부하다",
  "ilhada": "일하다",
  "sulhada": "실험하다",
  "norada": "놀다",
  "sarrida": "살리다",
  "jukda": "죽다",
  "sarada": "살아나다",
  "tteolda": "뜯다",
  "mandeulda": "만들다",
  "gajyeoada": "가져오다",
  "deurida": "드리다",
  "batda": "받다",
  "junghada": "정하다",
  "gajida": "가지다",
  // ── Places ──
  "jip": "집", "hakgyo": "학교",
  "hoesa": "회사", "byeongwon": "병원",
  "sangjeom": "상점", "sigdang": "식당",
  "yeogwon": "여관", "gongwon": "공원",
  "yeok": "역", "gonghang": "공항",
  "dongmulwon": "동물원",
  "bangmulgwan": "박물관",
  "dosogwan": "도서관",
  "yeonghwagwan": "영화관",
};

// ═══════════════════════════════════════════════════════════
// العربية (ar) — Common confusions
// ═══════════════════════════════════════════════════════════
const ar: Record<string, string> = {
  // ── Common letter confusions (similar shapes) ──
  // Note: Arabic corrections work on unvoweled text matching
  "ala": "على", "an": "عن", "mn": "من", "ila": "إلى",
  "fyy": "في", "bh": "بها", "mnha": "منها",
  "allh": "الله", "bismillh": "بسم الله",
  // ── Common words (Latin transliteration → Arabic) ──
  "marhaba": "مرحبا",
  "ahlan": "أهلا",
  "salam": "سلام",
  "kaif": "كيف",
  "hal": "حال",
  "shukran": "شكرا",
  "afwan": "عفوا",
  "naam": "نعم",
  "la": "لا",
  "arjuuk": "أرجوك",
  "tawakkalna": "توكلنا",
  // ── Pronouns ──
  "ana": "أنا", "anta": "أنت",
  "anti": "أنتِ", "huwa": "هو",
  "hiya": "هي", "nahnu": "نحن",
  "antum": "أنتم", "hunna": "هن",
  // ── Question words ──
  "maadha": "ماذا", "limaadha": "لماذا",
  "ayna": "أين", "mata": "متى",
  "kayfa": "كيف", "man": "من",
  "maa": "ما",
  // ── Common nouns ──
  "bait": "بيت", "madina": "مدينة",
  "balad": "بلد", "dunya": "دنيا",
  "hayat": "حياة", "waqt": "وقت",
  "yawm": "يوم", "layl": "ليل",
  "sabah": "صباح", "masaa": "مساء",
  "ghada": "غدا", "ams": "أمس",
  "shams": "شمس", "qamar": "قمر",
  "najm": "نجم", "samak": "سمك",
  // ── Common verbs ──
  "kana": "كان", "yakunu": "يكون",
  "fiil": "فعل", "qala": "قال",
  "amara": "أمر", "nahaa": "نهى",
  "akala": "أكل", "shariba": "شرب",
  "raaa": "رأى", "samaa": "سمع",
  "alima": "علم", "arada": "أراد",
  "jaal": "جعل", "aataa": "أعطى",
  "akhadha": "أخذ", "wajada": "وجد",
  // ── Adjectives ──
  "kabir": "كبير", "saghir": "صغير",
  "tawil": "طويل", "qasir": "قصير",
  "jamil": "جميل", "qabih": "قبيح",
  "jdid": "جديد", "qdim": "قديم",
  "khayr": "خير", "sharr": "شر",
  "awwal": "أول", "aakhir": "آخر",
  "kathir": "كثير", "qalil": "قليل",
  "sahih": "صحيح", "khati": "خطأ",
};

// ═══════════════════════════════════════════════════════════
// हिन्दी (hi) — Common confusions
// ═══════════════════════════════════════════════════════════
const hi: Record<string, string> = {
  // ── Common confusions (matra/transliteration) ──
  "bhai": "भाई", "behen": "बहन",
  // ── Common words (Hinglish → Hindi) ──
  "namaste": "नमस्ते",
  "dhanyavaad": "धन्यवाद",
  "alvida": "अलविदा",
  "haan": "हाँ", "nahi": "नहीं",
  "kripya": "कृपया",
  "maaf": "माफ़",
  "swagat": "स्वागत",
  "shubh": "शुभ",
  // ── Pronouns ──
  "main": "मैं", "tum": "तुम",
  "aap": "आप", "woh": "वो",
  // ── Question words ──
  "kya": "क्या", "kaun": "कौन",
  "kahan": "कहाँ", "kab": "कब",
  "kyon": "क्यों", "kaise": "कैसे",
  "kitna": "कितना", "kaunsa": "कौनसा",
  // ── Common nouns ──
  "ghar": "घर", "shahar": "शहर",
  "desh": "देश", "duniya": "दुनिया",
  "zindagi": "ज़िंदगी", "waqt": "वक़्त",
  "din": "दिन", "raat": "रात",
  "subah": "सुबह", "shaam": "शाम",
  "kal": "कल", "aaj": "आज",
  "parso": "परसों", "tadha": "तड़ा",
  // ── Family ──
  "pita": "पिता", "maa": "माँ",
  "beta": "बेटा", "beti": "बेटी",
  // ── Common verbs ──
  "hona": "होना", "karna": "करना",
  "jana": "जाना", "aana": "आना",
  "khana": "खाना", "peena": "पीना",
  "sona": "सोना", "jagna": "जागना",
  "dekhna": "देखना", "sunnathe  ": "सुनना",
  "bolna": "बोलना",
  "samajhna": "समझना",
  "sikna": "सीखना",
  "sikhana": "सिखाना",
  "likhna": "लिखना", "padhna": "पढ़ना",
  "khelna": "खेलना",
  // ── Adjectives ──
  "achha": "अच्छा", "bura": "बुरा",
  "bada": "बड़ा", "chhota": "छोटा",
  "lamba": "लंबा",
  "naya": "नया", "purana": "पुराना",
  "sundar": "सुंदर",
  "amir": "अमीर", "gareeb": "ग़रीब",
  // ── Places/Things ──
  "school": "स्कूल", "dawai": "दवाई",
  "dukhan": "दुकान",
  "pani": "पानी", "roz": "रोज़",
  "kaam": "काम", "paisa": "पैसा",
  "roti": "रोटी", "chai": "चाय",
  "sabzi": "सब्ज़ी", "doodh": "दूध",
  // ── Conjunctions ──
  "aur": "और", "par": "पर",
  "lekin": "लेकिन", "ya": "या",
  "kyunki": "क्योंकि",
  "isliye": "इसलिए",
  "jaise": "जैसे",
  "jabki": "जबकि",
  "halaanki": "हालांकि",
  "phir": "फिर",
  "phirse": "फिरसे",
  // ── Time ──
  "abhi": "अभी", "ab": "अब",
  "pehle": "पहले", "baadmein": "बाद में",
  "hamesha": "हमेशा", "kabhi": "कभी",
  "kadhi": "कभी", "kabhi kabhi": "कभी कभी",
  "sabse": "सबसे", "zyada": "ज़्यादा",
  "kam": "कम", "bahut": "बहुत",
};

// ═══════════════════════════════════════════════════════════
// VOCATIVE RULES — Regex + replacement para vírgulas de vocativo
// ═══════════════════════════════════════════════════════════
type VocativeRule = [RegExp, string];

const VOCATIVE_RULES: Record<string, VocativeRule[]> = {
  pt: [
    [/(?:^|\s)(olá|oi|e aí|eai|fala|salve|opa|eae|eae|bom dia|boa tarde|boa noite)\s+([A-ZÀ-Ú][a-zà-ú]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(amigo|amiga|cara|mano|velho|garoto|garota|rapaz|molecada|turma|galera|pessoal|povão|mano|parceiro|campeão|mestre|chefe|doutor|professor|professora|senhor|senhora|moço|moça|meu bem|minha flor|meu amor|amor|querido|querida|meu querido|minha querida|bem)(?=\s)/, "$1,"],
  ],
  en: [
    [/(?:^|\s)(hey|hi|hello|yo|sup|what'?s up|greetings|howdy|cheers|mate|bro|dude|man|buddy|pal|chief|boss|captain|sir|ma'?am|lord|lady|folks|everyone|guys|y'?all|darling|honey|sweetheart|dear|love)\s+([A-Z][a-z]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(guys|folks|everyone|everybody|y'all|people|friends)\s*([,.!?]|$)/, "$1$2"],
  ],
  es: [
    [/(?:^|\s)(hola|ey|oiga|buenos días|buenas tardes|buenas noches|saludos|qué tal|buenas|epa|che|vamos)\s+([A-ZÁ-Ú][a-zá-ú]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(amigo|amiga|carnal|compa|primo|hermano|hermana|viejo|chavo|chava|mano|tío|tía|jefe|jefa|capitán|señor|señora|señorita|niño|niña|mi amor|amor|querido|querida|corazón|cielo|tesoro|bebé)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  fr: [
    [/(?:^|\s)(salut|bonjour|bonsoir|coucou|hey|allo|allô|enchanté)\s+([A-ZÀ-Ù][a-zà-ù]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(mon ami|mon amie|ami|amie|cher|chère|monsieur|madame|mademoiselle|le gars|la fille|frérot|meuf|ma belle|mon cœur|mon amour|chéri|chérie|bébé|ange|trésor)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  de: [
    [/(?:^|\s)(hallo|hey|grüß dich|grüß gott|guten Morgen|guten Tag|guten Abend|servus|moin|na|tach)\s+([A-ZÄ-Ü][a-zä-ü]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(Freund|Freundin|Kumpel|Alter|Mann|Frau|Junge|Mädchen|Chef|Herr|Frau|Meister|Lehrer|Lehrerin|Doc|Kollege|Kollegin|Schatz|Liebling|Herz|Engel)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  it: [
    [/(?:^|\s)(ciao|ehi|salve|buongiorno|buonasera|buonanotte|pronto|avvocò)\s+([A-ZÀ-Ú][a-zà-ú]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(amico|amica|fratello|sorella|ragazzo|ragazza|caro|cara|vecchio|vecchia|zio|zia|boss|capo|signore|signora|signorina|professore|professoressa|dottore|dottoressa|amore|cuore|tesoro|angelo|bambino|bambina)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  tr: [
    [/(?:^|\s)(merhaba|selam|hey|soyle|buyurun|gunaydin|iyi gunler|iyi aksamlar|efendim)\s+([A-Z][a-z]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(arkadaş|kardeş|abla|abi|usta|başkan|komutan|efendi|bey|hanım|patron|patrona|canım|aşkım|sevgilim|bebeğim|meleğim)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  ru: [
    [/(?:^|\s)(привет|здравствуй|здравствуйте|хай|йо|здарова|салют|приветик)\s+([А-ЯЁ][а-яё]+)(?=\s|$|[,.!?])/, "$1, $2"],
    [/(?:^|\s)(друг|подруга|брат|сестра|парень|девушка|старик|мужик|товарищ|коллега|начальник|шеф|капитан|командир|профессор|доктор|ребята|люди|дорогой|дорогая|любимый|любимая|солнышко|зайка|котёнок)\s*([,.!?]|$|\s)/, "$1,"],
  ],
  ja: [
    [/(?:^|\s)(こんにちは|こんばんは|おはよう|やあ|おい|ねえ|あの|なあ|さあ|よお|よう)\s+([\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]+)(?=\s|$|[,.!?。、])/, "$1、$2"],
    [/(?:^|\s)(さん|くん|ちゃん|先生|先輩|後輩|君|お前|あんた|みんな|皆さん|皆様|各位|お父さん|お母さん|お兄さん|お姉さん)\s*([,.!?。、]|$|\s)/, "$1、"],
  ],
  zh: [
    [/(?:^|\s)(你好|您好|嘿|嗨|喂|哎|啊|那个|这个|喂喂)\s+([\u4E00-\u9FFF]+)(?=\s|$|[,.!?。、])/, "$1，$2"],
    [/(?:^|\s)(朋友|兄弟|姐妹|帅哥|美女|老板|老师|同学|大家|各位|亲|亲爱的|小可爱)\s*([,.!?。、]|$|\s)/, "$1，"],
  ],
  ko: [
    [/(?:^|\s)(안녕|안녕하세요|여보세요|야|이봐|어이|저기)\s+([\uAC00-\uD7AF\u1100-\u11FF]+)(?=\s|$|[,.!?。、])/, "$1, $2"],
    [/(?:^|\s)(친구|형|동생|누나|언니|오빠|선배|후배|교수님|선생님|사장님|대표님|님|씨|군|양|여러분|모두|사랑|자기야)\s*([,.!?。、]|$|\s)/, "$1,"],
  ],
  ar: [
    [/(?:^|\s)(مرحبا|أهلا|سلام|يا|هيا|ألو|صباح|مساء)\s+([\u0600-\u06FF]+)(?=\s|$|[,.!?。、])/, "$1، $2"],
    [/(?:^|\s)(صديقي|صديقتي|أخي|أختي|حبيبي|حبيبتي|يا أخي|يا أختي|يا سيدي|يا سيدتي|يا أستاذ|يا جماعة|يا شباب|يا بنات|يا لله)\s*([,.!?。、]|$|\s)/, "$1،"],
  ],
  hi: [
    [/(?:^|\s)(नमस्ते|हैलो|अरे|सुनो|ए भाई|यार|हे)\s+([\u0900-\u097F]+)(?=\s|$|[,.!?।])/, "$1। $2"],
    [/(?:^|\s)(दोस्त|दोस्तों|भाई|बहन|भाई साब|यार|साथियो|गुरुजी|साहब|महोदय|प्यारे|जानू|बच्चे|लोगो|सब लोग)\s*([,.!?।]|$|\s)/, "$1।"],
  ],
};

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════
export const QUICK_FIXES: Record<string, Record<string, string>> = {
  pt, en, es, fr, de, it, tr, ru, ja, zh, ko, ar, hi,
};

export { VOCATIVE_RULES };
export type { VocativeRule };
