"""Build the final report from content.py using the ACM submission template.

Usage:  python report/build_report.py            (writes the .docx and, if Microsoft Word is installed, the .pdf)
        python report/build_report.py --no-pdf
"""
import html
import importlib.util
import re
import struct
import subprocess
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / 'acm_submission_template.docx'
OUT_DOCX = HERE / 'Felt_and_Fortune_Final_Report.docx'
OUT_PDF = HERE / 'Felt_and_Fortune_Final_Report.pdf'
EMU = 914400

spec = importlib.util.spec_from_file_location('content', HERE / 'content.py')
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)


def esc(s): return html.escape(s, quote=False)


# ---- citations -------------------------------------------------------------
order = []
def _collect(text):
    for group in re.findall(r'\[(@[^\]]+)\]', text):
        for key in re.findall(r'@([\w-]+)', group):
            if key not in C.REFERENCES: raise SystemExit(f'Unknown citation key: {key}')
            if key not in order: order.append(key)
for block in C.BODY:
    for part in block[1:]:
        if isinstance(part, str): _collect(part)
        elif isinstance(part, list):
            for item in part:
                if isinstance(item, str): _collect(item)
                elif isinstance(item, list): [_collect(c) for c in item]
unused = [k for k in C.REFERENCES if k not in order]
order += unused
NUM = {k: i + 1 for i, k in enumerate(order)}


def cite(text):
    return re.sub(r'\[(@[^\]]+)\]', lambda m: '[' + ', '.join(str(NUM[k]) for k in re.findall(r'@([\w-]+)', m.group(1))) + ']', text)


# ---- runs and paragraphs ----------------------------------------------------
def runs(text, base=''):
    out = []
    for tok in re.split(r'(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)', cite(text)):
        if not tok: continue
        rpr = base
        if tok.startswith('**'): tok, rpr = tok[2:-2], base + '<w:b/>'
        elif tok.startswith('*'): tok, rpr = tok[1:-1], base + '<w:i/>'
        elif tok.startswith('`'): tok, rpr = tok[1:-1], base + '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/><w:sz w:val="16"/>'
        out.append(f'<w:r>{"<w:rPr>" + rpr + "</w:rPr>" if rpr else ""}<w:t xml:space="preserve">{esc(tok)}</w:t></w:r>')
    return ''.join(out)


def para(style, text='', extra='', raw_runs=None):
    return f'<w:p><w:pPr><w:pStyle w:val="{style}"/>{extra}</w:pPr>{raw_runs if raw_runs is not None else runs(text)}</w:p>'


# ---- images -----------------------------------------------------------------
media = []  # (zip name, bytes, rel id)
def jpeg_size(data):
    i = 2
    while i < len(data):
        marker, length = data[i + 1], struct.unpack('>H', data[i + 2:i + 4])[0]
        if marker in (0xC0, 0xC1, 0xC2):
            h, w = struct.unpack('>HH', data[i + 5:i + 9]); return w, h
        i += 2 + length
    raise ValueError('Not a JPEG')


def image_size(data):
    if data[:8] == b'\x89PNG\r\n\x1a\n': return struct.unpack('>II', data[16:24])
    return jpeg_size(data)


def drawing(path, width_in, alt):
    data = (HERE / path).read_bytes(); w, h = image_size(data)
    n = len(media) + 1; ext = Path(path).suffix.lower().lstrip('.').replace('jpg', 'jpeg')
    rid = f'rIdFig{n}'; media.append((f'word/media/fig{n}.{ext}', data, rid))
    cx = int(width_in * EMU); cy = int(cx * h / w)
    alt = esc(alt).replace('"', '&quot;')
    return (f'<w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{cx}" cy="{cy}"/>'
            f'<wp:docPr id="{100 + n}" name="Figure {n}" descr="{alt}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>'
            f'<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            f'<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="{n}" name="{Path(path).name}" descr="{alt}"/><pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr></pic:nvPicPr>'
            f'<pic:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>')


# ---- lists ------------------------------------------------------------------
new_nums = []
def list_num():
    nid = 100 + len(new_nums); new_nums.append(nid); return nid


# ---- body -------------------------------------------------------------------
def twips(inches): return int(round(inches * 1440))


def table(caption, widths, rows):
    tw = [twips(w) for w in widths]
    out = [para('TableCaption', caption)]
    grid = ''.join(f'<w:gridCol w:w="{w}"/>' for w in tw)
    body = []
    for ri, row in enumerate(rows):
        borders = '<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>' if ri == 0 else ('<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>' if ri == len(rows) - 1 else '')
        cells = ''.join(f'<w:tc><w:tcPr><w:tcW w:w="{tw[ci]}" w:type="dxa"/><w:tcBorders>{borders}</w:tcBorders></w:tcPr>'
                        f'{para("TableCell", extra="<w:ind w:firstLine=\"0\"/><w:jc w:val=\"left\"/>", raw_runs=runs(cell, "<w:b/>" if ri == 0 else ""))}</w:tc>'
                        for ci, cell in enumerate(row))
        body.append(f'<w:tr>{"<w:trPr><w:tblHeader/></w:trPr>" if ri == 0 else ""}{cells}</w:tr>')
    out.append(f'<w:tbl><w:tblPr><w:tblW w:w="{sum(tw)}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:bottom w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:insideH w:val="none" w:sz="0" w:space="0" w:color="auto"/><w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/></w:tblBorders><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>{grid}</w:tblGrid>{"".join(body)}</w:tbl>')
    return ''.join(out)


