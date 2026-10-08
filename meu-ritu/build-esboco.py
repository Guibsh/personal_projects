"""Gera esboco-meu-ritu.html: a página inteira em um arquivo só (CSS, JS, fotos e
fontes embutidos), para enviar por WhatsApp/e-mail e abrir direto no celular.

Para o arquivo ficar leve (alguns visualizadores recusam arquivos com mais de
~2 MB), as imagens são convertidas para WebP só aqui; o site em si continua
usando os arquivos originais de assets/."""
import base64, mimetypes, pathlib, re, subprocess, tempfile

root = pathlib.Path(__file__).parent
LIMIT = 1.8e6  # margem abaixo de 2 MB
tmp = pathlib.Path(tempfile.mkdtemp())
cache = {}

def to_webp(path):
    src = root / path
    out = tmp / (src.stem + ".webp")
    if src.suffix == ".png":
        args = ["-resize", "420x>", "-quality", "82", "-define", "webp:alpha-quality=90"]
    elif src.name == "parede-quente.jpg":   # foto do topo: aparece grande no computador
        args = ["-resize", "1000x>", "-quality", "84"]
    else:
        args = ["-resize", "1000x>", "-quality", "72"]
    subprocess.run(["convert", str(src), *args, "-strip", str(out)], check=True)
    return out

def data_uri(path):
    if path in cache:
        return cache[path]
    if path.endswith((".jpg", ".jpeg", ".png")):
        mime, data = "image/webp", to_webp(path).read_bytes()
    else:
        mime = mimetypes.guess_type(path)[0] or ("font/woff2" if path.endswith(".woff2") else "application/octet-stream")
        data = (root / path).read_bytes()
    cache[path] = f"data:{mime};base64," + base64.b64encode(data).decode()
    return cache[path]

html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
css = re.sub(r'url\("(assets/[^"]+)"\)', lambda m: f'url("{data_uri(m.group(1))}")', css)

# Itens que não servem num arquivo enviado por mensagem (só pesariam)
html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)
html = re.sub(r'\s*<meta property="og:image"[^>]*>', "", html)
html = re.sub(r'\s*<link rel="icon"[^>]*>', "", html)

html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
for js in ("scroll-kit.js", "main.js", "fx.js"):
    code = (root / js).read_text(encoding="utf-8").replace("</script", "<\\/script")
    html = html.replace(f'<script src="{js}" defer></script>', f"<script>\n{code}\n</script>")
# Scripts inline rodam na hora: o DOM acima já existe porque estão no fim do body.
html = re.sub(r'(src|href|content)="(assets/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)

out = root / "esboco-meu-ritu.html"
out.write_text(html, encoding="utf-8")
size = out.stat().st_size
print(out.name, f"{size / 1e6:.2f} MB")
if size > LIMIT:
    raise SystemExit(f"ATENÇÃO: arquivo com {size / 1e6:.2f} MB, acima do limite de {LIMIT / 1e6:.1f} MB")
