"""Kit do Gui 8-bit para carrosséis e vídeos.

Gera, a partir dos desenhos de gerar.py, tudo o que uma ferramenta de design
ou de marketing precisa para usar o mascote sem redesenhá-lo:

  kit/png/            cada pose em PNG transparente (pixel de 16px)
  kit/gif/            animações em GIF transparente (pixel de 12px)
  kit/sprite-sheets/  quadros lado a lado, para animar em editor de vídeo
  kit/props/          paraquedas e notebook com mesa

Uso:  python3 kit.py
Requer: pip install pillow
"""
from pathlib import Path
from PIL import Image

from gerar import PALETA, DESENHOS

AQUI = Path(__file__).parent
KIT = AQUI / 'kit'


def trocar(linhas, trocas):
    """Reescreve trechos de linhas: (linha, coluna, texto)."""
    out = list(linhas)
    for y, x, txt in trocas:
        out[y] = out[y][:x] + txt + out[y][x + len(txt):]
    return out


# ---- quadros que faltavam: piscando e andando para todos os figurinos ----
PISCA = [(7, 3, "KsSSSSSSSSSSsK"), (8, 3, "KsSEESSSSEESsK")]
ANDA_TERNO = [(25, 0, ".....KPPK..KPPK......."), (26, 0, "....KFFFK..KFFFK......"), (27, 0, "....KKKKK..KKKKK......")]
ANDA_KIMONO = [(25, 0, ".....KGGK..KGGK......."), (26, 0, "....KSSSK..KSSSK......"), (27, 0, "....KKKKK..KKKKK......")]

FIGURINOS = {
    'terno': {
        'parado': DESENHOS['terno'],
        'piscando': DESENHOS['terno-piscando'],
        'acenando': DESENHOS['terno-acenando'],
        'andando': trocar(DESENHOS['terno'], ANDA_TERNO),
    },
    'kimono': {
        'parado': DESENHOS['kimono'],
        'piscando': trocar(DESENHOS['kimono'], PISCA),
        'acenando': DESENHOS['kimono-acenando'],
        'andando': trocar(DESENHOS['kimono'], ANDA_KIMONO),
    },
    'casual': {
        'parado': DESENHOS['casual'],
        'piscando': trocar(DESENHOS['casual'], PISCA),
    },
}
CABECA = {'parado': DESENHOS['terno'][:16], 'piscando': trocar(DESENHOS['terno'], PISCA)[:16]}

# faixas do jiu-jítsu: B é a faixa, X é a ponteira (preta nas coloridas, vermelha na preta)
FAIXAS = {
    'branca': {'B': '#FFFFFF', 'X': '#1E1B18'},
    'azul':   {'B': '#2F5FA8', 'X': '#1E1B18'},
    'roxa':   {'B': '#6B3FA0', 'X': '#1E1B18'},
    'marrom': {'B': '#6B4423', 'X': '#1E1B18'},
    'preta':  {'B': '#26221F', 'X': '#B8322A'},
}
# faixa branca sobre kimono branco sumiria: uma sombra em volta dela a destaca
SOMBRA_FAIXA_BRANCA = [(20, 6, "QQQQQQQQ"), (22, 6, "QQQ"), (22, 11, "QQQ")]

PROPS_PAL = {'K': '#1E1B18', 'R': '#C0705A', 'r': '#F1E9D6', 'l': '#B9B29F',
             'A': '#5A6173', 'T': '#C0705A', 't': '#F1E9D6', 'N': '#8A6A4E', 'n': '#6B5240'}
# mesmos desenhos da cena pós-créditos do site
PROPS = {
    'paraquedas': [
        "........KKKKKKKKKK........",
        "......KrRRRRrrrrRRRK......",
        "....KrrrRRRRrrrrRRRRrK....",
        "...KrrrrRRRRrrrrRRRRrrK...",
        "..KRrrrrRRRRrrrrRRRRrrrK..",
        ".KRRrrrrRRRRrrrrRRRRrrrrK.",
        ".KRRrrrrRRRRrrrrRRRRrrrrK.",
        ".KRRrrrrRRRRrrrrRRRRrrrrK.",
        "KKRRKKrrKKRRKKrrKKRRKKrrKK",
        ".l......................l.",
        ".l......................l.",
        ".l......................l.",
        "..l....................l..",
        "..l....................l..",
        "..l....................l..",
        "..l....................l..",
        "..l....................l..",
        "...l..................l...",
        "...l..................l...",
        "...l..................l...",
        "...l..................l...",
        "...l..................l...",
        "....l................l....",
        "....l................l....",
        "....l................l....",
        "....l................l....",
        "....l................l....",
        ".....l..............l.....",
        ".....l..............l.....",
        ".....l..............l.....",
        ".....l..............l.....",
        ".....l..............l.....",
        "......l............l......",
        "......l............l......",
        "......l............l......",
        "......l............l......",
        "......l............l......",
        ".......l..........l.......",
        ".......l..........l.......",
        ".......l..........l.......",
        "..........................",
    ],
    'notebook-mesa': [
        ".....KKKKKKKKKKKKKKKK.....",
        ".....KAAAAAAAAAAAAAAK.....",
        ".....KAAAAAAATAAAAAAK.....",
        ".....KAAAAAATtTAAAAAK.....",
        ".....KAAAAAAATAAAAAAK.....",
        ".....KAAAAAAAAAAAAAAK.....",
        "...KKKKKKKKKKKKKKKKKKKK...",
        "KKKKKKKKKKKKKKKKKKKKKKKKKK",
        "KNNNNNNNNNNNNNNNNNNNNNNNNK",
        "KKKKKKKKKKKKKKKKKKKKKKKKKK",
        "..KnK..............KnK....",
        "..KnK..............KnK....",
        "..KnK..............KnK....",
        "..KKK..............KKK....",
    ],
}


