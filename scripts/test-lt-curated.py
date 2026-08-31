#!/usr/bin/env python3
"""Teste curado: erros reais de internet que pessoas escrevem.
Cada teste envia UMA palavra errada em contexto curto.
Rapido e direto ao ponto."""

import urllib.request
import urllib.parse
import json
import time
import sys

LT_API = "https://api.languagetool.org/v2/check"

def check(word, context_before="", context_after="."):
    text = context_before + word + context_after
    data = urllib.parse.urlencode({"text": text, "language": "pt-BR", "enabledOnly": "false"}).encode()
    req = urllib.request.Request(LT_API, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode())
            for m in result.get("matches", []):
                orig = text[m["offset"]:m["offset"]+m["length"]]
                if orig.lower() == word.lower():
                    suggs = [r["value"] for r in m.get("replacements", [])][:5]
                    return {"detected": True, "suggestions": suggs, "rule": m["rule"]["id"]}
            return {"detected": False, "suggestions": [], "rule": None}
    except Exception as e:
        return {"detected": None, "suggestions": [], "error": str(e)}

# TESTES: (palavra_errada, correcao_certa, categoria)
TESTS = [
    # --- SEM ACENTO (o mais comum na internet) ---
    ("voce", "voce", "sem_acento"),
    ("vc", "voce", "abreviacao"),
    ("nao", "nao", "sem_acento"),
    ("tambem", "tambem", "sem_acento"),
    ("ja", "ja", "sem_acento"),
    ("so", "so", "sem_acento"),
    ("ate", "ate", "sem_acento"),
    ("ninguem", "ninguem", "sem_acento"),
    ("alguem", "alguem", "sem_acento"),
    ("porem", "porem", "sem_acento"),
    ("tá", "ta", "sem_acento"),
    ("to", "to", "sem_acento"),
    ("celebre", "celebre", "sem_acento"),
    ("numero", "numero", "sem_acento"),
    ("facil", "facil", "sem_acento"),
    ("util", "util", "sem_acento"),
    ("possivel", "possivel", "sem_acento"),
    ("necessario", "necessario", "sem_acento"),
    ("dificil", "dificil", "sem_acento"),
    ("rapido", "rapido", "sem_acento"),
    ("pratico", "pratico", "sem_acento"),
    ("publico", "publico", "sem_acento"),
    ("genero", "genero", "sem_acento"),
    ("misterio", "misterio", "sem_acento"),
    ("experiencia", "experiencia", "sem_acento"),
    ("diferenca", "diferenca", "sem_acento"),
    ("informacao", "informacao", "sem_acento"),
    ("situacao", "situacao", "sem_acento"),
    ("opiniao", "opiniao", "sem_acento"),
    ("coracao", "coracao", "sem_acento"),
    ("irmão", "irmao", "com_acento"),  # correct - should NOT be flagged
    ("pão", "pao", "sem_tilde"),
    ("não", "nao", "sem_tilde"),
    ("informação", "informacao", "sem_tilde"),
    
    # --- ABREVIACOES ---
    ("tbm", "tambem", "abreviacao"),
    ("pq", "porque", "abreviacao"),
    ("kd", "cade", "abreviacao"),
    ("blz", "beleza", "abreviacao"),
    ("td", "tudo", "abreviacao"),
    ("cmg", "comigo", "abreviacao"),
    ("flw", "falou", "abreviacao"),
    ("vlw", "valeu", "abreviacao"),
    ("nmr", "numero", "abreviacao"),
    ("q", "que", "abreviacao"),
    ("c", "que", "abreviacao"),
    ("add", "adicionar", "abreviacao"),
    ("msg", "mensagem", "abreviacao"),
    ("pv", "privado", "abreviacao"),
    ("fds", "fim de semana", "abreviacao"),
    ("tmj", "tamo junto", "abreviacao"),
    
    # --- ERROS DE DIGITACAO COMUNS ---
    ("supermercado", "supermercado", "correto"),  # correct word
    ("subermercado", "supermercado", "typo"),
    ("meracdo", "mercado", "typo"),
    ("amiggo", "amigo", "typo"),
    ("esocla", "escola", "typo"),
    ("probelma", "problema", "typo"),
    ("dinherio", "dinheiro", "typo"),
    ("comdia", "comida", "typo"),
    ("fazre", "fazer", "typo"),
    ("qeur", "quer", "typo"),
    ("agroa", "agora", "typo"),
    ("qundo", "quando", "typo"),
    ("hojee", "hoje", "typo"),
    ("tudso", "tudo", "typo"),
    ("bebr", "beber", "typo"),
    ("pesssoa", "pessoa", "typo"),
    ("bonitoo", "bonito", "typo"),
    ("carrro", "carro", "typo"),
    ("mulhér", "mulher", "typo"),
    ("homém", "homem", "typo"),
    ("criánça", "crianca", "typo"),
    
    # --- ERROS DE GRAMATICA COMUNS ---
    ("aonde", "aonde", "gramatica"),  # pode ser correto
    ("mal", "mal", "correto"),
    ("mau", "mau", "correto"),
    ("mas", "mas", "correto"),
    ("mais", "mais", "correto"),
    ("tem", "tem", "correto"),
    ("tém", "tem", "gramatica"),  # wrong accent
    ("vio", "viu", "gramatica"),
    ("fazio", "fiz", "gramatica"),
    ("traser", "trazer", "gramatica"),
    ("intao", "entao", "gramatica"),
    ("penas", "penas", "correto"),
    ("pessoas", "pessoas", "correto"),
    ("concerteza", "com certeza", "gramatica"),
    ("demais", "demais", "gramatica"),
    ("de mais", "demais", "gramatica"),
    
    # --- SLANG/GIRIA (NAO DEVEM SER CORRIGIDOS) ---
    ("kkkk", "kkkk", "slang"),
    ("rsrs", "rsrs", "slang"),
    ("haha", "haha", "slang"),
    ("vlw", "vlw", "slang"),
    ("flw", "flw", "slang"),
    ("tmj", "tmj", "slang"),
    
    # --- PALAVRAS CORRETAS (NAO DEVEM SER FLAGADAS) ---
    ("voce", "voce", "correto"),
    ("também", "tambem", "correto_acentuado"),
    ("não", "nao", "correto_acentuado"),
    ("já", "ja", "correto_acentuado"),
    ("só", "so", "correto_acentuado"),
    ("até", "ate", "correto_acentuado"),
    ("é", "e", "correto_acentuado"),
    ("óbvio", "obvio", "correto_acentuado"),
]

