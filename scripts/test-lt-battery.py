#!/usr/bin/env python3
"""
Bateria de teste: 10.000 frases com erros comuns de internet em PT-BR.
Testa LanguageTool para ver o que ele detecta e o que ele erra.

Categorias de erro:
1. Sem acento (voce, nao, tambem, ja, so, ate, etc.)
2. Abreviações (vc, tbm, pq, kd, blz, td, n, etc.)
3. Erros de digitação comuns (letras trocadas, duplicadas)
4. Erros gramaticais (a/à, mal/mau, mas/mais, onde/aonde, etc.)
5. Falta de vírgula
6. Erros de concordância
7. Slang/gíria internet (kkkk, vlw, flw, etc.) - NÃO devem ser corrigidos
"""

import urllib.request
import urllib.parse
import json
import time
import random
import itertools
import sys
from collections import defaultdict

LT_API = "https://api.languagetool.org/v2/check"

def check_lt(text):
    """Chama LT API e retorna os matches."""
    data = urllib.parse.urlencode({
        "text": text,
        "language": "pt-BR",
        "enabledOnly": "false"
    }).encode()
    req = urllib.request.Request(LT_API, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode())
    except Exception as e:
        return {"matches": [], "error": str(e)}

# ============================================================
# TEMPLATES DE FRASES CORRETAS
# ============================================================

correct_sentences = {
    # --- Categoria 1: Frases com palavras acentuadas ---
    "acentos_simples": [
        "Você vai ao mercado hoje?",
        "Eu também quero ir.",
        "Não sei se ele já chegou.",
        "Está muito quente aqui.",
        "Ele está sozinho em casa.",
        "Até amanhã meu amigo.",
        "Ninguém sabe onde ela está.",
        "Alguém pode me ajudar?",
        "Porém não consigo fazer isso.",
        "O café está pronto.",
        "Eu sou brasileiro.",
        "A família é muito importante.",
        "Preciso de informação.",
        "Isso é possível?",
        "Ele tem três irmãos.",
        "Vou até a praia.",
        "Amanhã eu acordo cedo.",
        "Meu número é esse.",
        "Ela é muito simpática.",
        "O óculos ficou em casa.",
        "Eu posso explicar.",
        "Não esqueça de comprar pão.",
        "Ele também gosta de café.",
        "Só eu sei a resposta.",
    ],

    # --- Categoria 2: Frases com gramática ---
    "gramatica": [
        "Eu fui ao mercado comprar pão.",
        "Ela chegou à escola atrasada.",
        "Onde você mora?",
        "Aonde você vai?",
        "Ele fez muito bem na prova.",
        "Mal sabia que seria tão difícil.",
        "Eu mais ela fomos ao cinema.",
        "Mas ele não quis ir.",
        "Temos que resolver isso rápido.",
        "Você tem que estudar mais.",
        "Há muitos dias que não o vejo.",
        "Eles foram a pé até o centro.",
        "A gente vai sair hoje.",
        "O menino comeu todo o bolo.",
        "Eles estão muito cansados.",
        "Faz anos que não a vejo.",
        "Houveram muitos problemas.",
        "É necessário ter paciência.",
        "Obrigado pela ajuda.",
        "De nada, estou aqui pra isso.",
    ],

    # --- Categoria 3: Frases com palavras comuns ---
    "comum": [
        "O supermercado tá longe daqui.",
        "Vou comer arroz com feijão.",
        "A menina está brincando no parque.",
        "Meu celular descarregou de novo.",
        "Preciso ir no banco hoje.",
        "O ônibus passou sem parar.",
        "Vou jogar bola com os amigos.",
        "A internet tá muito lenta.",
        "Gostaria de comprar uma água.",
        "O preço tá muito caro.",
        "Preciso trabalhar amanhã.",
        "Vou dormir tarde hoje.",
        "A comida estava gostosa.",
        "Quero ver esse filme novo.",
        "Ela é minha amiga de infância.",
        "O carro precisa de conserto.",
        "Vou passar na farmácia depois.",
        "A prova foi muito difícil.",
        "Preciso falar com meu professor.",
        "O jogo começa às oito horas.",
    ],
    # --- Categoria 4: Frases curtas tipo chat ---
    "chat_curto": [
        "bom dia pessoal",
        "boa noite galera",
        "alguém ai?",
        "quem quer jogar?",
        "to online agora",
        "vou logar agora",
        "quem tem o item?",
        "preciso de ajuda",
        "alguém vende espada?",
        "quanto custa isso?",
        "aceita troca?",
        "tá muito caro",
        "vou passar lá",
        "espera ai",
        "não consigo fazer",
        "como funciona isso?",
        "alguém sabe como?",
        "obrigado pela ajuda",
        "de nada",
        "qual seu nome?",
        "add eu ai",
        "manda msg no pv",
        "quero comprar",
        "tem pra vender?",
    ],
}