def imagem(linhas, escala, pal=None, fundo=None):
    pal = {**PALETA, **(pal or {})}
    im = Image.new('RGBA', (len(linhas[0]), len(linhas)), fundo or (0, 0, 0, 0))
    for y, linha in enumerate(linhas):
        for x, c in enumerate(linha):
            if c != '.':
                h = pal[c]
                im.putpixel((x, y), tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im.resize((im.width * escala, im.height * escala), Image.NEAREST)


def gif(quadros, duracoes, escala, pal, destino):
    """GIF com fundo transparente de verdade: paleta indexada, índice 0 vazio."""
    pal = {**PALETA, **(pal or {})}
    cores = sorted({c for q in quadros for linha in q for c in linha} - {'.'})
    indice = {c: i + 1 for i, c in enumerate(cores)}
    paleta = [255, 0, 255]
    for c in cores:
        paleta += [int(pal[c][i:i + 2], 16) for i in (1, 3, 5)]
    paleta += [0] * (768 - len(paleta))
    imgs = []
    for q in quadros:
        im = Image.new('P', (len(q[0]), len(q)), 0)
        im.putpalette(paleta)
        for y, linha in enumerate(q):
            for x, c in enumerate(linha):
                if c != '.':
                    im.putpixel((x, y), indice[c])
        imgs.append(im.resize((im.width * escala, im.height * escala), Image.NEAREST))
    imgs[0].save(destino, save_all=True, append_images=imgs[1:], duration=duracoes,
                 loop=0, transparency=0, disposal=2, optimize=False)


# roteiros das animações: (quadro, milissegundos)
ANIMACOES = {
    'acenando':     [('parado', 340), ('acenando', 340)],
    'piscando':     [('parado', 2400), ('piscando', 140)],
    'andando':      [('parado', 180), ('andando', 180)],
    'apresentacao': [('parado', 1400), ('piscando', 130), ('parado', 500), ('acenando', 320), ('parado', 320),
                     ('acenando', 320), ('parado', 320), ('acenando', 320), ('parado', 1000)],
}


def main():
    for pasta in ('png', 'gif', 'sprite-sheets', 'props'):
        (KIT / pasta).mkdir(parents=True, exist_ok=True)

    for fig, quadros in FIGURINOS.items():
        variantes = {'': {}} if fig != 'kimono' else {f'-faixa-{n}': p for n, p in FAIXAS.items()}
        for sufixo, pal in variantes.items():
            q = quadros
            if sufixo == '-faixa-branca':
                q = {k: trocar(v, SOMBRA_FAIXA_BRANCA) for k, v in quadros.items()}
            nome = f'gui-{fig}{sufixo}'
            for pose, linhas in q.items():
                imagem(linhas, 16, pal).save(KIT / 'png' / f'{nome}-{pose}.png')
            if 'acenando' in q:
                for anim, roteiro in ANIMACOES.items():
                    gif([q[p] for p, _ in roteiro], [ms for _, ms in roteiro], 12, pal, KIT / 'gif' / f'{nome}-{anim}.gif')
                folha = [imagem(q[p], 16, pal) for p in ('parado', 'piscando', 'acenando', 'andando')]
                sheet = Image.new('RGBA', (sum(i.width for i in folha), folha[0].height), (0, 0, 0, 0))
                for i, im in enumerate(folha):
                    sheet.alpha_composite(im, (i * im.width, 0))
                sheet.save(KIT / 'sprite-sheets' / f'{nome}-parado-piscando-acenando-andando.png')

    for pose, linhas in CABECA.items():
        imagem(linhas, 16).save(KIT / 'png' / f'gui-cabeca-{pose}.png')
    for nome, linhas in PROPS.items():
        imagem(linhas, 16, PROPS_PAL).save(KIT / 'props' / f'{nome}.png')
    print('kit gerado em', KIT)


if __name__ == '__main__':
    main()