def figure(paths, width_in, caption, alt):
    if len(paths) == 1:
        img = para('Image', raw_runs=drawing(paths[0], width_in, alt))
    else:
        cw = twips(width_in + 0.15)
        cells = ''.join(f'<w:tc><w:tcPr><w:tcW w:w="{cw}" w:type="dxa"/></w:tcPr>{para("Image", raw_runs=drawing(p, width_in, alt + f" (part {i + 1} of {len(paths)})"))}</w:tc>' for i, p in enumerate(paths))
        img = (f'<w:tbl><w:tblPr><w:tblW w:w="{cw * len(paths)}" w:type="dxa"/><w:jc w:val="center"/><w:tblLook w:val="04A0" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr>'
               f'<w:tblGrid>{"".join(f"<w:gridCol w:w=\"{cw}\"/>" for _ in paths)}</w:tblGrid><w:tr><w:trPr><w:cantSplit/></w:trPr>{cells}</w:tr></w:tbl>')
    # The template's caption style keeps with the next paragraph, which drags the figure, caption, and the next
    # heading onto a new page together and leaves a gap; captions only need to stay with their figure.
    return img + para('FigureCaption', caption, '<w:keepNext w:val="0"/>')


def front():
    m = C.META; out = [para('Titledocument', m['title']), para('ShortTitle', m['short_title'])]
    if m.get('subtitle'): out.append(para('Subtitle', m['subtitle']))
    for name, aff in m['authors']:
        out += [para('Authors', raw_runs=runs(name, '<w:caps w:val="0"/>')), para('Affiliation', aff)]
    out.append(para('Abstract', m['abstract']))
    out.append(para('CCSDescription', raw_runs='<w:r><w:rPr><w:rStyle w:val="CCSHeadchar"/></w:rPr><w:t xml:space="preserve">CCS CONCEPTS </w:t></w:r>'
                    + runs('• ' + ' • '.join(m['ccs']), '<w:b w:val="0"/>')))
    out.append(para('KeyWords', raw_runs='<w:r><w:rPr><w:rStyle w:val="KeyWordHeadchar"/><w:b/></w:rPr><w:t xml:space="preserve">Additional Keywords and Phrases: </w:t></w:r>' + runs(m['keywords'])))
    out += [para('ACMRefHead', 'ACM Reference Format:'), para('ACMRef', m['acm_ref'])]
    return ''.join(out)


def body():
    out, after_head = [], True
    for b in C.BODY:
        kind = b[0]
        if kind in ('h1', 'h2', 'h3'):
            extra = '<w:tabs><w:tab w:val="clear" w:pos="360"/></w:tabs><w:ind w:left="432" w:hanging="432"/>' if kind == 'h1' else ''
            out.append(para({'h1': 'Head1', 'h2': 'Head2', 'h3': 'Head3'}[kind], b[1], extra)); after_head = True; continue
        if kind == 'p':
            out.append(para('PostHeadPara' if after_head else 'Para', b[1]))
        elif kind == 'list':
            nid = list_num()
            out += [para('ListParagraph', item, f'<w:numPr><w:ilvl w:val="0"/><w:numId w:val="{nid}"/></w:numPr>') for item in b[1]]
        elif kind == 'figure': out.append(figure(*b[1:]))
        elif kind == 'table': out.append(table(*b[1:]))
        elif kind == 'algorithm':
            out.append(para('AlgorithmCaption', b[1]))
            out += [para('Algorithm', line, '<w:keepNext/>' if i < len(b[2]) - 1 else '') for i, line in enumerate(b[2])]
        else: raise SystemExit(f'Unknown block type {kind}')
        after_head = kind in ('figure', 'table', 'algorithm') and after_head
    if C.ACKNOWLEDGMENTS:
        out += [para('AckHead', 'ACKNOWLEDGMENTS'), para('AckPara', C.ACKNOWLEDGMENTS)]
    out.append(para('ReferenceHead', 'REFERENCES'))
    out += [para('Bibentry', C.REFERENCES[k]) for k in order]
    return ''.join(out)


