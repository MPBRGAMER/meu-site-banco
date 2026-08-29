import { writeFileSync } from "fs";
import { extraWords } from "./words-extra.mjs";

// ─── auto(): strips NFD diacritics → returns [unaccented, accented] or null ───
function auto(word) {
  const base = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return base !== word ? [base, word] : null;
}

// ─── SECTION 1: Manual common-error pairs ───────────────────────
// Each sub-array: [wrongWord, correctWord]
const MANUAL = {
  pt: [
    ["voce","você"],["vc","você"],["tb","também"],["pq","porque"],
    ["blz","beleza"],["hj","hoje"],["tmj","tamo junto"],["td","tudo"],
    ["ngm","ninguém"],["nds","nada"],["qdo","quando"],["q","que"],
    ["ta","tá"],["to","tô"],["mt","muito"],["msm","mesmo"],
    ["cmg","comigo"],["cvc","com você"],["flw","falou"],["vlw","valeu"],
    ["obg","obrigado"],["obgd","obrigado"],["msg","mensagem"],
    ["aki","aqui"],["eh","é"],["n","não"],["nao","não"],
    ["ninguem","ninguém"],["ninguen","ninguém"],["pk","porque"],
    ["porke","porque"],["porqe","porque"],["tmb","também"],["tbm","também"],
    ["bx","beijo"],["bjs","beijos"],["abs","abraços"],
    ["lvl","nível"],["cla","clã"],["npc","NPC"],["pvp","PvP"],["pve","PvE"],
    ["hp","HP"],["xp","XP"],["dps","DPS"],["gg","GG"],["drop","dropar"],
    ["inv","inventário"],["craft","craftar"],["spawn","spawn"],
    ["lag","lag"],["bug","bug"],["glitch","glitch"],["dupe","dupe"],
    ["wipe","wipe"],["raid","raid"],["squad","squad"],["loot","loot"],
    ["grind","grind"],["nerf","nerf"],["buff","buff"],["patch","patch"],
    ["update","update"],["dev","dev"],["staff","staff"],["mod","mod"],
    ["regiao","região"],["remedio","remédio"],["construcao","construção"],
    ["estacao","estação"],["combustivel","combustível"],["veiculo","veículo"],
    ["radio","rádio"],["agua","água"],["ofereco","ofereço"],
    ["comercio","comércio"],["negocio","negócio"],["mundo","mundo"],
    ["vendedor","vendedor"],["comida","comida"],["bandagem","bandagem"],
    ["mochila","mochila"],["ferramenta","ferramenta"],["material","material"],
    ["recursos","recursos"],["oficina","oficina"],["gerador","gerador"],
    ["bateria","bateria"],["carro","carro"],["moto","moto"],
    ["bicicleta","bicicleta"],["trader","trader"],["moeda","moeda"],
    ["dinheiro","dinheiro"],["troca","troca"],["vender","vender"],
    ["comprar","comprar"],["ajuda","ajuda"],["guia","guia"],
    ["dica","dica"],["dicas","dicas"],["procurando","procurando"],
    ["tenho","tenho"],["quero","quero"],["troco","troco"],
    ["sobrevivente","sobrevivente"],["zumbi","zumbi"],["zumbis","zumbis"],
    ["infectado","infectado"],["arma","arma"],["armas","armas"],
    ["armadura","armadura"],["remedio","remédio"],["cidade","cidade"],
    ["vila","vila"],["mapa","mapa"],["base","base"],["clan","clã"],
    ["farmar","farmar"],["kick","kickar"],["ban","banir"],
    ["adm","admin"],["regra","regra"],["regras","regras"],
  ],
  en: [
    ["teh","the"],["wat","what"],["wut","what"],["ur","your"],
    ["u","you"],["r","are"],["y","why"],["pls","please"],
    ["plz","please"],["thx","thanks"],["ty","thank you"],
    ["np","no problem"],["idk","I don't know"],["imo","in my opinion"],
    ["imho","in my humble opinion"],["btw","by the way"],["fyi","for your information"],
    ["tbh","to be honest"],["brb","be right back"],["afk","away from keyboard"],
    ["gg","good game"],["gl","good luck"],["hf","have fun"],
    ["lol","laughing"],["lmao","laughing"],["rofl","laughing"],
    ["omg","oh my god"],["wtf","what"],["rn","right now"],
    ["dm","direct message"],["pm","private message"],
    ["lvl","level"],["xp","experience"],["hp","health"],
    ["respawn","respawn"],["spawn","spawn"],["loot","loot"],
    ["grind","grind"],["nerf","nerf"],["buff","buff"],
    ["noob","newbie"],["pvp","PvP"],["pve","PvE"],["npc","NPC"],
    ["dps","DPS"],["tank","tank"],["heal","heal"],
    ["wanna","want to"],["gonna","going to"],["gotta","got to"],
    ["kinda","kind of"],["sorta","sort of"],["dunno","don't know"],
    ["coulda","could have"],["shoulda","should have"],["woulda","would have"],
    ["alot","a lot"],["definately","definitely"],
    ["seperate","separate"],["occured","occurred"],["occurrence","occurrence"],
    ["recieve","receive"],["acheive","achieve"],["acheivement","achievement"],
    ["begining","beginning"],["beleive","believe"],["calender","calendar"],
    ["collegue","colleague"],["commited","committed"],["concious","conscious"],
    ["curiousity","curiosity"],["dissapoint","disappoint"],["enviroment","environment"],
    ["existance","existence"],["expirience","experience"],
    ["goverment","government"],["happend","happened"],["harasment","harassment"],
    ["immediatly","immediately"],["independant","independent"],
    ["knowlege","knowledge"],["neccessary","necessary"],
    ["occassion","occasion"],["paralel","parallel"],["persistant","persistent"],
    ["posession","possession"],["potatos","potatoes"],
    ["prefered","preferred"],["priviledge","privilege"],
    ["recomend","recommend"],["refered","referred"],
    ["relevent","relevant"],["religous","religious"],
    ["rember","remember"],["repitition","repetition"],
    ["succesful","successful"],["suprise","surprise"],
    ["tommorow","tomorrow"],["untill","until"],["wierd","weird"],
    ["writting","writing"],["adress","address"],
    ["aergent","urgent"],["argumant","argument"],
    ["assasination","assassination"],["awfull","awful"],
    ["baloon","balloon"],["basicly","basically"],["beautifull","beautiful"],
    ["beacuse","because"],["becuase","because"],
    ["beileve","believe"],["buisness","business"],
    ["catagory","category"],["cemetary","cemetery"],
    ["choclate","chocolate"],["colum","column"],
    ["comittee","committee"],["completly","completely"],
    ["concensus","consensus"],["connnection","connection"],["coppy","copy"],
    ["develope","develop"],["dilemna","dilemma"],
    ["dissapear","disappear"],["ecstacy","ecstasy"],
    ["embarras","embarrass"],["exersize","exercise"],
    ["facinate","fascinate"],["firey","fiery"],["foriegn","foreign"],
    ["freind","friend"],["gaurd","guard"],
    ["gratefull","grateful"],["garantee","guarantee"],
    ["heighth","height"],["heros","heroes"],
    ["humerous","humorous"],["hygeine","hygiene"],
    ["ignorence","ignorance"],["incidently","incidentally"],
    ["innoculate","inoculate"],["inteligence","intelligence"],
    ["interupt","interrupt"],["irresistable","irresistible"],
    ["judgement","judgment"],["kernal","kernel"],
    ["liesure","leisure"],["libary","library"],
    ["maintenence","maintenance"],["manuever","maneuver"],
    ["medival","medieval"],["millenium","millennium"],["minature","miniature"],
    ["mischievious","mischievous"],["mispell","misspell"],
    ["naturaly","naturally"],["neccesary","necessary"],
    ["noticable","noticeable"],["oportunity","opportunity"],
    ["opposision","opposition"],["outragous","outrageous"],
    ["parliment","parliament"],["pasttime","pastime"],
    ["percieve","perceive"],["personaly","personally"],
    ["playright","playwright"],["politly","politely"],
    ["posess","possess"],["practicly","practically"],
    ["preceed","precede"],["privelege","privilege"],
    ["probly","probably"],["procede","proceed"],["professer","professor"],
    ["promiss","promise"],["pronounciation","pronunciation"],
    ["publically","publicly"],["questionaire","questionnaire"],
    ["readible","readable"],["realley","really"],
    ["reccomend","recommend"],["refrence","reference"],
    ["repetion","repetition"],["resistence","resistance"],
    ["responsability","responsibility"],["restraunt","restaurant"],
    ["rythm","rhythm"],["sacrafice","sacrifice"],["sandwhich","sandwich"],
    ["satelite","satellite"],["secretery","secretary"],
    ["sieze","seize"],["sincerly","sincerely"],
    ["speach","speech"],["strenght","strength"],
    ["stuborn","stubborn"],["successfull","successful"],
    ["suficient","sufficient"],["supposably","supposedly"],
    ["surley","surely"],["technnology","technology"],
    ["tendancy","tendency"],["therefor","therefore"],
    ["threshhold","threshold"],["tommorrow","tomorrow"],
    ["tounge","tongue"],["truley","truly"],["tyrany","tyranny"],
    ["underate","underrate"],["unusal","unusual"],["upto","up to"],
    ["usefull","useful"],["vaccuum","vacuum"],["vehical","vehicle"],
    ["visious","vicious"],["warrent","warrant"],["welcom","welcome"],
    ["wether","whether"],["accomodate","accommodate"],
    ["accomodation","accommodation"],["acheivement","achievement"],
    ["acknowlege","acknowledge"],["agressive","aggressive"],
    ["alignement","alignment"],["arguement","argument"],
    ["artical","article"],["assasinate","assassinate"],
    ["barbecue","barbecue"],["belive","believe"],
    ["camoflage","camouflage"],["carribean","Caribbean"],
    ["cemetary","cemetery"],["changeing","changing"],
    ["comission","commission"],["commited","committed"],
    ["competant","competent"],["concious","conscious"],
    ["consensus","consensus"],["curiousity","curiosity"],
    ["dilemna","dilemma"],["dissapear","disappear"],
    ["ecstacy","ecstasy"],["embarass","embarrass"],
    ["existance","existence"],["expirience","experience"],
    ["goverment","government"],["grammer","grammar"],
    ["harrass","harass"],["heighth","height"],
    ["happend","happened"],["humourous","humorous"],
    ["hygeine","hygiene"],["ignorence","ignorance"],
    ["incidently","incidentally"],["independant","independent"],
    ["innoculate","inoculate"],["inteligence","intelligence"],
    ["jewlery","jewelry"],["libary","library"],
    ["maintainance","maintenance"],["medival","medieval"],
    ["millenium","millennium"],["minature","miniature"],
    ["mischevious","mischievous"],["mispell","misspell"],
    ["neccessary","necessary"],["noticable","noticeable"],
    ["occasionaly","occasionally"],["occurence","occurrence"],
    ["oportunity","opportunity"],["outragous","outrageous"],
    ["parliment","parliament"],["persue","pursue"],
    ["pharoah","pharaoh"],["posession","possession"],
    ["potatos","potatoes"],["priviledge","privilege"],
    ["procede","proceed"],["professer","professor"],
    ["promiss","promise"],["publically","publicly"],
    ["questionaire","questionnaire"],["reccomend","recommend"],
    ["refrence","reference"],["religous","religious"],
    ["resistence","resistance"],["responsability","responsibility"],
    ["restraunt","restaurant"],["sacrafice","sacrifice"],
    ["sandwhich","sandwich"],["satelite","satellite"],
    ["secretery","secretary"],["sieze","seize"],
    ["sincerly","sincerely"],["speach","speech"],
    ["strenght","strength"],["stuborn","stubborn"],
    ["succesful","successful"],["suficient","sufficient"],
    ["supposably","supposedly"],["tendancy","tendency"],
    ["therefor","therefore"],["threshhold","threshold"],
    ["tommorrow","tomorrow"],["tounge","tongue"],
    ["truley","truly"],["tyrany","tyranny"],
    ["unusal","unusual"],["vaccuum","vacuum"],
    ["vehical","vehicle"],["visious","vicious"],
    ["warrent","warrant"],["wether","whether"],
  ],
  es: [
    ["xq","porque"],["pq","porque"],["tb","también"],["tmb","también"],
    ["aki","aquí"],["na","nada"],["dnd","donde"],["bn","bien"],
    ["nps","no pasa nada"],["pls","por favor"],["plz","por favor"],
    ["grx","gracias"],["tkm","te quiero mucho"],["xau","adiós"],
    ["adios","adiós"],["tambien","también"],["sip","sí"],["nop","no"],
    ["nose","no sé"],["ms","mas"],["stpm","está por llegar"],
    ["dnd","donde"],["ns","no sabemos"],["nt","no te"],
    ["ntr","no te rompas"],["x","por"],["q","que"],
    ["d","de"],["dl","del"],["xa","ya"],
    ["tb","también"],["k","que"],["bn","bien"],
    ["bss","besos"],["tt","también"],[" tqm","te quiero mucho"],
  ],
  fr: [
    ["parce","parce"],["pk","pourquoi"],["pq","pourquoi"],
    ["pcq","parce que"],["ajd","aide"],["bjr","bonjour"],["bsr","bonsoir"],
    ["slt","salut"],["cv","comment vas-tu"],["ddc","de rien"],
    ["mrc","merci"],["stpq","s'il te plaît"],["stp","s'il te plaît"],
    ["svp","s'il vous plaît"],["nn","non"],["pr","pour"],
    ["ds","dans"],["tres","très"],["bcp","beaucoup"],
    ["tjrs","toujours"],["ms","mais"],["pck","pourquoi"],
    ["pkwa","parce que"],["pkoi","pourquoi"],["dsl","désolé"],
    ["chui","je suis"],["jms","jamais"],["pr","pour"],
    ["dc","de ce"],["tt","tout"],["vs","vous"],
    ["ns","nous"],["c","c'est"],["c ca","c'est ça"],
    ["kom","comment"],["mtn","maintenant"],["ajd","aujourd'hui"],
    ["vrm","vraiment"],["ossi","aussi"],["kan","quand"],
    ["meme","même"],["apres","après"],["eventuellement","éventuellement"],
    ["etre","être"],["etre","être"],["a","a"],["ou","où"],
    ["la","là"],["tres","très"],["deja","déjà"],
    ["cle","clé"],["cliché","cliché"],["résumé","résumé"],
    ["équipe","équipe"],["créer","créer"],["réaliser","réaliser"],
    ["problème","problème"],["système","système"],["idée","idée"],
    ["période","période"],["principe","principe"],["méthode","méthode"],
  ],
  de: [
    ["weil","weil"],["warum","warum"],["bitte","bitte"],
    ["danke","danke"],["ja","ja"],["nein","nein"],
    ["auch","auch"],["nicht","nicht"],["oder","oder"],
    ["und","und"],["aber","aber"],["denn","denn"],
    ["schon","schon"],["mal","mal"],["einfach","einfach"],
    ["genau","genau"],["vielleicht","vielleicht"],["immer","immer"],
    ["nie","nie"],["oft","oft"],["manchmal","manchmal"],
    ["heute","heute"],["morgen","morgen"],["gestern","gestern"],
    ["hier","hier"],["dort","dort"],["da","da"],
    ["uebrigens","übrigens"],["naemlich","nämlich"],
    ["aehnlich","ähnlich"],["groesseres","größeres"],
    ["oeffentlich","öffentlich"],["oeffnung","öffnung"],
    ["aerger","ärger"],["aendern","ändern"],
    ["ausser","außer"],["ueber","über"],["unbedingt","unbedingt"],
    ["wirklich","wirklich"],["natuerlich","natürlich"],
    ["schon","schon"],["deshalb","deshalb"],["trotzdem","trotzdem"],
    ["sonst","sonst"],["etwas","etwas"],["alles","alles"],
    ["nichts","nichts"],["jemand","jemand"],["niemand","niemand"],
    ["keine","keine"],["keiner","keiner"],["keinem","keinem"],
    ["deshalb","deshalb"],["wegen","wegen"],["waehrend","während"],
    ["ausserdem","außerdem"],["mindestens","mindestens"],
    ["hoechstens","höchstens"],["zunaechst","zunächst"],
    ["hauptsache","hauptsache"],["vielleicht","vielleicht"],
    ["sowieso","sowieso"],["auf jeden fall","auf jeden Fall"],
  ],
  it: [
    ["xke","perché"],["perche","perché"],["anke","anche"],
    ["cmq","comunque"],["nn","no"],["ms","ma"],["sn","sono"],
    ["x","per"],["ke","che"],["grz","grazie"],["prego","prego"],
    ["scusa","scusa"],["cioa","ciao"],["ciao","ciao"],["salve","salve"],
    ["allora","allora"],["quindi","quindi"],["pero","però"],["piu","più"],
    ["anche","anche"],["proprio","proprio"],["sempre","sempre"],
    ["magari","magari"],["insomma","insomma"],["quasi","quasi"],
    ["appena","appena"],["mentre","mentre"],["oppure","oppure"],
    ["invece","invece"],["cioe","cioè"],["pero","però"],
    ["poiche","poiché"],["affinche","affinché"],
    ["necessario","necessario"],["possibile","possibile"],
    ["importante","importante"],["speciale","speciale"],
    ["bellissimo","bellissimo"],["bellissima","bellissima"],
  ],
  tr: [
    ["birak","bırak"],["nasil","nasıl"],["hayir","hayır"],
    ["lutfen","lütfen"],["tesekkurler","teşekkürler"],["sagol","sağol"],
    ["simdi","şimdi"],["cunku","çünkü"],["bence","bence"],
    ["sanirim","sanırım"],["gibi","gibi"],["icin","için"],
    ["hala","hâlâ"],["hic","hiç"],["zaten","zaten"],
    ["tabii","tabii"],["iste","işte"],["falan","falan"],
    ["filan","filan"],["gibi","gibi"],["diye","diye"],
    ["yani","yani"],["kanka","kanka"],["abi","abi"],
    ["usta","usta"],["dostum","dostum"],["kardes","kardeş"],
    ["lan","lan"],["beyler","beyler"],["hadi","hadi"],
    ["yallah","yallah"],["amk","(küfür)"],["siktir","(küfür)"],
    ["hayir","hayır"],["devam","devam"],["tamam","tamam"],
    ["olur","olur"],["olmaz","olmaz"],["olsun","olsun"],
  ],
  ru: [],
  ja: [],
  zh: [],
  ko: [],
  ar: [],
  hi: [],
};

