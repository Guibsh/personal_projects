"""Gera esboco-meu-ritu.html: a página inteira em um arquivo só (CSS, JS, fotos e
fontes embutidos), para enviar por WhatsApp/e-mail e abrir direto no celular."""
import base64, mimetypes, pathlib, re

root = pathlib.Path(__file__).parent

def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or ("font/woff2" if path.endswith(".woff2") else "application/octet-stream")
    return f"data:{mime};base64," + base64.b64encode((root / path).read_bytes()).decode()

html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
css = re.sub(r'url\("(assets/[^"]+)"\)', lambda m: f'url("{data_uri(m.group(1))}")', css)

html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)
html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
for js in ("scroll-kit.js", "main.js"):
    code = (root / js).read_text(encoding="utf-8").replace("</script", "<\\/script")
    html = html.replace(f'<script src="{js}" defer></script>', f"<script>\n{code}\n</script>")
# Scripts inline rodam na hora: o DOM acima já existe porque estão no fim do body.
html = re.sub(r'(src|href|content)="(assets/[^"]+)"', lambda m: f'{m.group(1)}="{data_uri(m.group(2))}"', html)

out = root / "esboco-meu-ritu.html"
out.write_text(html, encoding="utf-8")
print(out.name, f"{out.stat().st_size / 1e6:.1f} MB")