# Contextos para testar as palavras
CONTEXTS = [
    ("Eu fui ", " na cidade"),
    ("", " hoje"),
    ("Preciso de ", ""),
    ("Ele me disse ", ""),
    ("Nao sei ", ""),
]

def run_all_tests():
    results = []
    total = len(TESTS)
    
    for i, (word, expected, category) in enumerate(TESTS):
        sys.stdout.write(f"\rTestando {i+1}/{total}: {word} ({category})")
        sys.stdout.flush()
        
        ctx_before, ctx_after = CONTEXTS[i % len(CONTEXTS)]
        r = check(word, ctx_before, ctx_after)
        
        # Verificar se a correcao certa esta nas sugestoes
        correct_in_list = expected.lower() in [s.lower() for s in r["suggestions"]]
        first_is_correct = r["suggestions"] and r["suggestions"][0].lower() == expected.lower()
        
        results.append({
            "word": word,
            "expected": expected,
            "category": category,
            **r,
            "correct_in_list": correct_in_list,
            "first_is_correct": first_is_correct,
        })
        time.sleep(0.1)
    
    print()
    return results


def print_report(results):
    # Categorias
    sem_acento = [r for r in results if r["category"] == "sem_acento"]
    abrev = [r for r in results if r["category"] == "abreviacao"]
    typo = [r for r in results if r["category"] == "typo"]
    gram = [r for r in results if r["category"] == "gramatica"]
    slang = [r for r in results if r["category"] == "slang"]
    correto = [r for r in results if r["category"].startswith("correto")]
    sem_tilde = [r for r in results if r["category"] == "sem_tilde"]
    
    print("\n" + "="*70)
    print("  RELATORIO - LanguageTool PT-BR (teste curado)")
    print("="*70)
    
    def cat_report(name, items, should_detect=True):
        if not items:
            return
        detected = sum(1 for r in items if r["detected"] == True)
        missed = sum(1 for r in items if r["detected"] == False)
        correct_first = sum(1 for r in items if r["first_is_correct"])
        correct_any = sum(1 for r in items if r["correct_in_list"])
        total = len(items)
        
        print(f"\n--- {name} ({total} testes) ---")
        if should_detect:
            print(f"  Detectados:     {detected}/{total} ({detected/total*100:.0f}%)")
            print(f"  NAO detectados: {missed}/{total} ({missed/total*100:.0f}%)")
            if detected > 0:
                print(f"  1a sugestao CERTA: {correct_first}/{detected} ({correct_first/detected*100:.0f}%)")
                print(f"  Correcao na lista: {correct_any}/{detected} ({correct_any/detected*100:.0f}%)")
        else:
            false_pos = sum(1 for r in items if r["detected"] == True)
            print(f"  Falsos positivos: {false_pos}/{total} (NAO deveriam ser corrigidos)")
        
        # Mostrar detalhes dos problemas
        if should_detect:
            missed_items = [r for r in items if r["detected"] == False]
            if missed_items:
                print(f"  NAO detectados:")
                for r in missed_items[:10]:
                    print(f"    {r['word']} (esperado: {r['expected']})")
            wrong_first = [r for r in items if r["detected"] and not r["first_is_correct"]]
            if wrong_first:
                print(f"  1a sugestao ERRADA:")
                for r in wrong_first[:10]:
                    print(f"    {r['word']} -> {r['suggestions'][:3]} (esperado: {r['expected']})")
        else:
            fps = [r for r in items if r["detected"] == True]
            if fps:
                print(f"  Falsos positivos:")
                for r in fps[:10]:
                    print(f"    {r['word']} -> {r['suggestions'][:3]}")
    
    cat_report("SEM ACENTO (voce, nao, tambem, etc.)", sem_acento, True)
    cat_report("SEM TILDE (pao, cao, etc.)", sem_tilde, True)
    cat_report("ABREVIACOES (vc, tbm, pq, etc.)", abrev, True)
    cat_report("ERROS DE DIGITACAO", typo, True)
    cat_report("ERROS GRAMATICAIS", gram, True)
    cat_report("SLANG/GIRIA (nao devem ser corrigidos)", slang, False)
    cat_report("PALAVRAS CORRETAS (nao devem ser corrigidos)", correto, False)
    
    # Resumo final
    should_detect = [r for r in results if r["category"] not in ("slang",) and not r["category"].startswith("correto")]
    total_sd = len(should_detect)
    detected_sd = sum(1 for r in should_detect if r["detected"])
    print(f"\n{'='*70}")
    print(f"  RESUMO GERAL (excluindo slang e corretas):")
    print(f"  Total: {total_sd} | Detectados: {detected_sd} ({detected_sd/total_sd*100:.0f}%) | NAO detectados: {total_sd-detected_sd} ({(total_sd-detected_sd)/total_sd*100:.0f}%)")
    print(f"{'='*70}")


if __name__ == "__main__":
    print("Teste curado de erros comuns de internet PT-BR")
    print(f"Total de testes: {len(TESTS)}")
    print()
    
    results = run_all_tests()
    print_report(results)
    
    # Salvar
    with open("/home/z/my-project/scripts/lt-test-results.json", "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("\nResultados salvos em scripts/lt-test-results.json")
