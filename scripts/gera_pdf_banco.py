import json, os, sys, re, platform
from datetime import datetime, timezone

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FONT SETUP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_IS_MAC = platform.system() == 'Darwin'
FONT_DIR = os.path.expanduser('~/.openclaw/workspace/fonts') if _IS_MAC else '/usr/share/fonts'

pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold', italic='FreeSerif-Italic')
# Install font fallback for mixed text
sys.path.insert(0, '/home/z/my-project/skills/pdf/scripts')
from pdf import install_font_fallback
install_font_fallback()

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PALETTE (auto-generated cascade)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE_BG       = colors.HexColor('#f0f0ef')
TABLE_STRIPE  = colors.HexColor('#f0f0ee')
HEADER_FILL   = colors.HexColor('#6a624b')
BORDER        = colors.HexColor('#c7c2b3')
TEXT_PRIMARY   = colors.HexColor('#161513')
TEXT_MUTED     = colors.HexColor('#807d76')

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STYLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
style_title = ParagraphStyle(
    name='Title', fontName='FreeSerif-Bold', fontSize=22, leading=28,
    alignment=TA_CENTER, textColor=TEXT_PRIMARY, spaceAfter=4
)
style_subtitle = ParagraphStyle(
    name='Subtitle', fontName='FreeSerif-Italic', fontSize=12, leading=16,
    alignment=TA_CENTER, textColor=TEXT_MUTED, spaceAfter=6
)
style_h1 = ParagraphStyle(
    name='H1', fontName='FreeSerif-Bold', fontSize=16, leading=22,
    textColor=HEADER_FILL, spaceBefore=18, spaceAfter=8
)
style_h2 = ParagraphStyle(
    name='H2', fontName='FreeSerif-Bold', fontSize=12, leading=16,
    textColor=TEXT_PRIMARY, spaceBefore=12, spaceAfter=6
)
style_body = ParagraphStyle(
    name='Body', fontName='FreeSerif', fontSize=9, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT
)
style_meta = ParagraphStyle(
    name='Meta', fontName='FreeSerif-Italic', fontSize=8, leading=11,
    textColor=TEXT_MUTED, alignment=TA_CENTER
)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def fmt_date(iso_str):
    """Format ISO date to BR format."""
    if not iso_str:
        return '-'
    try:
        dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
        return dt.astimezone(timezone.utc).strftime('%d/%m/%Y %H:%M')
    except:
        return iso_str[:16]

def fmt_number(n):
    """Format number with dots as thousands separator."""
    if n is None:
        return '-'
    try:
        return f"{int(n):,}".replace(",", ".")
    except:
        return str(n)

def make_table(headers, rows, col_widths=None):
    """Create a styled table."""
    page_w = A4[0] - 2.5*cm - 2.5*cm
    if col_widths is None:
        n = len(headers)
        col_widths = [page_w / n] * n
    else:
        total = sum(col_widths)
        col_widths = [w / total * page_w for w in col_widths]

    # Header row
    header_paras = [Paragraph(f'<b>{h}</b>', ParagraphStyle(
        name=f'th_{h}', fontName='FreeSerif-Bold', fontSize=7.5, leading=10,
        textColor=colors.white, alignment=TA_CENTER
    )) for h in headers]

    # Data rows
    data_rows = []
    for row in rows:
        data_row = []
        for i, cell in enumerate(row):
            align = TA_LEFT if i == 0 else TA_CENTER
            if isinstance(cell, str) and len(cell) > 40 and i == 0:
                cell = cell[:40] + '...'
            data_row.append(Paragraph(str(cell), ParagraphStyle(
                name=f'td_{i}', fontName='FreeSerif', fontSize=7, leading=9.5,
                textColor=TEXT_PRIMARY, alignment=align
            )))
        data_rows.append(data_row)

    all_data = [header_paras] + data_rows
    t = Table(all_data, colWidths=col_widths, repeatRows=1)

    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'FreeSerif-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 7.5),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 3),
        ('TOPPADDING', (0, 1), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.4, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]
    # Alternating row colors
    for i in range(1, len(all_data)):
        if i % 2 == 0:
            style_cmds.append(('BACKGROUND', (0, i), (-1, i), TABLE_STRIPE))

    t.setStyle(TableStyle(style_cmds))
    return t

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LOAD DATA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
with open('/home/z/my-project/upload/backup-dayr-2026-08-09T03-09-50-827Z.json', 'r') as f:
    backup = json.load(f)

data = backup['data']
exported_at = fmt_date(backup['exportedAt'])

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BUILD PDF
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
output_path = '/home/z/my-project/download/banco-dados-organizado.pdf'

doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    leftMargin=2.5*cm, rightMargin=2.5*cm,
    topMargin=2*cm, bottomMargin=2*cm,
    title='Banco de Dados - Day R Survival',
    author='Z.ai',
    creator='Z.ai',
    subject='Backup organizado do banco de dados do sistema Day R Survival'
)

story = []

# ── COVER / TITLE ──
story.append(Spacer(1, 80))
story.append(Paragraph('Banco de Dados', style_title))
story.append(Paragraph('Day R Survival - Sistema de Banco', style_title))
story.append(Spacer(1, 16))
story.append(Paragraph(f'Backup exportado em: {exported_at}', style_subtitle))
story.append(Spacer(1, 12))

# Summary table
summary_data = [
    ('Investidores', len(data.get('investidores', []))),
    ('Tabela de Trocas', len(data.get('tabelasTroca', []))),
    ('Trocas Realizadas', len(data.get('trocas', []))),
    ('Compras e Vendas', len(data.get('comprasVendas', []))),
    ('Registros de Caixa', len(data.get('caixa', []))),
    ('Doadores', len(data.get('doadores', []))),
    ('Relatos de Precos', len(data.get('priceReports', []))),
    ('Mensagens do Chat', len(data.get('chatMensagens', []))),
]
sum_table = make_table(
    ['Tabela', 'Registros'],
    [[nome, str(qtd)] for nome, qtd in summary_data],
    col_widths=[3, 1]
)
story.append(sum_table)
story.append(Spacer(1, 8))
story.append(Paragraph('Tabelas vazias: Emprestimos, Leiloes, Lances, Sorteios, Lotericas, Overrides, Salas de Chat, Propagandas', style_meta))
story.append(PageBreak())

# ── 1. INVESTIDORES ──
investidores = data.get('investidores', [])
story.append(Paragraph('1. Investidores', style_h1))
story.append(Paragraph(f'Total: {len(investidores)} investidores cadastrados.', style_body))
story.append(Spacer(1, 8))
if investidores:
    inv_rows = []
    for inv in sorted(investidores, key=lambda x: x.get('ordem', 99)):
        inv_rows.append([
            inv.get('nome', '-'),
            inv.get('status', '-'),
            fmt_date(inv.get('dataEntrada')),
            inv.get('observacao') or '-'
        ])
    story.append(make_table(
        ['Nome', 'Status', 'Data Entrada', 'Observacao'],
        inv_rows,
        col_widths=[3, 2, 3, 4]
    ))

# ── 2. TABELA DE TROCAS ──
tabelas = data.get('tabelasTroca', [])
story.append(Spacer(1, 18))
story.append(Paragraph('2. Tabela de Trocas', style_h1))
story.append(Paragraph(f'Total: {len(tabelas)} regras de troca cadastradas.', style_body))
story.append(Spacer(1, 8))
if tabelas:
    tab_rows = []
    for t in tabelas:
        tab_rows.append([
            t.get('itemBase', '-'),
            fmt_number(t.get('quantidadeBase')),
            t.get('itemResultado', '-'),
            fmt_number(t.get('quantidadeResultado')),
            t.get('categoria') or '-'
        ])
    story.append(make_table(
        ['Item Base', 'Qtd Base', 'Item Resultado', 'Qtd Resultado', 'Categoria'],
        tab_rows,
        col_widths=[3, 1.2, 3, 1.5, 2]
    ))

# ── 3. TROCAS REALIZADAS ──
trocas = data.get('trocas', [])
story.append(Spacer(1, 18))
story.append(Paragraph('3. Trocas Realizadas', style_h1))
story.append(Paragraph(f'Total: {len(trocas)} trocas registradas.', style_body))
story.append(Spacer(1, 8))
if trocas:
    troc_rows = []
    for t in trocas:
        troc_rows.append([
            t.get('player', '-'),
            t.get('itemEnviado', '-'),
            fmt_number(t.get('quantidadeEnviada')),
            t.get('itemRecebido', '-'),
            fmt_number(t.get('quantidadeRecebida')),
            f"{t.get('taxaAplicada', '-')}%",
            fmt_number(t.get('lucroBanco')),
            fmt_date(t.get('data')),
        ])
    story.append(make_table(
        ['Player', 'Item Enviado', 'Qtd', 'Item Recebido', 'Qtd', 'Taxa', 'Lucro Banco', 'Data'],
        troc_rows,
        col_widths=[2.5, 2.5, 1, 2.5, 1, 0.8, 1.2, 2]
    ))