def build():
    zin = zipfile.ZipFile(TEMPLATE)
    doc = zin.read('word/document.xml').decode('utf8')
    head = doc[:doc.index('<w:body>') + len('<w:body>')]
    sect = re.findall(r'<w:sectPr[ >].*?</w:sectPr>', doc, flags=re.S)[-1]
    new_doc = head + front() + body() + sect + '</w:body></w:document>'

    rels = zin.read('word/_rels/document.xml.rels').decode('utf8')
    old_images = re.findall(r'<Relationship [^>]*Type="[^"]*/image" Target="([^"]+)"/>', rels)
    rels = re.sub(r'<Relationship [^>]*Type="[^"]*/image"[^>]*/>', '', rels)
    rels = rels.replace('</Relationships>', ''.join(f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{name[5:]}"/>' for name, _, rid in media) + '</Relationships>')

    numbering = zin.read('word/numbering.xml').decode('utf8')
    numbering = numbering.replace('</w:numbering>', ''.join(f'<w:num w:numId="{n}"><w:abstractNumId w:val="3"/><w:lvlOverride w:ilvl="0"><w:startOverride w:val="1"/></w:lvlOverride></w:num>' for n in new_nums) + '</w:numbering>')

    core = zin.read('docProps/core.xml').decode('utf8')
    core = re.sub(r'<dc:title>.*?</dc:title>', f'<dc:title>{esc(C.META["title"])}</dc:title>', core)
    core = re.sub(r'<dc:creator>.*?</dc:creator>', f'<dc:creator>{esc(", ".join(a for a, _ in C.META["authors"]))}</dc:creator>', core)

    skip = {'word/' + t for t in old_images}
    with zipfile.ZipFile(OUT_DOCX, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename in skip or item.filename.endswith('/'): continue
            data = zin.read(item.filename)
            if item.filename == 'word/document.xml': data = new_doc.encode('utf8')
            elif item.filename == 'word/_rels/document.xml.rels': data = rels.encode('utf8')
            elif item.filename == 'word/numbering.xml': data = numbering.encode('utf8')
            elif item.filename == 'docProps/core.xml': data = core.encode('utf8')
            zout.writestr(item, data)
        for name, data, _ in media: zout.writestr(name, data)
    words = len(re.sub(r'<[^>]+>', ' ', new_doc).split())
    print(f'Wrote {OUT_DOCX.name} ({words} words, {len(media)} images, {len(order)} references)')
    texts = []
    def walk(v):
        if isinstance(v, str): texts.append(v)
        elif isinstance(v, (list, tuple)): [walk(x) for x in v]
        elif isinstance(v, dict): [walk(x) for x in v.values()]
    walk([C.META, C.BODY, C.ACKNOWLEDGMENTS, C.REFERENCES])
    placeholders = sorted({m for t in texts for m in re.findall(r'\[(?!@)[^\]]*[A-Za-z][^\]]*\]', t)})
    if placeholders: print('Placeholders still to fill:', *placeholders, sep='\n  ')


def export_pdf():
    ps = (f"$w = New-Object -ComObject Word.Application; $w.Visible = $false; "
          f"try {{ $d = $w.Documents.Open('{OUT_DOCX}', $false, $true); $d.ExportAsFixedFormat('{OUT_PDF}', 17); "
          f"'PAGES=' + $d.ComputeStatistics(2); $d.Close($false) }} finally {{ $w.Quit() }}")
    r = subprocess.run(['powershell', '-NoProfile', '-Command', ps], capture_output=True, text=True, timeout=180)
    if r.returncode or 'PAGES=' not in r.stdout:
        print('PDF export failed (is Microsoft Word installed?):', r.stderr.strip()[:500]); return
    pages = int(r.stdout.split('PAGES=')[1].split()[0])
    print(f'Wrote {OUT_PDF.name} ({pages} pages; the limit is 4–6 including references)')


def layout():
    """Print, for each page, where the last line of text ends (to spot gaps left by figures that moved)."""
    ps = (f"$w = New-Object -ComObject Word.Application; $w.Visible = $false; "
          f"try {{ $d = $w.Documents.Open('{OUT_DOCX}', $false, $true); $d.Repaginate(); "
          f"foreach ($p in $d.Paragraphs) {{ $r = $p.Range; $e = $d.Range($r.End - 1, $r.End - 1); "
          f"'{{0}}|{{1}}|{{2}}' -f $e.Information(3), [math]::Round($e.Information(6)), ($r.Text.Trim() -replace '\\s+',' ').Substring(0, [math]::Min(50, $r.Text.Trim().Length)) }}; "
          f"$d.Close($false) }} finally {{ $w.Quit() }}")
    r = subprocess.run(['powershell', '-NoProfile', '-Command', ps], capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace')
    last = {}
    for line in r.stdout.splitlines():
        parts = line.split('|', 2)
        if len(parts) == 3 and parts[0].isdigit(): last[int(parts[0])] = (int(parts[1]), parts[2])
    for page, (y, text) in sorted(last.items()):
        print(f'page {page}: text ends {y / 72:.1f} in from top (page body ends near 9.0 in) — "{text}"')


if __name__ == '__main__':
    build()
    if '--no-pdf' not in sys.argv: export_pdf()
    if '--layout' in sys.argv: layout()