# ============================================================
# FUNÇÕES DE INTRODUZIR ERROS
# ============================================================

def remove_accents(text):
    """Remove acentos de um texto."""
    import unicodedata
    nfkd = unicodedata.normalize('NFKD', text)
    return ''.join(c for c in nfkd if not unicodedata.combining(c))

# Mapa de abreviações comuns de internet
ABBREVS = {
    "você": "vc",
    "também": "tbm",
    "porque": "pq",
    "cadê": "kd",
    "tudo": "td",
    "beleza": "blz",
    "comigo": "cmg",
    "número": "nmr",
    "falar": "flr",
    "nenhum": "nhm",
    "coisa": "cisa",
    "gente": "gt",
    "pessoas": "pessoas",  # não abrevia
}

def apply_internet_errors(text):
    """Aplica erros comuns de internet a uma frase correta."""
    result = text
    error_types = []

    # 1. Abreviações aleatórias
    for correct, abbrev in ABBREVS.items():
        if random.random() < 0.3:  # 30% chance por palavra
            if correct in result.lower():
                # Preservar maiúsculas
                for match in find_word(result, correct):
                    result = result[:match[0]] + abbrev + result[match[1]:]
                    error_types.append(f"abbrev:{correct}->{abbrev}")
                    break

    # 2. Remover acentos aleatoriamente
    accent_words = ["você", "também", "não", "já", "só", "até", "está", "número",
                    "ninguém", "alguém", "porém", "irá", "pode", "trás",
                    "três", "sério", "dúvida", "saúde", "rápido", "necessário",
                    "informação", "posição", "possível", "experiência", "diferença"]
    if random.random() < 0.5:  # 50% chance
        for word in accent_words:
            if word in result.lower() and random.random() < 0.4:
                no_acc = remove_accents(word)
                for match in find_word(result, word):
                    result = result[:match[0]] + no_acc + result[match[1]:]
                    error_types.append(f"noaccent:{word}->{no_acc}")
                    break

    # 3. Erros de digitação (letras duplas ou trocadas)
    typo_pairs = [
        ("supermercado", "supermrecado"), ("mercado", "meracdo"),
        ("pessoal", "pessoael"), ("problema", "probelma"),
        ("trabalho", "trabalho"), ("dinheiro", "dinherio"),
        ("praia", "praia"), ("amigo", "amiggo"),
        ("escola", "esocla"), ("casa", "cassa"),
        ("comida", "comdia"), ("beber", "bebr"),
        ("fazer", "fazre"), ("pode", "pod"),
        ("quer", "qeur"), ("tudo", "tudso"),
        ("sempre", "sempre"), ("agora", "agroa"),
        ("hoje", "hojee"), ("amanhã", "amnha"),
        ("bom", "bom"), ("muito", "muito"),
        ("outro", "outo"), ("quando", "qundo"),
        ("irmao", "irmaos"), ("coracao", "coraca"),
    ]
    if random.random() < 0.3:
        for correct, typo in typo_pairs:
            if correct.lower() in result.lower() and random.random() < 0.3:
                for match in find_word(result, correct):
                    result = result[:match[0]] + typo + result[match[1]:]
                    error_types.append(f"typo:{correct}->{typo}")
                    break

    # 4. Minúsculas no início
    if random.random() < 0.2 and result[0].isupper():
        result = result[0].lower() + result[1:]
        error_types.append("lowercase_start")

    # 5. Remover pontuação
    if random.random() < 0.2:
        result = result.rstrip(".!?,")
        error_types.append("no_punctuation")

    # 6. Gírias internet (não devem ser corrigidas)
    slangs = ["kkkk", "rsrs", "vlw", "flw", "tmj", "fds", "kkk", "haha", "ahah"]
    if random.random() < 0.15:
        slang = random.choice(slangs)
        result = result + " " + slang
        error_types.append(f"slang:{slang}")

    return result, error_types