# ── 4. COMPRAS E VENDAS ──
cv = data.get('comprasVendas', [])
story.append(Spacer(1, 18))
story.append(Paragraph('4. Compras e Vendas', style_h1))
story.append(Paragraph(f'Total: {len(cv)} operacoes registradas.', style_body))
story.append(Spacer(1, 8))
if cv:
    cv_rows = []
    for c in cv:
        cv_rows.append([
            c.get('tipo', '-').upper(),
            c.get('player', '-'),
            c.get('item', '-'),
            fmt_number(c.get('quantidade')),
            c.get('itemPagamento', '-'),
            fmt_number(c.get('valor')),
            fmt_date(c.get('data')),
            c.get('observacao') or '-'
        ])
    story.append(make_table(
        ['Tipo', 'Player', 'Item', 'Qtd', 'Pagamento', 'Valor', 'Data', 'Obs'],
        cv_rows,
        col_widths=[1.2, 2, 2.5, 1, 2, 1, 2, 2]
    ))

# ── 5. REGISTROS DE CAIXA ──
caixa = data.get('caixa', [])
story.append(Spacer(1, 18))
story.append(Paragraph('5. Registros de Caixa', style_h1))
story.append(Paragraph(f'Total: {len(caixa)} movimentacoes registradas.', style_body))
story.append(Spacer(1, 8))
if caixa:
    caixa_rows = []
    for c in caixa:
        caixa_rows.append([
            c.get('tipo', '-'),
            c.get('descricao', '-')[:45],
            c.get('item', '-'),
            fmt_number(c.get('quantidade')),
            fmt_number(c.get('valor')),
            c.get('origem', '-') or '-',
            fmt_date(c.get('data')),
        ])
    story.append(make_table(
        ['Tipo', 'Descricao', 'Item', 'Quantidade', 'Valor', 'Origem', 'Data'],
        caixa_rows,
        col_widths=[1.2, 3.5, 2, 1.2, 1, 1.2, 2]
    ))

# ── 6. DOADORES ──
doadores = data.get('doadores', [])
story.append(Spacer(1, 18))
story.append(Paragraph('6. Doadores', style_h1))
story.append(Paragraph(f'Total: {len(doadores)} registros de doacoes.', style_body))
story.append(Spacer(1, 8))
if doadores:
    doa_rows = []
    for d in sorted(doadores, key=lambda x: x.get('ordem', 99)):
        doa_rows.append([
            d.get('nome', '-'),
            d.get('item', '-'),
            fmt_number(d.get('quantidade')),
            fmt_date(d.get('data')),
        ])
    story.append(make_table(
        ['Doador', 'Item', 'Quantidade', 'Data'],
        doa_rows,
        col_widths=[3, 3, 2, 3]
    ))

# ── 7. RELATOS DE PRECOS ──
pr = data.get('priceReports', [])
story.append(Spacer(1, 18))
story.append(Paragraph('7. Relatos de Precos', style_h1))
story.append(Paragraph(f'Total: {len(pr)} relatos.', style_body))
story.append(Spacer(1, 8))
if pr:
    pr_rows = []
    for p in pr:
        pr_rows.append([
            p.get('itemName', '-'),
            p.get('nickname', '-'),
            f"Aco: {fmt_number(p.get('steelQty'))}x{p.get('steelPrice')}",
            f"Cimento: {fmt_number(p.get('cementQty'))}x{p.get('cementPrice')}",
            fmt_date(p.get('data')),
        ])
    story.append(make_table(
        ['Item', 'Player', 'Preco Aco', 'Preco Cimento', 'Data'],
        pr_rows,
        col_widths=[3, 2, 2.5, 2.5, 2]
    ))

# ── 8. MENSAGENS DO CHAT ──
chat = data.get('chatMensagens', [])
story.append(Spacer(1, 18))
story.append(Paragraph('8. Mensagens do Chat', style_h1))
story.append(Paragraph(f'Total: {len(chat)} mensagens.', style_body))
story.append(Spacer(1, 8))
if chat:
    chat_rows = []
    for m in chat:
        chat_rows.append([
            m.get('canal', '-'),
            m.get('autor', '-'),
            str(m.get('conteudo', '-'))[:60],
            'Admin' if m.get('isAdmin') else 'Player',
            fmt_date(m.get('data')),
        ])
    story.append(make_table(
        ['Canal', 'Autor', 'Mensagem', 'Tipo', 'Data'],
        chat_rows,
        col_widths=[1.5, 2, 5, 1.2, 2]
    ))

# ── PAGE NUMBER FOOTER ──
def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont('FreeSerif', 8)
    canvas.setFillColor(TEXT_MUTED)
    page_num = canvas.getPageNumber()
    text = f"Banco de Dados Day R Survival  |  Pagina {page_num}"
    canvas.drawCentredString(A4[0] / 2, 1.2 * cm, text)
    canvas.restoreState()

# ── BUILD ──
doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
print(f'PDF gerado: {output_path}')
print(f'Tamanho: {os.path.getsize(output_path) / 1024:.1f} KB')