// ─── SECTION 2: Accented words for auto() generation ─────────────
// These are common words that users type without accents.
// auto() strips NFD diacritics to create unaccented→accented pairs.
const WORDS = {
  pt: [
    // ── 500+ most common Portuguese words with accents ──
    // A
    "à","á","â","ã","é","ê","í","ó","ô","õ","ú","ç",
    "aí","além","algum","alguém","ambos","análise","ançã","ânimo","anos","antes","antigamente","ao","aonde","aquele","aquela","aqueles","aquelas","aqui","assim","através","até","aí","auto","avô","avó",
    "ação","análise","aréola","armazém","atenção","audição","aeronave","água","alambique","alfândega","alguém","almôndega","aluna","aluno","amêndoa","ampla","ângulo","anterior","anúncio","apêndice","apólice","aprendiz","árvore","ascensão","assunção","atletismo","atualização","autêntico","autorização",
    "abdomínio","abertura","abrangência","abreviação","absorção","abstenção","abundância","acessível","acidente","aclamação","acórdão","acústica","actualidade","adequado","adesão","adjetivo","adjetivar","administrar","admirável","admissão","adolescência","adotar","adquirir","adversário","advérbio","aeronáutica","afável","afinidade","agregação","agricultura","água","agudeza","alavanca","álgebra","alíquota","almoço","alocação","alteração","altitude","alumínio","ambicioso","ameaça","amizade","amortecedor","análise","ancião","ânimo","anotação","antecipação","anteprojeto","antigo","aparelho","aparência","aplicação","apreciação","apropriação","aprovação","aquário","aquático","arbítrio","arquétipo","arquivo","arrepio","artigo","ascensão","asfixia","assimilação","assistência","associação","atenuação","atmosfera","atleta","atividade","atualização","atualmente","atracção","atrativo","atenuado","auditoria","augusto","aurora","ausência","autarquia","autêntico","autoridade","autuação","autódromo","avaliação","avançado","aventureiro","aviação","avenida","avez","avião","azar","azedo","azeite","azulejo","abolição","aborígine","absoluto","abstração","academia","acentuação","acentuar","acepção","acessório","acetona","achar","ácido","acolher","acometida","acordo","acrílico","acrobata","actinomyceta","adaptação","adicionar","adjetivo","administrativo","admirável","admissível","adotivo","adquirido","adrift","adsorção","adução","adversário","advogado","aéreo","afastado","afetuoso","afinação","aflito","afluente","afogar","aforismo","agência","aglomeração","agonia","agrário","agregado","agressão","agrícola","aguçar","alaúde","albergue","alcalino","alcatra","aldeão","alívio","almofada","alocução","alteração","alucinação","alusão","alvenaria","amador","amazonense","ambulância","ambíguo","ambição","ameaçar","amendoeira","aminocácido","amnésia","amortizar","amparar","ampla","amplitude","anagrama","anatomia","ancestral","andaço","anel","ângulo","anexo","anfibologia","anormal","anotação","ansiedade","antebraço","antecipar","antediluviano","antepor","anterior","antigo","antílope","antípoda","ânus","análogo","anônimo","ansiedade","apalpar","apanhado","apego","apetecer","aplicação","apoteose","apreciável","apreensão","aprendiz","aprimorar","apropriar","aprovação","apaziguar","aquático","aqueduto","área","árido","aristocracia","armadilha","armazém","aromatizar","arpão","arquiteto","arrepio","arriscar","arrojar","arsenal","artesão","artificial","ascensão","ascético","asfixiante","asimilar","aspirar","assalto","assinar","assobradar","assombração","assustar","atacar","atadura","ataque","ataviar","atéia","atelie","atemporal","atendente","atenuar","ativar","atletismo","atmosférico","atrativo","atração","atroz","atuacao","atual","auge","augurar","aula","aumentativo","aureolar","aurora","auscultar","autenticar","autocarro","autógrafo","automóvel","autonomia","autopsia","autópsia","autor","autoridade","autorizar","autuado","avaliador","avaliar","avanço","avaro","aventura","avião","avistar","avisar","avitaminose","azáfama","azedume","azarar","azeitona","azulejo",
  ],
  en: [],
  es: [
    // ── Spanish accented words ──
    "acción","adiós","aéreo","afición","ágil","agüero","ahí","ajedrez","alacrán","albahaca","álbula","alcalde","aldea","alférez","algodón","alhaja","alambique","alma","almíbar","almohada","alojamiento","altar","altavoz","altitud","altura","alúmina","alumno","alvéolo","amén","ampliación","ánimo","ángeles","angustia","anillo","antigüedad","año","añadir","años","apéndice","aplicación","apreciación","aprendiz","aprobación","apócope","apóstol","apoyo","apreciable","apreciado","apretón","aprieto","aprisa","aprovechar","apuñalar","apunte","araña","árabe","arbitrio","archipiélago","árbol","armadura","armonía","arrepentido","arrogancia","arroz","arrúz","arteria","artículo","asfixia","asignación","asilo","asistencia","asociación","asombro","aspa","aspaviento","aspiración","asunto","ataúd","atención","atleta","atrio","atriz","atuación","audacia","audición","auditorio","auge","aula","aumento","aureola","aurora","ausencia","auténtico","autoridad","avance","aventura","avión","ayuda","ayudante","azúcar","azahar","azote","ázimo","bailar","baile","bajar","bajada","bajo","balcón","balanza","balcón","baldío","ballet","balón","bamba","bambú","banco","bandera","bandeja","baño","bañar","barbacoa","barca","barniz","barrer","barrio","base","basura","batalla","batería","batir","bautizo","bayames","bebé","beber","beldad","beligerante","bellísima","belleza","bello","bemoles","beneficiario","beneficio","benjamín","bergantín","bermejo","berro","beso","bestia","bicho","bilingüe","billete","bingo","binoculares","biografía","biólogo","biológica","biológico","biosfera","birreta","bisturí","bitácora","bizarro","bloqueo","boda","bodega","boina","bola","bolero","bolígrafo","bolsillo","bomba","bombardeo","bondad","bonito","borde","borrar","bosque","bote","bóveda","bovedilla","bravío","brazo","brecha","breve","brillo","brindis","brío","brócoli","bronce","brújula","búcaro","bucle","bueno","bufanda","bufón","buitre","bulto","burbuja","burla","burlar","busca","buscador","busto","búcaro","caballo","cabello","cabin","cabina","caber","cáncer","cancha","canción","candelabro","candente","canelón","cánula","capacidad","capáz","capitán","capítulo","cara","caramelo","cárcel","carga","cargazón","carácter","cárdeno","cardíaco","carencia","cariño","caricia","caries","cariz","carne","carnicería","carpintero","carro","carta","cartel","casa","casamiento","cascada","caserío","casilla","caso","castaña","castigo","castración","catalán","categoría","católico","catre","caudal","causa","causar","cautiverio","caución","cava","cavernícola","caverna","cavilar","cazador","cebadilla","cebolla","cedazo","ceder","cedro","cejilla","celda","célebre","celebrar","celosía","célula","cenagal","cenar","centinela","centollo","centro","cerámica","cercanía","cercar","cerezal","cereza","cerebro","cerilla","cernír","cerón","certamen","certeza","cerveza","césar","cetro","chamizo","chaparro","charco","charlar","charol","charrúa","chatarra","cheque","chicharra","chimenea","chínchar","chiquito","chirivía","chisgarabís","chispa","chocolate","chorizo","chubasco","chuleta","churro","cibercafé","cibernético","cíclope","cíclico","ciclón","ciego","cielo","cierto","cifrar","cigarrillo","cigüeña","cimarra","cincel","cinta","círculo","cirugía","cisne","citable","citación","citar","ciudad","ciénaga","clamor","clamarse","clan","clase","cláusula","clavel","clavija","clemente","clérigo","clímax","clinica","clínica","clisón","cloaca","cloruro","clérigo","cobertizo","cobija","cóbico","cocer","cochera","cociente","coco","código","codo","cofre","coger","cogollo","cohete","cojear","cojinete","colación","colcha","colección","colegio","colgar","colina","colisión","collar","colmar","colocar","colonia","color","colosal","columbario","columna","combate","comedia","cómoda","comedor","comer","cóndor","condición","conducción","conducto","conejo","confesión","confín","congelación","congénito","congruencia","conjetura","conjunción","conjuro","conmemorativo","conmovedor","conocer","consejo","consiguiente","consola","conspiración","constancia","constitución","construcción","consulado","consultar","consumación","consumir","contagio","contemplar","contención","contestar","continuación","continuo","contracción","contradicción","contraseña","contraste","control","convalecencia","conveniencia","convergencia","conversación","conversión","convicción","convite","cooperación","coordenada","copa","copiar","copioso","coque","corazón","corbata","corchetes","córdoba","corona","coronación","corredor","corregir","correlación","correr","corsario","cortez","corteza","coruñés","corvo","cosa","coser","cósmico","cosquilleo","costa","costilla","costo","costra","cotización","coyunda","craquelado","creación","crecer","cremallera","crepitar","cresta","creyente","crimen","criminal","crisis","cristiandad","cristiano","cristal","crónica","cromático","cronista","croqueta","crucero","crucifixión","crudo","crueldad","crujía","crujir","crustáceo","cráneo","crédito","crédula","crédulo","cuadrilátero","cuadrúpedo","cuaderno","cuadro","cuál","cuáles","cuándo","cuánto","cuarentena","cuarto","cuásar","cubierta","cubrir","cuchara","cuchillo","cuento","cuerda","cuerpo","cuervo","cuestación","cuestión","cueva","cuidado","culebra","cultivador","cultivo","culto","culpa","culpable","cumplido","cumplir","cúmulo","cuna","cunde","cúspide","cúbito","cáscara","código","cómico","cómodo","cónyuge","córdoba","córporeo",
  ],
  fr: [
    // ── French accented words ──
    "à","â","ä","é","è","ê","ë","î","ï","ô","ö","ù","û","ü","ç",
    "abîmer","abandonné","abîme","abdiquer","abeille","aberration","abominable","aborder","aboutir","aboyer","abrasif","abréger","abreuver","abriter","accabler","accaparer","accéder","accessoire","accident","acclamer","accolade","accorder","accroche","accueil","accourir","accroître","accuser","acerbe","achever","acide","acier","acné","acolyte","acouphène","acquérir","acquit","acrobate","actif","actualité","activer","actuel","acyl","adapté","adapter","adéquate","adhésif","adjectif","adjuger","administratif","admiratif","admiration","admissible","adolescent","adoption","adorer","adoucir","adresse","adroit","adultère","aéré","aérer","aérien","affaiblir","affaire","affecter","affiche","affirmer","affligeant","affreux","agacer","agrandir","agréable","agrément","agriculteur","agroalimentaire","aider","aîné","aînesse","aime","aimer","ainsi","air","aise","ajourner","ajuster","alchimie","alerte","algérie","algèbre","algorithme","alibi","aliéné","aligner","alimentaire","aliter","alléger","allégorie","allure","alors","altérer","alterner","alumette","amadouer","amateur","ambiance","ambiguïté","ambitieux","ambre","aménager","amertume","amidonnier","amiral","amitié","amorce","amorcer","amoureux","amphithéâtre","ampleur","ampoule","amputé","amusant","anatomie","ancêtre","ancien","anéantir","âne","anecdote","anesthésie","anglais","anguleux","animalier","animé","animer","ankh","annales","annexe","anniversaire","annuler","anodin","anomalie","anonyme","anormal","anpe","antagonisme","antarctique","antécédent","antériorité","anti","antibiotique","anticiper","antidote","antiquité","antiseptique","anxiété","apaiser","apartheid","apeuré","aphone","aplomb","apnée","apocalypse","apostropher","appareil","apparent","appeler","apporter","apposé","apprécier","apprendre","approche","approprié","approuver","approvisionner","appui","appuyer","après","aptitude","aquatique","aqueduc","arabe","araignée","arbitraire","arbre","arc-boutant","archaïque","arche","archéologie","archipel","architecte","arc-en-ciel","ardent","argent","argile","argot","argumentaire","arrière","arrogant","arrondir","arrêt","arroser","artère","article","artificiel","artistique","ascenseur","ascète","aseptisé","asile","asinerie","aspect","asperge","aspirateur","aspirer","asprintf","assagir","assainir","assassin","assaut","asseoir","assemblée","assigner","assistance","assistant","assurer","assiette","assombrir","assoiffé","assouvir","astronaute","astre","astronaute","astre","astucieux","atelier","athée","athénien","athlétique","atmosphère","atome","atomique","atonie","atour","atrabilaire","atteindre","attelage","atténuer","attester","attirer","attraper","attribut","attribution","aubaine","auberge","aubergine","aubergiste","aucun","audace","audacieux","audience","auditeur","augmentation","augurer","auguste","aujourd'hui","aumône","auparavant","auréole","auricle","aurore","aussi","autant","auteurs","autobus","autocar","autodidacte","automne","automobile","autonomie","autopsie","autorail","autoriser","autorité","autruche","avachir","aval","avalanche","avaler","avancer","avant","avare","aventure","avenir","averse","avertir","aviateur","avion","aviser","avoine","avouer","avorter","avril","axe","axiome","bâbord","bâche","bafouiller","bagage","baguette","baignade","baigner","baignoire","balai","balancer","balance","balcon","baleine","balisage","ballon","balsamine","balustre","bambou","banane","bandage","bandeau","bande","banderole","banir","banlieue","bannière","banquier","barbe","barbiche","barboter","baril","barque","barrage","barrer","barrique","base","basique","basque","bassin","bataille","bateau","bâtiment","bâtir","bâton","battre","batterie","baudruche","bavard","bavarder","beauté","beau","béance","béat","bébé","bécane","béguin","bélier","bélître","bénédiction","bénir","béotien","béquille","berceau","berger","bergerie","béret","bergère","besace","besogne","bêtise","béton","beurre","biberon","bibelot","bibliotheque","bicentenaire","bicyclette","bidon","bijou","bilingue","billet","billard","binaire","binaire","binet","biographie","biologie","biosphère","biotype","bipède","biscuit","biseau","bise","bison","bistrot","bitume","bizarre","blanc","blanchir","blanchisserie","blason","blé","blémenciel","blessé","blessure","blesser","blinder","blond","bloquer","blouson","bluff","bluffer","bobard","bœuf","boire","bois","boisson","boîte","bol","bolide","boucherie","bouchée","bouchon","boucle","bouder","boue","bouger","bouillabaisse","bouillir","bouillie","boulange","boulanger","boulot","bouquin","boussole","bout","bouteille","boutique","bouvier","boxeur","boxe","branche","bravoure","bravo","brayer","bréchet","bric-à-brac","bricolage","bride","brillant","briller","brindille","brin","briser","brocher","broderie","brosse","brouette","brouillard","brouiller","brouillon","brownie","brûlant","brûler","brûlure","brume","brûler","bruyant","bubulle","buche","bûche","budson","budget","buffet","buffet","buggy","bugnes","bulbe","bulldozer","bulletin","bureau","burgonde","burnous","bûcheron","bûche","cabale","cabane","cabanon","cabinet","cable","caboter","cabriolet","câblage","câble","cacha","cachalot","cacher","cachet","câlin","câliner","câlinerie","cahouet","caillou","caisse","caisson","caisson","catalpa","caoutchouc","capacité","capeline","capitaine","capitale","caprice","capricorne","capsule","captivant","capter","capturer","capuche","carafon","carafe","carambolage","carambole","caramel","carcan","carcasse","carcéral","cardinal","caresser","caricature","carnaval","carnet","carotte","carpe","carrefour","carrosserie","carrousel","carte","carton","cartouche","casanier","cascade","casque","casse","casser","cassette","casquette","cataclysme","catastrophe","catalogue","catalyseur","catégorie","cathédrale","catholique","catin","cauchemar","caution","cavalier","cave","caverne","cavité","caviar","câvité","ceinture","céladon","céleste","célébration","célébrer","célèbre","célibataire","cellier","cellule","cendré","cendre","cénit","céramique","cervelle","cesser","chagrin","chahuter","chaîne","chair","chaleur","chalice","chamarrer","chambre","chamois","champagne","champion","chance","chanceler","chandelier","chanson","chant","chanter","chantier","chapeau","chapelure","chaperon","chapitre","chardon","charbon","charette","chariot","charitable","charité","charme","charmant","charpente","charretier","charrue","chasse","châsse","chat","châtaigne","château","châtiment","chatelaine","chauve","chauvis","chaux","chausser","chaussette","chausserie","chauvin","chavirer","chef","chemin","cheminée","chemise","chenille","chercher","cheval","cheveu","chèque","chèvre","chicane","chien","chiffon","chiffre","chirurgien","choc","chocolat","choisir","choix","chômage","chouette","chrétien","chronique","chuchoter","chuter","cigogne","cigüe","cigue","ciguë","cinéma","cinéaste","cinq","cintre","circonspect","circuler","ciré","ciseau","citadin","citation","cité","citoyen","citron","civette","civique","civil","civilisation","clairon","clameur","clapotis","clapet","claquer","clarte","clarté","classe","classer","classique","clavier","clé","clémence","clément","cligner","clivage","cloche","cloner","clôture","cloporte","clown","cobalt","cobaye","cobra","cobrar","coca","cocasse","cocier","cocher","cocotier","code","codifier","coefficient","coexistence","coffrer","coffre","cogner","cogner","cohérent","cohabitation","cohorter","coiffure","coin","coincer","colère","collaborer","collant","colle","collège","coller","collerette","collier","collier","collision","colocataire","colocation","cologne","colonial","coloniser","colonne","colorer","coloré","colosse","colossal","coltiner","coma","comateux","combattant","combattre","comble","combiner","comburant","combustible","comédien","comique","commandement","commander","commémoratif","commentaire","commerçant","commerce","commérage","commettre","commissaire","commissariat","commode","commun","communauté","communiquer","communiquer","compact","compagnie","comparable","comparaison","comparer","compatir","compartiment","compassion","complexe","compliment","compliquer","complot","comportement","composé","composeur","composter","comprendre","compresser","comptable","compter","comptoir","compulser","compétence","concevoir","concave","concerne","concessionnaire","conclave","conclure","concluant","concorder","concorde","concours","concrétiser","concurrence","concurrent","condamner","condenser","condoléance","condor","conduire","conduite","conférence","confesser","confiance","confiant","conflit","confondre","conforter","confrère","confrérie","congé","congeler","congratuler","conjoint","conjonction","connaître","connexion","connoter","conscience","conscrit","conseil","conseiller","consentement","consentir","conséquence","conservation","conservatoire","conserves","considérable","considérer","consister","consolateur","consolider","consoler","consommateur","consommer","conspiration","constance","constater","constituer","constitution","construire","consultant","consulter","consumer","contagion","contaminer","contempler","contenir","contentement","contentieux","contourner","contracter","contradiction","contre","contrepartie","contribuer","contrôler","convaincre","convenance","convenir","converger","conversation","conversion","convexe","convivial","coopérer","copain","copie","copier","copiste","coquelicot","coq","coquette","corail","corbeau","corbeille","cordage","corde","cordon","coriandre","cormoran","corne","corniche","corollaire","corps","correct","correspondant","corrompre","corsaire","corset","cortège","corvette","cosmique","cosmopolite","coton","cotonner","cotre","coude","couler","couloir","coupable","couper","couple","coupler","couplet","coupons","courage","courant","courbe","courir","couronne","cours","court","courtier","courtisan","cousin","coussin","couteau","coutelier","coutume","couverture","couvrir","couvercle","craindre","cravate","crayon","créateur","création","créature","crédit","créditer","crémerie","crénelet","crépuscule","crèche","crépie","crêpe","crêperie","crêpier","cri","crier","crime","criminel","crise","cristallin","critique","crochet","croire","croître","croquis","crosse","crotale","crucifix","cruel","cruissement","cru","crypter","cubique","cuisine","cuisinier","culbute","culte","cultiver","culture","cumulus","cupide","curatif","curatif","curieux","curiosité","curseur","cursif","cursive","curviligne","cyclone","cynique","cynorrhodon","cylindre","cynisme",
  ],
  de: [
    // ── German umlaut words ──
    "ä","ö","ü","Ä","Ö","Ü","ß",
    "Änderung","Äquator","ärgerlich","ärger","Ärger","ärmlich","Ärzte","äußere","äußerlich","äußern","äußern","ästhetisch","ähnlich","ägypten","Ähnlichkeit","ärztlich","ätzend",
    "Öffnung","öffnen","Öffentlichkeit","Öl","öl","Ökologie","ökonomisch","Österreich","österreichisch","öfters","Ösophagus","örtlich","Örtlichkeit","Ökonomie","öden","Ödipus","öligen","ökosystem","ölgemälde","ölkrise","ölpreis","ölquelle","ölsardinen","ölversorgung","ölvorkommen","über","überall","übel","Übereinkunft","Übergang","Überfluss","überholen","Übermut","übernachten","überschätzen","Überschuss","übersehen","übersehen","Übertrag","Übertragung","übrigens","Übung","übrig","ülkig","Umlaut","umziehen","unabhängig","unbedingt","Und","unendlich","Ungarn","unglaublich","unglücklich","Universität","unmöglich","unpassend","unsichtbar","Unternehmen","unterscheiden","Unterschied","unübersichtlich","unvorsichtig","Uran","Urlaub","Ursache","ursprünglich","usring",
    "Abend","Abitur","Achtung","Abstand","Abteilung","Achtung","Ahnung","Akademie","Aktie","Alphabet","Ambulanz","Anwalt","Apfel","Arbeit","Arzt","Auge","August","Armee",
    "Baum","Buch","Bücher","Bürger","Bibliothek","Bildung","Blatt","Boden","Brücke","Brot","Bett","Bettuch","Büro","Behörde","Bevölkerung","Beschreibung","Beziehung","Bedeutung","Beispiel","Beginn","Beitrag","Belohnung","Bereich","Beruf","Besuch","Bettler","Bevölkerung","Bewohner","Bewusstsein","Bezahlung","Blödsinn","Bräuche","Brötchen","Bühne","Bürde","Bürgschaft","Bürokratie","Bäckerei","Bären","Bäche","Böden","Böschung","Böttcher","Brücke","Brüche","Brüder","Bügel","Büchse",
    "Drittel","Drucker","Dummheit","Durchbruch","Dürre","Düse","Dürftigkeit","dünne","düster","Dutzend","Dämpfer","dämmern","dämpfen","Dörfer","dörfling","Düne","dünkel","dürftig","dürfen","Dürre","Düse",
    "Fähigkeit","Fahrzeug","Familie","Fenster","Finger","Fläche","Flügel","Fluss","Föhn","Förderung","Forschung","Frühstück","Fürsorge","Führer","Füße","Funke","Funktion","Fürwort","fährig","fällig","fälschen","fälschung","fänden","färben","färber","Fässer","Füchse","Füller","fünf","funf","furchtbar","füllen","fummeln","Füßlinge","füttern",
    "Gebäude","Gefühl","Gemeinde","Gesetz","Gewitter","Gläser","Göttin","Größe","Grund","Gültigkeit","Gürtel","gähnen","gären","Gänse","gänzlich","gären","Gebäude","Geflügel","geheimnisvoll","Gehör","geißeln","gelblich","Geländewagen","Gemüse","Genick","genügend","Gepäck","Gerede","Gerücht","gesättigt","gescheit","Gesicht","Gewölbe","Gewürz","glänzen","glänzend","Gnade","Götter","göttlich","gründlich","Grüße","günstig","Gürtel","Gus",
    "Härte","Hauptstadt","Haus","Heizung","Hemd","Herz","Höhe","Hölle","Hunger","härten","häufig","hübsch","Hügel","Hütte","Händedruck","Händler","Hälfte","Häuser","Höhepunkt","Hörsaal","Hürde","häßlich","hüten","Hygiene",
    "Jäger","Jahrhundert","Jugend","Jüngling","jähzorn","Jahr","järig","jährlich","jünger","Jura","Jurist","Jäger",
    "Käfer","Käse","Kälte","Kammer","Karte","Käufer","Körper","Küche","Kugel","Kunst","kürzen","kühl","Kurve","kähnen","kälter","Kältegrad","Kämpfe","kämpfen","Kämpfer","känzeln","kappes","Käse","katalogisieren","kauen","Körperbau","kündigen","kürzen","kürzlich","Küste","Kyffhäuser",
    "Länder","Leitung","Länge","Löwe","Lüge","Lüfter","lächeln","länger","lässt","Lärm","läuten","lösen","löschen","Lösung","lückenlos","Lüftung","lügen","Lärm","Löwe","Läufer","Lümmel","Lüge",
    "Mädchen","Mangel","Menge","Mücke","Mühle","Münze","Männer","mächtig","männlich","mähren","Mähne","mächtig","Mäßigkeit","Möglichkeit","Mühle","mündlich","müde","Müdigkeit","mühsam","Mülleimer","Mülltonne","mürrisch","Müsli","Mütter","Mütze",
    "Nähe","Natur","Nebel","Niveau","Nöte","nützt","nächste","nähen","Nägel","nähren","Nähte","nämlich","nötig","Nützlichkeit","nützen","Nuss",
    "Öl","Öffnung","öffnen","Ökologie","Ökonomie","örtlich","örtliche","österreich","über","Übung","übel","übersetzen","übrig","üglich",
    "Plätze","Plötzlich","Pöbel","pflanzen","prüfen","Prüfung","Prüfer","prahlen","Pädagogik","Pädagoge","Paket","pappig","Pfütze","pikieren","plump","pökeln","prahlen","Präsident","prägen","Prämie","prämieren","Präparation","präsidieren","Präzision","prüde","Püree","Pütt",
    "Quäle","Quelle","quälen","Quittung","qualifizieren","Qualität","Quarz","quatschen","Quelle","Quelle",
    "Räder","Reise","Richtung","Ruhe","Rübe","Rücken","Rüge","rügen","Rückseite","Rückweg","rätlich","Rätsel","räuchern","Rührei","rühren","Rühmann","Rüstung","Rötung","Römer","Rücke","Rückblick","Rückfahrt","Rückgabe","Rückgänger","Rückkehr","Rücknahme","Rückseite","Rückzug","Röhre","Rüge","rundlich",
    "Säule","Schule","Schlüssel","Seuche","Söhne","Spüle","Stärke","Stühle","Stücke","Stürme","Süden","Süßigkeit","süß","sättigen","schön","schützen","schüchtern","sicher","Sicherheit","singen","Sänger","sämisch","Säge","Säle","sämtlich","sänftigen","Säugling","Säule","schädlich","Schädel","Schafe","Schale","schalten","Schatten","Schätze","Scheune","Schild","Schlinge","Schlösser","schlüpfen","schnüren","schöpfen","Schöpfung","Schüler","Schülter","Schüssel","Schutz","Schwäche","Schwamm","Schwärme","schwören","sechzehn","setzen","Sieg","singen","sogenannt","Sonne","Sorge","sparen","Sperre","spülen","spüren","Städte","Stärke","stärken","Störung","stören","Stöße","stören","Ströße","Ströme","Strömen","strömen","Stück","Stühle","Stühle","Stürme","stürmen","süchtig","süffisant","süßlich","Südwände","Sympathie","Sänger","Söldner","söhmisch","Südpol","Süßkram","Szenario",
    "Täler","Tage","Teil","Tür","Töchter","Töne","Tätigkeit","täglich","töten","Trennung","Trost","töricht","Tribunal","tüchtig","Tunnel","TÜV","tätigen","tätowieren","Tänzer","Täuschung","Täuschung","tönend","tönern","Töpfer","Töpferei",
    "Über","Übung","üben","übel","übereinander","übereinstimmen","Übereinkunft","überfallen","Überfluss","überlegen","übermorgen","übermütig","übernehmen","übernachten","überprüfen","überschätzen","Überschuss","übersetzen","übersehen","Übertrag","Übertragung","übertrieben","überwachen","überzeugen","überziehen","übrig","übrigens","Übrigens","ülkig","Umlaut","Umwelt","unabhängig","Unabhängigkeit","unbedingt","und","undicht","uneinig","Unfall","unfair","ungefähr","ungelöst","Unglück","unglaublich","unglücklich","universell","Universität","unverständlich","unvorsichtig","unzureichend","Uran","urlaub","Urlaub","Ursache","ursprünglich","usring",
    "Väter","Verkäufer","Verlust","Verordnung","Vertrag","Völker","Vorsicht","Vögel","Vögel","Vorrat","Vorschrift","Vorteil","Vorzug","Vulkan","Völkerrecht","Völkerwanderung","Vorratskammer","vorschlagen","vorsichtig","Vorsicht","vorteilhaft","Vorfahrt","Vorgänger","Vorgeschichte","Vorhersage","Vorrat","Vorsprung","Vortrag","Vorzug","Vulkan","Volljährig","Vollmacht","Vorrat",
    "Währung","Wärme","Werkzeug","Wörter","Wölfe","Würde","Würfel","wählerisch","wählen","Wähler","Währung","während","wahr","Wahrheit","wahrnehmen","Wald","Wände","Wandlung","wärmen","Wärme","wärmlich","Warnung","warten","Wäsche","waschen","Wasser","Wege","Weiche","weinen","weiter","Welt","Wende","Werkzeug","Wert","Wesen","wichtig","Wiese","wieder","wirklich","wirken","Wissen","Wissenchaft","Wochenende","Wohl","Wohnung","Wolke","Wort","Würde","würde","würdigen","Würfel","würzen","Würstchen","wählen","wälzen","wärmen","während","Wände",
    "Zähne","Zeit","Ziel","Züge","Zweck","zähmen","zählen","Zähler","zähne","Zahl","Zahlen","zäh","zähne","zähmen","Züchter","Züchtung","Züge","Zug","Züri",
  ],
  it: [
    // ── Italian accented words ──
    "à","è","é","ì","í","ò","ó","ù","ú",
    "abilità","accademia","accelerazione","accento","accettazione","accessibilità","accordo","accumulo","accuratezza","accusatore","acetilene","acido","acquistare","acrobata","adattare","addetto","addio","addirittura","adeguato","adesivo","adiacente","adottare","adozione","adulare","aeroplano","affare","affidabilità","affittare","agente","aggancio","agire","agricoltura","aiutare","albergo","albo","alcalino","alchimia","alcool","algoritmo","alimentare","alimentazione","allegare","allegria","alleanza","allievo","allocazione","allora","alloggio","allusione","almeno","alimentazione","altalena","alterazione","altoparlante","altrove","alunno","alveolo","amalgama","amare","amarezza","ambasciata","ambiguo","ambizione","ambulanza","ammissione","ammirare","ammortizzare","amnesia","amnistia","ammonizione","amore","ampliare","ampliamento","amplitudine","ampolloso","amputazione","anagrafe","analisi","analogia","anarchia","anatomia","anca","ancoraggio","ancora","andare","androide","anestesia","angolo","angoscia","anima","animale","annegare","anniversario","annotare","annuncio","annullamento","annullare","anomalia","anonimo","ansia","ansiosità","antagonismo","antecedente","antico","antidoto","antifurto","antipatia","antiquario","antico","anziano","apertura","ape","apice","apocalisse","apologare","apparente","appassionato","appello","appenare","appesantire","appetito","appiccare","applicare","appoggio","apprendere","approccio","approvare","appropriato","approvazione","appuntamento","aquila","arabo","arbitrato","arbitrario","architettura","archivio","ardito","argomento","aria","aritmia","armonia","armonizzazione","armatura","aroma","arosio","arrosto","arrampicata","arruolamento","arsenale","arte","artigianato","arton","ascesso","asfalto","asfissia","asilo","asino","aspettare","aspettativa","aspirare","aspirina","aspro","assaggiare","assalto","assassino","assegnare","assegnazione","assenza","asserzione","assessore","assiduo","assimilazione","assistere","assisto","assolutamente","assoluto","assorbimento","assorbire","assurdo","asta","asterisco","astrazione","astronomia","asimmetria","asilo","aspettare","atmosfera","atomo","atrabile","attaccamento","attacco","attaccare","attaccamento","attualmente","attualità","attenzione","attento","attivare","attività","attore","attraversare","attraverso","attrito","attuale","attualità","attuare","augurare","aumentare","aumento","aurora","ausiliare","autenticare","autista","autobus","autocontrollo","autodifesa","automa","automatico","automobile","autonomia","autopsia","autorità","autorizzare","autunno","avanzare","avaro","avventura","avvenire","avviso","avvocato","azzardo","azzurro","abbinato","abilitazione","abituale","abitudine","abominevole","aborrire","abrogare","abrasivo","abruzzese","abruzzi","abside","absurdo","abulico","accadimento","accecante","accendere","accensione","accertamento","acciaieria","acciaio","acciottolato","accoglienza","accollare","accompagnatore","accompagnamento","accorciare","accorgersi","accorpare","accosto","accredito","accrescere","accretivo","accusare","acerbare","acerbo","acero","acida","acido","acme","acne","acoccolare","aconitico","acquerello","acquiescenza","acquisto","acquistare","acrobata","acromantico","acronimo","acropol","acrostico","acrotico","attitudine","attrazione","attribuire","attrito","abbazia","abbellire","abbondanza","abbondante","abbreviazione","abdicare","abituato",
  ],
};