def find_word(text, word):
    """Encontra todas as ocorrências de word em text, retornando (start, end)."""
    results = []
    lower_text = text.lower()
    lower_word = word.lower()
    start = 0
    while True:
        idx = lower_text.find(lower_word, start)
        if idx == -1:
            break
        end = idx + len(lower_word)
        # Verificar limites de palavra
        if (idx == 0 or not lower_text[idx-1].isalpha()) and \
           (end >= len(lower_text) or not lower_text[end].isalpha()):
            results.append((idx, end))
        start = end
    return results


# ============================================================
# GERAR 10.000 FRASES
# ============================================================

def generate_test_sentences(n=10000):
    """Gera N frases com erros de internet."""
    # Coletar todas as frases base
    all_correct = []
    for category, sentences in correct_sentences.items():
        all_correct.extend(sentences)

    # Adicionar variações com diferentes contextos
    contexts = [
        "", "mano", "amigo", "galera", "pessoal", "cara",
        "", "", "", "", "", ""  # mais frases sem contexto
    ]

    sentences = []
    for i in range(n):
        base = random.choice(all_correct)
        # Aplicar erros
        erro, err_types = apply_internet_errors(base)
        # Pular se nao teve erro real (so slang/pontuacao/minuscula)
        has_real = any(
            not et.startswith("slang:") and not et.startswith("no_punctuation") and not et.startswith("lowercase_start")
            for et in err_types
        )
        if not has_real:
            continue
        sentences.append({
            "id": i,
            "original_correct": base,
            "with_errors": erro,
            "error_types": err_types,
        })

    return sentences


# ============================================================
# RODAR TESTES
# ============================================================

def run_tests(sentences, batch_size=5):
    """Roda os testes em batches para não sobrecarregar a API."""
    results = []
    total = len(sentences)
    
    # Stats
    stats = {
        "total": total,
        "lt_detected": 0,        # LT encontrou pelo menos 1 erro
        "lt_correct_suggestion": 0, # LT sugeriu a correção certa na posição 1
        "lt_correct_in_list": 0,    # A correção certa estava na lista de sugestões
        "lt_missed": 0,             # LT não detectou nenhum erro
        "lt_wrong_first": 0,        # Primeira sugestão era ERRADA
        "lt_overcorrected": 0,      # LT corrigiu algo que não era erro (slang, nomes)
        "errors_by_type": defaultdict(lambda: {"detected": 0, "correct_first": 0, "missed": 0}),
        "missed_examples": [],
        "wrong_first_examples": [],
    }

    for i in range(0, total, batch_size):
        batch = sentences[i:i+batch_size]
        for s in batch:
            sys.stdout.write(f"\rTestando {min(i+batch_size, total)}/{total}...")
            sys.stdout.flush()
            
            text = s["with_errors"]
            err_types = s["error_types"]
            correct = s["original_correct"]

            if not err_types:
                # Sem erros artificiais, pular
                continue

            lt_result = check_lt(text)
            matches = lt_result.get("matches", [])

            # Verificar se LT detectou algo
            has_real_errors = any(
                not et.startswith("slang:") and not et.startswith("no_punctuation") and not et.startswith("lowercase_start")
                for et in err_types
            )

            if has_real_errors:
                if len(matches) == 0:
                    stats["lt_missed"] += 1
                    for et in err_types:
                        if not et.startswith("slang:"):
                            stats["errors_by_type"][et]["missed"] += 1
                    if len(stats["missed_examples"]) < 30:
                        stats["missed_examples"].append({
                            "text": text,
                            "correct": correct,
                            "errors": err_types,
                        })
                else:
                    stats["lt_detected"] += 1
                    # Verificar se a primeira sugestão pra cada erro está correta
                    best_correct = True
                    for m in matches:
                        orig_word = text[m["offset"]:m["offset"]+m["length"]]
                        suggestions = [r["value"] for r in m.get("replacements", [])]
                        if not suggestions:
                            continue
                        first_sug = suggestions[0]
                        # Verificar se first_sug quando aplicada melhora o texto
                        # Simplificação: checar se first_sug existe na frase correta
                        if first_sug.lower() in correct.lower():
                            stats["errors_by_type"][f"match:{orig_word}->{first_sug}"]["correct_first"] += 1
                        else:
                            best_correct = False
                            stats["errors_by_type"][f"wrong:{orig_word}->{first_sug}"]["detected"] += 1
                            if len(stats["wrong_first_examples"]) < 30:
                                stats["wrong_first_examples"].append({
                                    "word": orig_word,
                                    "suggested": first_sug,
                                    "all_suggestions": suggestions[:5],
                                    "expected_in": correct,
                                    "full_text": text,
                                })
                    if best_correct:
                        stats["lt_correct_suggestion"] += 1
                    else:
                        stats["lt_wrong_first"] += 1

            # Verificar overcorrection (corrigiu slang)
            for et in err_types:
                if et.startswith("slang:"):
                    slang_word = et.split(":")[1]
                    for m in matches:
                        orig = text[m["offset"]:m["offset"]+m["length"]]
                        if orig.lower() == slang_word.lower():
                            stats["lt_overcorrected"] += 1

            # Rate limit
            time.sleep(0.05)

    print()
    return stats


