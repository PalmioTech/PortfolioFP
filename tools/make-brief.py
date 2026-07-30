#!/usr/bin/env python3
# Genera un PDF compilabile (AcroForm) — Brief di progetto FPdeveloper.
import os
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white

W, H = A4                      # 595.27 x 841.89 pt
ML, MR = 46, 46                # margini
CW = W - ML - MR               # larghezza contenuto
ORANGE = HexColor('#FF3500')
DARK   = HexColor('#161616')
MUTED  = HexColor('#6c6c6c')
BORDER = HexColor('#c9c4bd')
FIELDBG= HexColor('#f4f0ea')
BANDBG = HexColor('#f7f3ee')

OUT = 'assets/docs/brief-progetto-fpdeveloper.pdf'
os.makedirs(os.path.dirname(OUT), exist_ok=True)

c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Brief di progetto — FPdeveloper')
c.setAuthor('FPdeveloper — Federico Palmieri')
af = c.acroForm

y = [0.0]           # cursore verticale (mutabile)
_field = [0]        # contatore per nomi univoci
def fname(base):
    _field[0] += 1
    return f'{base}_{_field[0]}'

def brand_mark(x, yb):
    c.setFont('Courier-Bold', 15)
    c.setFillColor(ORANGE); c.drawString(x, yb, '<')
    w1 = c.stringWidth('<', 'Courier-Bold', 15)
    c.setFillColor(DARK);   c.drawString(x + w1, yb, 'FP')
    w2 = c.stringWidth('FP', 'Courier-Bold', 15)
    c.setFillColor(ORANGE); c.drawString(x + w1 + w2, yb, '/>')

def header(first=False):
    top = H - 40
    brand_mark(ML, top - 4)
    c.setFont('Helvetica', 8.5); c.setFillColor(MUTED)
    c.drawRightString(W - MR, top - 1, 'fede-palma@hotmail.it  ·  +39 327 290 5579')
    if first:
        c.setFont('Helvetica-Bold', 22); c.setFillColor(DARK)
        c.drawString(ML, top - 34, 'Brief di progetto')
        c.setFont('Helvetica', 10.5); c.setFillColor(MUTED)
        c.drawString(ML, top - 50, 'Compila e rimandamelo: da qui preparo il preventivo, senza impegno.')
        c.setStrokeColor(ORANGE); c.setLineWidth(2)
        c.line(ML, top - 60, ML + 46, top - 60)
        y[0] = top - 82
    else:
        c.setStrokeColor(BORDER); c.setLineWidth(0.6)
        c.line(ML, top - 10, W - MR, top - 10)
        y[0] = top - 30

def need(space):
    if y[0] - space < 54:
        c.showPage(); header(False)

def section(n, title):
    need(56)
    y[0] -= 6
    c.setFillColor(BANDBG); c.rect(ML, y[0] - 20, CW, 26, stroke=0, fill=1)
    c.setFillColor(ORANGE); c.rect(ML, y[0] - 20, 4, 26, stroke=0, fill=1)
    c.setFont('Helvetica-Bold', 12.5); c.setFillColor(DARK)
    c.drawString(ML + 14, y[0] - 12, f'{n}.  {title}')
    y[0] -= 34

def label(txt, dy=13, size=9.5, color=DARK, font='Helvetica-Bold'):
    c.setFont(font, size); c.setFillColor(color)
    c.drawString(ML, y[0], txt)
    y[0] -= dy

def textfield(w, base='campo', h=17, x=None, multiline=False, tip=''):
    if x is None: x = ML
    need(h + 12)
    top = y[0]
    af.textfield(name=fname(base), tooltip=tip, x=x, y=top - h, width=w, height=h,
                 borderStyle='solid', borderWidth=0.7, borderColor=BORDER,
                 fillColor=FIELDBG, textColor=DARK, fontName='Helvetica', fontSize=10,
                 forceBorder=True, fieldFlags='multiline' if multiline else '')
    y[0] = top - h - 8   # avanza sotto il campo (niente sovrapposizioni)

def field_row(lbl, w=None, base='campo'):
    """Etichetta a sinistra, campo che riempie il resto della riga."""
    need(24)
    c.setFont('Helvetica-Bold', 9.5); c.setFillColor(DARK)
    c.drawString(ML, y[0], lbl)
    lw = c.stringWidth(lbl, 'Helvetica-Bold', 9.5)
    fx = ML + lw + 10
    fw = (W - MR) - fx
    af.textfield(name=fname(base), tooltip='', x=fx, y=y[0] - 11, width=fw, height=14,
                 borderStyle='solid', borderWidth=0.7, borderColor=BORDER,
                 fillColor=FIELDBG, textColor=DARK, fontName='Helvetica', fontSize=10,
                 forceBorder=True)
    y[0] -= 24