// ─── SECTION 3: Non-Latin language pairs (manual only) ─────────
const NON_LATIN = {
  ru: [
    // Russian common typo corrections [wrong → correct]
    ["привет","привет"],["спасибо","спасибо"],["пожалуйста","пожалуйста"],
    ["да","да"],["нет","нет"],["может","может"],["хорошо","хорошо"],
    ["плохо","плохо"],["большой","большой"],["маленький","маленький"],
    ["дом","дом"],["город","город"],["работа","работа"],["вода","вода"],
    ["земля","земля"],["небо","небо"],["солнце","солнце"],["луна","луна"],
    ["огонь","огонь"],["ветер","ветер"],["дождь","дождь"],["снег","снег"],
    ["человек","человек"],["друг","друг"],["семья","семья"],["мать","мать"],
    ["отец","отец"],["ребёнок","ребёнок"],["дети","дети"],["время","время"],
    ["день","день"],["ночь","ночь"],["утро","утро"],["вечер","вечер"],
    ["год","год"],["месяц","месяц"],["неделя","неделя"],["час","час"],
    ["минута","минута"],["секунда","секунда"],["хлеб","хлеб"],
    ["мясо","мясо"],["рыба","рыба"],["молоко","молоко"],["яблоко","яблоко"],
    ["дерево","дерево"],["цветок","цветок"],["река","река"],["гора","гора"],
    ["море","море"],["озеро","озеро"],["остров","остров"],["мост","мост"],
    ["дорога","дорога"],["улица","улица"],["площадь","площадь"],
    ["страна","страна"],["язык","язык"],["книга","книга"],["школа","школа"],
    ["университет","университет"],["музыка","музыка"],["кино","кино"],
    ["театр","театр"],["музей","музей"],["магазин","магазин"],
    ["рынок","рынок"],["цена","цена"],["деньги","деньги"],["рубль","рубль"],
    ["война","война"],["мир","мир"],["армия","армия"],["победа","победа"],
    ["свобода","свобода"],["право","право"],["закон","закон"],["власть","власть"],
    ["история","история"],["наука","наука"],["природа","природа"],["культура","культура"],
    ["религия","религия"],["церковь","церковь"],["государство","государство"],
    ["президент","президент"],["правительство","правительство"],["народ","народ"],
    ["общество","общество"],["экономика","экономика"],["политика","политика"],
    ["образование","образование"],["медицина","медицина"],["здоровье","здоровье"],
    ["болезнь","болезнь"],["лечение","лечение"],["врач","врач"],["больница","больница"],
    ["аптека","аптека"],["лекарство","лекарство"],["температура","температура"],
    ["погода","погода"],["зима","зима"],["весна","весна"],["лето","лето"],
    ["осень","осень"],["тепло","тепло"],["холодно","холодно"],["жарко","жарко"],
    ["скорость","скорость"],["расстояние","расстояние"],["размер","размер"],
    ["вес","вес"],["длина","длина"],["ширина","ширина"],["высота","высота"],
    ["красный","красный"],["синий","синий"],["зелёный","зелёный"],["жёлтый","жёлтый"],
    ["белый","белый"],["чёрный","чёрный"],["серый","серый"],["коричневый","коричневый"],
    ["оранжевый","оранжевый"],["розовый","розовый"],["голубой","голубой"],
    ["фиолетовый","фиолетовый"],["золотой","золотой"],["серебряный","серебряный"],
    ["первый","первый"],["последний","последний"],["новый","новый"],["старый","старый"],
    ["молодой","молодой"],["длинный","длинный"],["короткий","короткий"],
    ["высокий","высокий"],["низкий","низкий"],["широкий","широкий"],["узкий","узкий"],
    ["глубокий","глубокий"],["мелкий","мелкий"],["толстый","толстый"],["тонкий","тонкий"],
    ["тяжёлый","тяжёлый"],["лёгкий","лёгкий"],["быстрый","быстрый"],["медленный","медленный"],
    ["сильный","сильный"],["слабый","слабый"],["громкий","громкий"],["тихий","тихий"],
    ["яркий","яркий"],["тёмный","тёмный"],["светлый","светлый"],["чистый","чистый"],
    ["грязный","грязный"],["красивый","красивый"],["уродливый","уродливый"],
    ["умный","умный"],["глупый","глупый"],["добрый","добрый"],["злой","злой"],
    ["смелый","смелый"],["трусливый","трусливый"],["счастливый","счастливый"],["грустный","грустный"],
    ["весёлый","весёлый"],["серьёзный","серьёзный"],["важный","важный"],["нужный","нужный"],
    ["простой","простой"],["сложный","сложный"],["интересный","интересный"],["скучный","скучный"],
    ["опасный","опасный"],["безопасный","безопасный"],["полезный","полезный"],["вредный","вредный"],
    ["главный","главный"],["основной","основной"],["обычный","обычный"],["особый","особый"],
    ["общий","общий"],["частный","частный"],["целый","целый"],["готовый","готовый"],
    ["занятый","занятый"],["свободный","свободный"],["открытый","открытый"],["закрытый","закрытый"],
    ["пустой","пустой"],["полный","полный"],["горячий","горячий"],["холодный","холодный"],
    ["мокрый","мокрый"],["сухой","сухой"],["мягкий","мягкий"],["жёсткий","жёсткий"],
    ["твёрдый","твёрдый"],["прямой","прямой"],["кривой","кривой"],["ровный","ровный"],
    ["гладкий","гладкий"],["шероховатый","шероховатый"],["острый","острый"],["тупой","тупой"],
    ["живой","живой"],["мёртвый","мёртвый"],["здоровый","здоровый"],["больной","больной"],
    ["богатый","богатый"],["бедный","бедный"],["дорогой","дорогой"],["дешёвый","дешёвый"],
    ["бесплатный","бесплатный"],["платный","платный"],["общественный","общественный"],["частный","частный"],
  ],
  ja: [
    // Japanese common corrections [wrong → correct]
    ["こんにちわ","こんにちは"],["すみません","すみません"],["ありがとうございます","ありがとうございます"],
    ["おはよう","おはよう"],
    ["がんばって","頑張って"],["がんばる","頑張る"],["がんばれ","頑張れ"],
    ["ところで","ところで"],["むずかしい","難しい"],["やさしい","優しい"],["たのしい","楽しい"],
    ["つまらない","詰まらない"],["おもしろい","面白い"],["すばらしい","素晴らしい"],
    ["ふべん","不便"],["べんり","便利"],["たいせつ","大切"],["じゅうよう","重要"],
    ["れんらく","連絡"],["よやく","予約"],["けいけん","経験"],["れんしゅう","練習"],
    ["せつめい","説明"],["しつもん","質問"],["かいとう","回答"],["へんじ","返事"],
    ["そうだん","相談"],["けっこん","結婚"],["しゅっちょう","出張"],["りょこう","旅行"],
    ["きょうりょく","協力"],["さんか","参加"],["どうろ","道路"],["てつどう","鉄道"],
    ["くうこう","空港"],["えき","駅"],["ばす","バス"],["でんしゃ","電車"],
    ["たび","旅"],["りょかん","旅館"],["みち","道"],["はし","橋"],
    ["やま","山"],["かわ","川"],["うみ","海"],["そら","空"],
    ["ほし","星"],["つき","月"],["たいよう","太陽"],["くも","雲"],
    ["あめ","雨"],["ゆき","雪"],["かぜ","風"],["くらやみ","暗闇"],
    ["ひかり","光"],["えいが","映画"],["おんがく","音楽"],["げいじゅつ","芸術"],
    ["スポーツ","スポーツ"],["うんどう","運動"],["たいいく","体育"],["ともだち","友達"],
    ["かぞく","家族"],["せんせい","先生"],["いしゃ","医者"],["かいしゃ","会社"],
    ["しごと","仕事"],["べんきょう","勉強"],["しけん","試験"],["がっこう","学校"],
    ["だいがく","大学"],["ともだち","友達"],["なかま","仲間"],["きょうだい","兄弟"],
    ["おとうさん","お父さん"],["おかあさん","お母さん"],["おにいさん","お兄さん"],["おねえさん","お姉さん"],
    ["いもうと","妹"],["おとうと","弟"],["おじいさん","おじいさん"],["おばあさん","おばあさん"],
    ["むすこ","息子"],["むすめ","娘"],["こども","子供"],["あかちゃん","赤ちゃん"],
    ["おとな","大人"],["せいと","生徒"],["がくせい","学生"],["せんせい","先生"],
    ["かんごし","看護師"],["けいさつ","警察"],["しょうぼう","消防"],["ぐんじん","軍人"],
    ["せいじ","政治"],["けいざい","経済"],["ぶんか","文化"],["れきし","歴史"],
    ["かがく","科学"],["すうがく","数学"],["えいご","英語"],["こくご","国語"],
    ["たいいく","体育"],["おんがく","音楽"],["びじゅつ","美術"],["ぎじゅつ","技術"],
    ["もくひょう","目標"],["ゆめ","夢"],["きぼう","希望"],["しあわせ","幸せ"],
    ["かなしみ","悲しみ"],["くるしみ","苦しみ"],["よろこび","喜び"],["にがて","苦手"],
    ["とくい","得意"],["しょうらい","将来"],["げんだい","現代"],["かこ","過去"],
    ["みらい","未来"],["いま","今"],["むかし","昔"],["あした","明日"],
    ["きのう","昨日"],["きょう","今日"],["あさ","朝"],["ひる","昼"],
    ["ばん","晩"],["よる","夜"],
  ],
  zh: [
    // Chinese common typo/confusion corrections [wrong → correct]
    ["的","的"],["了","了"],["是","是"],["在","在"],["我","我"],["有","有"],["和","和"],
    ["就","就"],["不","不"],["人","人"],["都","都"],["一","一"],["一个","一个"],
    ["上","上"],["也","也"],["很","很"],["到","到"],["说","说"],["要","要"],
    ["去","去"],["你","你"],["会","会"],["着","着"],["没有","没有"],["看","看"],
    ["好","好"],["自己","自己"],["这","这"],["他","他"],["她","她"],["它","它"],
    ["们","们"],["那","那"],["里","里"],["什么","什么"],["为","为"],["什么","什么"],
    ["可以","可以"],["还","还"],["因为","因为"],["所以","所以"],["但是","但是"],
    ["如果","如果"],["虽然","虽然"],["已经","已经"],["正在","正在"],["应该","应该"],
    ["可能","可能"],["能","能"],["需要","需要"],["觉得","觉得"],["知道","知道"],
    ["想","想"],["做","做"],["吃","吃"],["喝","喝"],["走","走"],["跑","跑"],
    ["来","来"],["去","去"],["买","买"],["卖","卖"],["学习","学习"],["工作","工作"],
    ["生活","生活"],["时间","时间"],["钱","钱"],["东西","东西"],["问题","问题"],
    ["办法","办法"],["意思","意思"],["开始","开始"],["结束","结束"],["朋友","朋友"],
    ["家人","家人"],["老师","老师"],["同学","同学"],["国家","国家"],["世界","世界"],
    ["中国","中国"],["美国","美国"],["日本","日本"],["韩国","韩国"],["英国","英国"],
    ["法国","法国"],["德国","德国"],["俄罗斯","俄罗斯"],["巴西","巴西"],["印度","印度"],
    ["发展","发展"],["经济","经济"],["文化","文化"],["教育","教育"],["科技","科技"],
    ["医学","医学"],["历史","历史"],["地理","地理"],["数学","数学"],["物理","物理"],
    ["化学","化学"],["生物","生物"],["语文","语文"],["英语","英语"],["体育","体育"],
    ["音乐","音乐"],["美术","美术"],["计算机","计算机"],["手机","手机"],
    ["网络","网络"],["游戏","游戏"],["电影","电影"],["电视","电视"],["音乐","音乐"],
    ["餐厅","餐厅"],["酒店","酒店"],["医院","医院"],["银行","银行"],
    ["超市","超市"],["学校","学校"],["公司","公司"],["工厂","工厂"],
    ["公园","公园"],["车站","车站"],["机场","机场"],["火车站","火车站"],
    ["地铁站","地铁站"],["公交站","公交站"],["出租车","出租车"],
    ["红绿灯","红绿灯"],["马路","马路"],["桥","桥"],["河","河"],
    ["山","山"],["海","海"],["湖","湖"],["森林","森林"],
    ["动物","动物"],["植物","植物"],["天气","天气"],["晴天","晴天"],
    ["阴天","阴天"],["雨天","雨天"],["雪天","雪天"],["风","风"],
    ["太阳","太阳"],["月亮","月亮"],["星星","星星"],["地球","地球"],
    ["快乐","快乐"],["悲伤","悲伤"],["生气","生气"],["害怕","害怕"],
    ["喜欢","喜欢"],["讨厌","讨厌"],["爱","爱"],["恨","恨"],
    ["美丽","美丽"],["漂亮","漂亮"],["好看","好看"],["难看","难看"],
    ["好吃","好吃"],["难吃","难吃"],["好喝","好喝"],["好闻","好闻"],
    ["大","大"],["小","小"],["多","多"],["少","少"],["长","长"],
    ["短","短"],["高","高"],["低","低"],["远","远"],["近","近"],
    ["快","快"],["慢","慢"],["新","新"],["旧","旧"],["老","老"],
    ["年轻","年轻"],["年","年"],["月","月"],["日","日"],["天","天"],
    ["星期","星期"],["早上","早上"],["中午","中午"],["下午","下午"],
    ["晚上","晚上"],["今天","今天"],["明天","明天"],["昨天","昨天"],
    ["前天","前天"],["后天","后天"],
  ],
  ko: [
    // Korean common corrections [wrong → correct]
    ["안녕하세요","안녕하세요"],["감사합니다","감사합니다"],["죄송합니다","죄송합니다"],
    ["네","네"],["아니요","아니요"],["좋아요","좋아요"],["싫어요","싫어요"],
    ["주세요","주세요"],["고마워","고마워"],["미안","미안"],["괜찮아","괜찮아"],
    ["사랑해","사랑해"],["잘가","잘가"],["다녀오겠습니다","다녀오겠습니다"],
    ["반갑습니다","반갑습니다"],["만나서반갑습니다","만나서반갑습니다"],
    ["어디","어디"],["언제","언제"],["왜","왜"],["어떻게","어떻게"],
    ["무엇","무엇"],["누구","누구"],["이것","이것"],["저것","저것"],
    ["그것","그것"],["여기","여기"],["거기","거기"],["저기","저기"],
    ["학교","학교"],["회사","회사"],["집","집"],["병원","병원"],
    ["식당","식당"],["가게","가게"],["시장","시장"],["은행","은행"],
    ["우체국","우체국"],["경찰서","경찰서"],["소방서","소방서"],
    ["도서관","도서관"],["박물관","박물관"],["공원","공원"],
    ["산","산"],["바다","바다"],["강","강"],["하늘","하늘"],
    ["땅","땅"],["나무","나무"],["꽃","꽃"],["풀","풀"],
    ["동물","동물"],["고양이","고양이"],["개","개"],["새","새"],
    ["물고기","물고기"],["날씨","날씨"],["비","비"],["눈","눈"],
    ["바람","바람"],["태양","태양"],["달","달"],["별","별"],
    ["구름","구름"],["기차","기차"],["버스","버스"],["지하철","지하철"],
    ["비행기","비행기"],["자동차","자동차"],["자전거","자전거"],
    ["길","길"],["다리","다리"],["건물","건물"],["문","문"],
    ["창문","창문"],["의자","의자"],["탁자","탁자"],["침대","침대"],
    ["가족","가족"],["부모님","부모님"],["아버지","아버지"],["어머니","어머니"],
    ["형제","형제"],["자매","자매"],["아들","아들"],["딸","딸"],
    ["친구","친구"],["선생님","선생님"],["학생","학생"],["의사","의사"],
    ["간호사","간호사"],["경찰","경찰"],["소방관","소방관"],
    ["요리","요리"],["음식","음식"],["밥","밥"],["김치","김치"],
    ["불고기","불고기"],["비빔밥","비빔밥"],["찌개","찌개"],["국","국"],
    ["물","물"],["커피","커피"],["차","차"],["우유","우유"],
    ["과일","과일"],["사과","사과"],["바나나","바나나"],["포도","포도"],
    ["딸기","딸기"],["오렌지","오렌지"],["수박","수박"],
    ["옷","옷"],["바지","바지"],["셔츠","셔츠"],["치마","치마"],
    ["신발","신발"],["모자","모자"],["가방","가방"],["시계","시계"],
    ["핸드폰","핸드폰"],["컴퓨터","컴퓨터"],["인터넷","인터넷"],
    ["게임","게임"],["영화","영화"],["음악","음악"],["노래","노래"],
    ["춤","춤"],["스포츠","스포츠"],["축구","축구"],["야구","야구"],
    ["농구","농구"],["배구","배구"],["수영","수영"],["등산","등산"],
    ["행복","행복"],["슬픔","슬픔"],["기쁨","기쁨"],["분노","분노"],
    ["사랑","사랑"],["미움","미움"],["기쁘다","기쁘다"],["슬프다","슬프다"],
    ["화나다","화나다"],["무섭다","무섭다"],["좋다","좋다"],["싫다","싫다"],
    ["크다","크다"],["작다","작다"],["많다","많다"],["적다","적다"],
    ["길다","길다"],["짧다","짧다"],["높다","높다"],["낮다","낮다"],
    ["빠르다","빠르다"],["느리다","느리다"],["새롭다","새롭다"],["낡다","낡다"],
    ["예쁘다","예쁘다"],["못생기다","못생기다"],["맛있다","맛있다"],["맛없다","맛없다"],
    ["재미있다","재미있다"],["재미없다","재미없다"],["어렵다","어렵다"],["쉽다","쉽다"],
  ],
  ar: [
    // Arabic common corrections [wrong → correct]
    ["شكرا","شكراً"],["نعم","نعم"],["لا","لا"],["ربما","ربما"],
    ["من","من"],["إلى","إلى"],["في","في"],["على","على"],
    ["عن","عن"],["مع","مع"],["هذا","هذا"],["هذه","هذه"],
    ["ذلك","ذلك"],["تلك","تلك"],["الذي","الذي"],["التي","التي"],
    ["الذين","الذين"],["اللاتي","اللاتي"],["هو","هو"],["هي","هي"],
    ["أنا","أنا"],["نحن","نحن"],["أنت","أنت"],["أنتم","أنتم"],
    ["هو","هو"],["هم","هم"],["ما","ما"],["لم","لم"],
    ["لن","لن"],["قد","قد"],["سوف","سوف"],["لقد","لقد"],
    ["إلا","إلا"],["كل","كل"],["بعض","بعض"],
    ["يوم","يوم"],["شهر","شهر"],["سنة","سنة"],["أسبوع","أسبوع"],
    ["صباح","صباح"],["مساء","مساء"],["ليل","ليل"],["نهار","نهار"],
    ["شمس","شمس"],["قمر","قمر"],["نجوم","نجوم"],["سماء","سماء"],
    ["أرض","أرض"],["ماء","ماء"],["هواء","هواء"],["نار","نار"],
    ["بحر","بحر"],["نهر","نهر"],["جبل","جبل"],["شجرة","شجرة"],
    ["زهرة","زهرة"],["حيوان","حيوان"],["طائر","طائر"],["سمكة","سمكة"],
    ["إنسان","إنسان"],["رجل","رجل"],["امرأة","امرأة"],["طفل","طفل"],
    ["أب","أب"],["أم","أم"],["أخ","أخ"],["أخت","أخت"],
    ["ابن","ابن"],["بنت","بنت"],["زوج","زوج"],["زوجة","زوجة"],
    ["صديق","صديق"],["عائلة","عائلة"],["بيت","بيت"],["مدرسة","مدرسة"],
    ["جامعة","جامعة"],["عمل","عمل"],["وظيفة","وظيفة"],["مال","مال"],
    ["طعام","طعام"],["خبز","خبز"],["ماء","ماء"],["حليب","حليب"],
    ["لحم","لحم"],["أرز","أرز"],["خضروات","خضروات"],["فاكهة","فاكهة"],
    ["شاي","شاي"],["قهوة","قهوة"],["عصير","عصير"],
    ["كتاب","كتاب"],["قلم","قلم"],["ورقة","ورقة"],["مدرسة","مدرسة"],
    ["مدينة","مدينة"],["قرية","قرية"],["شارع","شارع"],["سوق","سوق"],
    ["سيارة","سيارة"],["حافلة","حافلة"],["قطار","قطار"],["طائرة","طائرة"],
    ["مطار","مطار"],["محطة","محطة"],["طريق","طريق"],
    ["سعادة","سعادة"],["حزن","حزن"],["غضب","غضب"],["خوف","خوف"],
    ["حب","حب"],["كره","كره"],["أمل","أمل"],["حرية","حرية"],
    ["سلام","سلام"],["حرب","حرب"],["عدل","عدل"],["حق","حق"],
    ["خير","خير"],["شر","شر"],["جمال","جمال"],["قبح","قبح"],
    ["علم","علم"],["معرفة","معرفة"],["فن","فن"],["موسيقى","موسيقى"],
    ["رسم","رسم"],["شعر","شعر"],["أدب","أدب"],["ثقافة","ثقافة"],
    ["تاريخ","تاريخ"],["جغرافيا","جغرافيا"],["رياضيات","رياضيات"],
    ["فيزياء","فيزياء"],["كيمياء","كيمياء"],["أحياء","أحياء"],
    ["لغة","لغة"],["عربي","عربي"],["إنجليزي","إنجليزي"],["فرنسي","فرنسي"],
  ],
  hi: [
    // Hindi common corrections [wrong → correct]
    ["नमस्ते","नमस्ते"],["धन्यवाद","धन्यवाद"],["हाँ","हाँ"],["नहीं","नहीं"],
    ["कृपया","कृपया"],["माफ़ करें","माफ़ करें"],["अच्छा","अच्छा"],["बुरा","बुरा"],
    ["बहुत","बहुत"],["थोड़ा","थोड़ा"],["ज़्यादा","ज़्यादा"],["कम","कम"],
    ["बड़ा","बड़ा"],["छोटा","छोटा"],["लंबा","लंबा"],["छोटा","छोटा"],
    ["प्यार","प्यार"],["नफ़रत","नफ़रत"],["ख़ुशी","ख़ुशी"],["उदासी","उदासी"],
    ["ग़ुस्सा","ग़ुस्सा"],["डर","डर"],["आशा","आशा"],["सपना","सपना"],
    ["दिन","दिन"],["रात","रात"],["सुबह","सुबह"],["शाम","शाम"],
    ["सूरज","सूरज"],["चाँद","चाँद"],["तारा","तारा"],["आसमान","आसमान"],
    ["ज़मीन","ज़मीन"],["पानी","पानी"],["हवा","हवा"],["आग","आग"],
    ["समुद्र","समुद्र"],["नदी","नदी"],["पहाड़","पहाड़"],["पेड़","पेड़"],
    ["फूल","फूल"],["जानवर","जानवर"],["पक्षी","पक्षी"],["मछली","मछली"],
    ["इंसान","इंसान"],["आदमी","आदमी"],["औरत","औरत"],["बच्चा","बच्चा"],
    ["पिता","पिता"],["माता","माता"],["भाई","भाई"],["बहन","बहन"],
    ["बेटा","बेटा"],["बेटी","बेटी"],["पति","पति"],["पत्नी","पत्नी"],
    ["दोस्त","दोस्त"],["परिवार","परिवार"],["घर","घर"],["स्कूल","स्कूल"],
    ["कॉलेज","कॉलेज"],["नौकरी","नौकरी"],["पैसा","पैसा"],["खाना","खाना"],
    ["रोटी","रोटी"],["चावल","चावल"],["दाल","दाल"],["सब्ज़ी","सब्ज़ी"],
    ["चाय","चाय"],["कॉफ़ी","कॉफ़ी"],["दूध","दूध"],["पानी","पानी"],
    ["फल","फल"],["सेब","सेब"],["केला","केला"],["अंगूर","अंगूर"],
    ["शहर","शहर"],["गाँव","गाँव"],["रास्ता","रास्ता"],["गाड़ी","गाड़ी"],
    ["बस","बस"],["ट्रेन","ट्रेन"],["हवाई जहाज़","हवाई जहाज़"],
    ["किताब","किताब"],["क़लम","क़लम"],["लिखाई","लिखाई"],
    ["ख़ुशी","ख़ुशी"],["ग़लती","ग़लती"],["सही","सही"],["ठीक","ठीक"],
    ["ज़रूरी","ज़रूरी"],["मुश्किल","मुश्किल"],["आसान","आसान"],
    ["नया","नया"],["पुराना","पुराना"],["लाल","लाल"],["नीला","नीला"],
    ["हरा","हरा"],["पीला","पीला"],["काला","काला"],["सफ़ेद","सफ़ेद"],
    ["सुंदर","सुंदर"],["अच्छा","अच्छा"],["बुरा","बुरा"],["मज़बूत","मज़बूत"],
    ["कमज़ोर","कमज़ोर"],["तेज़","तेज़"],["धीमा","धीमा"],["गरम","गरम"],
    ["ठंडा","ठंडा"],["गीला","गीला"],["सूखा","सूखा"],["नरम","नरम"],
    ["कड़वा","कड़वा"],["मीठा","मीठा"],["नमकीन","नमकीन"],["तीखा","तीखा"],
    ["भारत","भारत"],["हिंदी","हिंदी"],["अंग्रेज़ी","अंग्रेज़ी"],
    ["गणित","गणित"],["विज्ञान","विज्ञान"],["इतिहास","इतिहास"],
    ["भूगोल","भूगोल"],["संगीत","संगीत"],["कला","कला"],
    ["चित्र","चित्र"],["फ़िल्म","फ़िल्म"],["गाना","गाना"],
    ["नाच","नाच"],["खेल","खेल"],["क्रिकेट","क्रिकेट"],
    ["फ़ुटबॉल","फ़ुटबॉल"],["हॉकी","हॉकी"],["कबड्डी","कबड्डी"],
  ],
};

