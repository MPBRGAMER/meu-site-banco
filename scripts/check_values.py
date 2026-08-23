import re

FILE = '/home/z/my-project/user-project/src/components/banco/TranslationPopup.tsx'
with open(FILE) as f:
    content = f.read()

keys = ['Estoque do Banco', 'Movimentos do Caixa', 'desde', 'contribuicoes', 'registros', 'Nenhum registro ainda.', 'Estoque vazio.', 'Nenhum item encontrado.', 'Eventos Ativos', 'Nenhum doador cadastrado.', 'Nenhum investidor cadastrado.']
langs = ['ES', 'FR', 'DE', 'RU', 'IT', 'ZH_CN', 'ZH_TW', 'KO', 'JA', 'ID', 'TR']

for lang in langs:
    pattern = rf'^const {lang}: Record<string, string> = \{{'
    match = re.search(pattern, content, re.MULTILINE)
    if not match: continue
    start = match.start()
    bc = 0
    end = start
    for i in range(match.end() - 1, len(content)):
        if content[i] == '{': bc += 1
        elif content[i] == '}':
            bc -= 1
            if bc == 0: end = i + 1; break
    dc = content[start:end]
    print(f'=== {lang} ===')
    for key in keys:
        esc = re.escape(key)
        m = re.search(rf'"{esc}"\s*:\s*"([^"]*?)"', dc)
        if m:
            print(f'  {key} => {m.group(1)}')
        else:
            print(f'  {key} => MISSING!')
    print()