# ============================================================
# RELATÓRIO
# ============================================================

def print_report(stats):
    print("\n" + "="*70)
    print("  RELATÓRIO DE TESTE - LanguageTool PT-BR")
    print("  10.000 frases com erros comuns de internet")
    print("="*70)
    
    total_with_errors = stats["lt_detected"] + stats["lt_missed"]
    
    print(f"\n📊 RESUMO GERAL:")
    print(f"  Total de frases testadas: {stats['total']}")
    print(f"  Frases com erros reais:   {total_with_errors}")
    print(f"")
    print(f"  ✅ LT detectou o erro:        {stats['lt_detected']:>5} ({stats['lt_detected']/max(total_with_errors,1)*100:.1f}%)")
    print(f"  ❌ LT não detectou (miss):    {stats['lt_missed']:>5} ({stats['lt_missed']/max(total_with_errors,1)*100:.1f}%)")
    print(f"")
    print(f"  🎯 1ª sugestão CORRETA:        {stats['lt_correct_suggestion']:>5} ({stats['lt_correct_suggestion']/max(stats['lt_detected'],1)*100:.1f}% dos detectados)")
    print(f"  ⚠️  1ª sugestão ERRADA:        {stats['lt_wrong_first']:>5} ({stats['lt_wrong_first']/max(stats['lt_detected'],1)*100:.1f}% dos detectados)")
    print(f"  🔴 Overcorrection (slang):    {stats['lt_overcorrected']:>5}")

    # Erros mais comuns que LT errou a 1ª sugestão
    print(f"\n⚠️  PRIMEIRA SUGESTÃO ERRADA (top 20):")
    wrong_items = [(k, v) for k, v in stats["errors_by_type"].items() if k.startswith("wrong:")]
    wrong_items.sort(key=lambda x: -x[1]["detected"])
    for k, v in wrong_items[:20]:
        print(f"  {k}: {v['detected']}x")

    # Erros mais comuns que LT não detectou
    print(f"\n❌ ERROS NÃO DETECTADOS (top 20):")
    missed_items = [(k, v) for k, v in stats["errors_by_type"].items() if k.startswith("abbrev:") or k.startswith("noaccent:") or k.startswith("typo:")]
    missed_items.sort(key=lambda x: -x[1]["missed"])
    for k, v in missed_items[:20]:
        print(f"  {k}: {v['missed']}x")

    # Exemplos de erros não detectados
    if stats["missed_examples"]:
        print(f"\n📝 EXEMPLOS DE ERROS NÃO DETECTADOS (primeiros 15):")
        for ex in stats["missed_examples"][:15]:
            print(f'  TEXT: {ex["text"]}')
            print(f'  CORRECT: {ex["correct"]}')
            print(f'    erros: {chr(44).join(ex["errors"])}')
    # Exemplos de 1a sugestao errada
    if stats["wrong_first_examples"]:
        print("\nEXEMPLOS DE 1a SUGESTAO ERRADA (primeiros 15):")
        for ex in stats["wrong_first_examples"][:15]:
            w = ex["word"]
            s = ex["suggested"]
            e = ex["expected_in"]
            a = ex["all_suggestions"]
            print("  WORD: " + w)
            print("  LT SUGGESTED: " + s)
            print("  EXPECTED: " + e)
            print("  ALL: " + str(a))
    print("\n" + "="*70)


if __name__ == "__main__":
    N = 5000
    print(f"Gerando {N} frases de teste...")
    sentences = generate_test_sentences(N)
    
    print(f"Frases geradas. Iniciando testes contra LanguageTool...")
    print("(Isso vai levar alguns minutos devido ao rate limit)\n")
    
    stats = run_tests(sentences, batch_size=1)
    print_report(stats)
    
    # Salvar resultados em JSON
    with open("/home/z/my-project/scripts/lt-test-results.json", "w") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    print("Resultados salvos em scripts/lt-test-results.json")
