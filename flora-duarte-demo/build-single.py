"""Gera flora-duarte-site-completo.html: a página inteira num arquivo só,
com CSS, JS, fontes e fotos embutidos. Serve para mandar por WhatsApp ou
abrir direto no navegador sem a pasta.

Uso:  python3 build-single.py
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / 'flora-duarte-site-completo.html'
MIME = {'.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2'}


def data_uri(path: Path) -> str:
    b64 = base64.b64encode(path.read_bytes()).decode('ascii')
    return f'data:{MIME[path.suffix]};base64,{b64}'


def inline_script(path: Path) -> str:
    code = path.read_text(encoding='utf-8')
    # um "</script" dentro do código fecharia a tag antes da hora
    assert '</script' not in code.lower(), path
    return f'<script>\n{code}\n</script>'


html = (ROOT / 'index.html').read_text(encoding='utf-8')

# fontes vão embutidas no CSS: o preload apontaria para arquivos que não existem
html = re.sub(r'<link rel="preload" href="fonts/[^"]+"[^>]*>\n?', '', html)

css = (ROOT / 'css/style.css').read_text(encoding='utf-8')
css = re.sub(r'url\("\.\./(fonts/[^"]+)"\)', lambda m: f'url("{data_uri(ROOT / m.group(1))}")', css)
html = html.replace('<link rel="stylesheet" href="css/style.css">', f'<style>\n{css}\n</style>')

html = re.sub(r'<img src="(images/[^"]+)"', lambda m: f'<img src="{data_uri(ROOT / m.group(1))}"', html)

html = html.replace('<script src="vendor/lenis.min.js" defer></script>', inline_script(ROOT / 'vendor/lenis.min.js'))
html = html.replace('<script src="js/main.js" defer></script>', inline_script(ROOT / 'js/main.js'))

for sobra in ('href="css/', 'src="js/', 'src="vendor/', 'src="images/', '"../fonts/'):
    assert sobra not in html, f'ficou referência externa: {sobra}'

OUT.write_text(html, encoding='utf-8')
print(f'{OUT.name}: {OUT.stat().st_size / 1024:.0f} KB')