def two_fields(l1, l2, base='campo'):
    """Due campi affiancati, etichetta sopra."""
    need(34)
    colw = (CW - 16) / 2
    for i, lbl in enumerate((l1, l2)):
        x = ML + i * (colw + 16)
        c.setFont('Helvetica-Bold', 9.5); c.setFillColor(DARK)
        c.drawString(x, y[0], lbl)
        af.textfield(name=fname(base), tooltip='', x=x, y=y[0] - 20, width=colw, height=15,
                     borderStyle='solid', borderWidth=0.7, borderColor=BORDER,
                     fillColor=FIELDBG, textColor=DARK, fontName='Helvetica', fontSize=10,
                     forceBorder=True)
    y[0] -= 36

def checkboxes(items, cols=2, base='chk'):
    """Griglia di checkbox con etichetta a destra."""
    colw = CW / cols
    rows = (len(items) + cols - 1) // cols
    need(rows * 20 + 4)
    for i, it in enumerate(items):
        r, cidx = divmod(i, cols)
        x = ML + cidx * colw
        yy = y[0] - r * 20
        af.checkbox(name=fname(base), tooltip=it, x=x, y=yy - 12, size=12,
                    buttonStyle='check', borderWidth=0.9, borderColor=DARK,
                    fillColor=white, textColor=DARK, forceBorder=True)
        c.setFont('Helvetica', 9.5); c.setFillColor(DARK)
        c.drawString(x + 17, yy - 10, it)
    y[0] -= rows * 20 + 4

def radios(options, group=None, inline=True, base='radio'):
    """Gruppo radio mutuamente esclusivo. inline: tutti su una riga se ci stanno."""
    if group is None: group = fname('grp')
    if inline:
        need(20)
        x = ML
        for opt in options:
            af.radio(name=group, value=opt, selected=False, x=x, y=y[0] - 12, size=12,
                     buttonStyle='circle', borderWidth=0.9, borderColor=DARK,
                     fillColor=white, textColor=ORANGE, forceBorder=True, shape='circle')
            c.setFont('Helvetica', 9.5); c.setFillColor(DARK)
            c.drawString(x + 16, y[0] - 10, opt)
            x += 16 + c.stringWidth(opt, 'Helvetica', 9.5) + 22
        y[0] -= 22
    else:
        for opt in options:
            need(18)
            af.radio(name=group, value=opt, selected=False, x=ML, y=y[0] - 12, size=12,
                     buttonStyle='circle', borderWidth=0.9, borderColor=DARK,
                     fillColor=white, textColor=ORANGE, forceBorder=True, shape='circle')
            c.setFont('Helvetica', 9.5); c.setFillColor(DARK)
            c.drawString(ML + 16, y[0] - 10, opt)
            y[0] -= 18

def radio_line(lbl, options, base='radio'):
    """Etichetta + radio inline sulla stessa riga."""
    need(20)
    c.setFont('Helvetica-Bold', 9.5); c.setFillColor(DARK)
    c.drawString(ML, y[0] - 9, lbl)
    x = ML + max(c.stringWidth(lbl, 'Helvetica-Bold', 9.5) + 14, 120)
    group = fname('grp')
    for opt in options:
        af.radio(name=group, value=opt, selected=False, x=x, y=y[0] - 12, size=12,
                 buttonStyle='circle', borderWidth=0.9, borderColor=DARK,
                 fillColor=white, textColor=ORANGE, forceBorder=True, shape='circle')
        c.setFont('Helvetica', 9), c.setFillColor(DARK)
        c.drawString(x + 15, y[0] - 9, opt)
        x += 15 + c.stringWidth(opt, 'Helvetica', 9) + 18
    y[0] -= 20

def gap(h=8):
    y[0] -= h

# ============ PAGINA 1 ============
header(first=True)

section(1, 'I tuoi dati')
two_fields('Nome e cognome / Azienda', 'Referente', base='dati')
two_fields('Email', 'Telefono / WhatsApp', base='dati')
two_fields('Sito attuale (se ce l\'hai)', 'Social principali', base='dati')

section(2, 'La tua attività')
field_row('Cosa fai / settore:', base='att')
field_row('A chi ti rivolgi (target):', base='att')
radio_line('Dove operi:', ['locale', 'tutta Italia', 'anche estero'])
field_row('Da quanto sei attivo:', base='att')
label('Cosa ti distingue dai concorrenti:')
textfield(CW, base='att')
field_row('Come ti cercherebbero su Google (2-3 parole):', base='att')
field_row('2-3 concorrenti o siti simili (URL):', base='att')