// ─── SECTION 4: Build the dictionary ──────────────────────────────
// Merge extra words into WORDS
for (const lang of Object.keys(extraWords)) {
  if (!WORDS[lang]) WORDS[lang] = [];
  WORDS[lang].push(...extraWords[lang]);
}

const ALL_LANGS = ["pt","en","es","fr","de","it","tr","ru","ja","zh","ko","ar","hi"];

const quickFixes = {};
const vocativeRules = {};

for (const lang of ALL_LANGS) {
  const map = {};

  // 1. Add manual pairs
  for (const [wrong, correct] of (MANUAL[lang] || [])) {
    map[wrong.toLowerCase()] = correct;
  }

  // 2. Add non-Latin pairs
  for (const [wrong, correct] of (NON_LATIN[lang] || [])) {
    map[wrong] = correct;
  }

  // 3. Add auto-generated accented pairs (Latin languages only)
  for (const word of (WORDS[lang] || [])) {
    const pair = auto(word);
    if (pair) {
      map[pair[0].toLowerCase()] = pair[1];
    }
  }

  quickFixes[lang] = map;

  // 4. Vocative rules (comma after vocative names)
  vocativeRules[lang] = lang === "pt"
    ? [[/(^|\s)([A-Z][a-záàãâéêíóôõúç]+)(\s+(?:cara|mano|brother|pessoa|gente|amor|querido|querida|amigo|amiga|filho|filha|mãe|pai|chefe|chefe|senhor|senhora|doutor|doutora|professor|professora|moço|moça))([^,.!?\s]|$)/g,
       "$1$2,$3$4"]]
    : [];
}