section(3, 'Obiettivo del sito')
label('Cosa vuoi ottenere? (puoi spuntarne più di uno)', color=MUTED, font='Helvetica')
checkboxes([
    'Farmi trovare su Google', 'Ricevere richieste / contatti',
    'Vendere online (e-commerce)', 'Prendere prenotazioni / appuntamenti',
    'Presentare il mio lavoro (vetrina)', 'Altro',
], cols=2, base='obj')
gap(2); field_row('Altro (specifica):', base='obj_altro')

# ============ PAGINA 2 ============
c.showPage(); header(False)

section(4, 'Tipo di sito')
label('Se non sei sicuro scegli l\'ultima: te lo consiglio io.', color=MUTED, font='Helvetica')
radios(['Sito vetrina', 'Landing page', 'WordPress avanzato', 'E-commerce',
        'Gestionale / web app', 'Non lo so, consigliami tu'], inline=False, base='tipo')

section(5, 'Pagine e funzioni')
label('Pagine che ti servono:')
checkboxes(['Home', 'Chi siamo', 'Servizi / Prodotti', 'Portfolio / Gallery',
            'Blog / News', 'Contatti', 'Altro'], cols=3, base='pag')
gap(6)
label('Funzioni:')
checkboxes(['Form contatti', 'Prenotazioni / booking', 'E-commerce',
            'Area riservata / login', 'Multilingua', 'Chat / AI',
            'Newsletter', 'Mappa', 'Integrazione social'], cols=3, base='fun')
gap(2); field_row('Se multilingua, quali lingue:', base='lingue')

section(6, 'Contenuti e materiali')
label('Cosa hai già pronto? (una scelta per riga)', color=MUTED, font='Helvetica')
radio_line('Testi:', ['già pronti', 'da scrivere insieme', 'li scrivi tu'])
radio_line('Foto e immagini:', ['ho le mie', 'servono stock', 'serve servizio foto'])
radio_line('Logo e brand:', ['ho logo e colori', 'da creare'])
radio_line('Dominio:', ['ce l\'ho', 'da registrare'])
field_row('   se ce l\'hai, quale dominio:', base='dominio')
radio_line('Hosting:', ['ce l\'ho', 'da configurare'])

# ============ PAGINA 3 ============
c.showPage(); header(False)

section(7, 'Stile e gusto')
field_row('3 aggettivi che deve trasmettere il sito:', base='stile')
label('Colori preferiti / da evitare:')
textfield(CW, base='stile')
label('2-3 siti che ti piacciono + cosa ti piace:')
textfield(CW, h=40, base='stile', multiline=True); gap(6)

section(8, 'Budget e tempi')
label('Budget indicativo:')
radios(['meno di 1.000 €', '1.000 - 2.500 €', '2.500 - 5.000 €',
        'oltre 5.000 €', 'non so ancora'], inline=False, base='budget')
gap(4)
radio_line('Tempistica:', ['urgente (<1 mese)', '1-2 mesi', '2-3 mesi', 'nessuna fretta'])
radio_line('Manutenzione dopo il lancio:', ['sì', 'no', 'da valutare'])

section(9, 'Note libere')
label('Qualsiasi altra cosa utile a capire il progetto:', color=MUTED, font='Helvetica')
textfield(CW, h=70, base='note', multiline=True); gap(6)

# Chiusura
need(60)
c.setFillColor(BANDBG); c.rect(ML, y[0] - 44, CW, 50, stroke=0, fill=1)
c.setStrokeColor(ORANGE); c.setLineWidth(2); c.line(ML, y[0] + 6, ML + 46, y[0] + 6)
c.setFont('Helvetica-Bold', 10.5); c.setFillColor(DARK)
c.drawString(ML + 14, y[0] - 12, 'Rimanda il PDF compilato a fede-palma@hotmail.it o su WhatsApp +39 327 290 5579.')
c.setFont('Helvetica', 9.5); c.setFillColor(MUTED)
c.drawString(ML + 14, y[0] - 27, 'Ti rispondo entro 24 ore con il preventivo.')
c.setFont('Helvetica', 8); c.setFillColor(MUTED)
c.drawString(ML + 14, y[0] - 39, 'FPdeveloper — Federico Palmieri  ·  in collaborazione con Pecas SRLS')

c.save()
sz = os.path.getsize(OUT) // 1024
print(f'OK  {OUT}  ({sz} KB, {c.getPageNumber()} pagine)')