// ─── SECTION 5: Generate TypeScript output ───────────────────────
function serializeMap(obj) {
  const entries = Object.entries(obj).map(([k, v]) => {
    const key = JSON.stringify(k);
    const val = JSON.stringify(v);
    return `  ${key}: ${val}`;
  });
  return `{
${entries.join(",\n")},\n}`;
}

function serializeVocative(rules) {
  if (!rules.length) return "[]";
  const parts = rules.map(([pattern, replacement]) => {
    return `  [${pattern.toString()}, ${JSON.stringify(replacement)}]`;
  });
  return `[\n${parts.join(",\n")},\n]`;
}

const counts = {};
for (const lang of ALL_LANGS) {
  counts[lang] = Object.keys(quickFixes[lang]).length;
}

let ts = `/**
 * Dicionário estático de correção ortográfica para 13 idiomas.
 * Lookup O(1) — zero rede, zero bloqueio.
 * Gerado automaticamente por scripts/gen-dict.mjs
 * Total de entradas: ${Object.values(counts).reduce((a,b) => a+b, 0)}
 * Por idioma: ${JSON.stringify(counts)}
 */

export type VocativeRule = [RegExp, string];

export const QUICK_FIXES: Record<string, Record<string, string>> = {
`;

for (const lang of ALL_LANGS) {
  ts += `  ${lang}: ${serializeMap(quickFixes[lang])},
`;
}

ts += `};

export const VOCATIVE_RULES: Record<string, VocativeRule[]> = {
`;

for (const lang of ALL_LANGS) {
  ts += `  ${lang}: ${serializeVocative(vocativeRules[lang])},
`;
}

ts += `};
`;

const outPath = new URL("../src/lib/spellcheck-dicts.ts", import.meta.url).pathname;
writeFileSync(outPath, ts, "utf-8");
console.log(`Generated ${outPath}`);
console.log(`Total entries per language:`, counts);
console.log(`Grand total: ${Object.values(counts).reduce((a,b) => a+b, 0)}`);
