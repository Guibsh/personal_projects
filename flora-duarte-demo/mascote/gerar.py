"""Gui 8-bit: exporta o mascote em PNG com fundo transparente, pronto para post.

Cada desenho é uma lista de linhas; cada letra é a cor de um pixel (veja PALETA)
e o ponto é transparente. Para criar uma roupa nova, copie um corpo, troque as
letras e rode de novo. A cabeça (as 16 primeiras linhas) é a mesma em todos.

Uso:  python3 gerar.py            -> gera os PNGs em ./png (pixel de 16px)
      python3 gerar.py 24         -> pixel de 24px (imagem maior)
Requer: pip install pillow
"""
import sys
from pathlib import Path
from PIL import Image

PALETA = {
 "K": "#1E1B18",
 "H": "#2B221D",
 "h": "#4A3A30",
 "S": "#EBBE9B",
 "s": "#CF9B78",
 "E": "#1E1B18",
 "M": "#2B221D",
 "W": "#FFFDF8",
 "m": "#7A3B2E",
 "J": "#434959",
 "j": "#333845",
 "L": "#5A6173",
 "C": "#DCE6DA",
 "T": "#C0705A",
 "t": "#F1E9D6",
 "P": "#333845",
 "F": "#1E1B18",
 "R": "#C0705A",
 "r": "#A65D49",
 "c": "#F9F4E6",
 "D": "#3E4C6B",
 "d": "#2F3A54",
 "N": "#F4EFE3",
 "f": "#655143",
 "g": "#A08269",
 "G": "#F2EEE5",
 "Q": "#CFC8B8",
 "B": "#26221F",
 "X": "#B8322A"
}

DESENHOS = {
 "terno": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSESSSSESSsK.....",
  "...KsSSESSSSESSsK.....",
  "....KSSSSSsSSSSK......",
  "....KSSMMMMMMSSK......",
  "....KSmWWWWWWmSK......",
  "....KSSmWWWWmSSK......",
  "....KSSSmmmmSSSK......",
  ".....KSSMMMMSSK.......",
  "......KKKKKKKK........",
  ".......KCSSCK.........",
  "....KJJJCTTCJJJK......",
  "...KJJJLCTTCLJJJK.....",
  "...KJJJJLtTLJJJJK.....",
  "...KJjJJJTtJJJjJK.....",
  "...KJjJJJtTJJJjJK.....",
  "...KJjJJJJJJJJjJK.....",
  "...KSSKJJJJJJKSSK.....",
  "....KKKPPKKPPKKK......",
  "......KPPKKPPK........",
  ".....KFFFKKFFFK.......",
  ".....KKKKKKKKKK......."
 ],
 "terno-acenando": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSESSSSESSsK.....",
  "...KsSSESSSSESSsK.....",
  "....KSSSSSsSSSSK.KKK..",
  "....KSSMMMMMMSSKKSSSK.",
  "....KSmWWWWWWmSKKSSSK.",
  "....KSSmWWWWmSSKKsSsK.",
  "....KSSSmmmmSSSKKCCK..",
  ".....KSSMMMMSSK.KJJK..",
  "......KKKKKKKK.KJJK...",
  ".......KCSSCK.KJJK....",
  "....KJJJCTTCJJJJJK....",
  "...KJJJLCTTCLJJJK.....",
  "...KJJJJLtTLJJJJK.....",
  "...KJjJJJTtJJJJJK.....",
  "...KJjJJJtTJJJJJK.....",
  "...KJjJJJJJJJJJJK.....",
  "...KSSKJJJJJJJJK......",
  "....KKKPPKKPPKKK......",
  "......KPPKKPPK........",
  ".....KFFFKKFFFK.......",
  ".....KKKKKKKKKK......."
 ],
 "terno-piscando": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSSSSSSSSSsK.....",
  "...KsSEESSSSEESsK.....",
  "....KSSSSSsSSSSK......",
  "....KSSMMMMMMSSK......",
  "....KSmWWWWWWmSK......",
  "....KSSmWWWWmSSK......",
  "....KSSSmmmmSSSK......",
  ".....KSSMMMMSSK.......",
  "......KKKKKKKK........",
  ".......KCSSCK.........",
  "....KJJJCTTCJJJK......",
  "...KJJJLCTTCLJJJK.....",
  "...KJJJJLtTLJJJJK.....",
  "...KJjJJJTtJJJjJK.....",
  "...KJjJJJtTJJJjJK.....",
  "...KJjJJJJJJJJjJK.....",
  "...KSSKJJJJJJKSSK.....",
  "....KKKPPKKPPKKK......",
  "......KPPKKPPK........",
  ".....KFFFKKFFFK.......",
  ".....KKKKKKKKKK......."
 ],
 "kimono": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSESSSSESSsK.....",
  "...KsSSESSSSESSsK.....",
  "....KSSSSSsSSSSK......",
  "....KSSMMMMMMSSK......",
  "....KSmWWWWWWmSK......",
  "....KSSmWWWWmSSK......",
  "....KSSSmmmmSSSK......",
  ".....KSSMMMMSSK.......",
  "......KKKKKKKK........",
  "........KSSK..........",
  "....KGGGQSSQGGGK......",
  "...KGGGGGQSQGGGGK.....",
  "...KGGGGGGQGGGGGK.....",
  "...KGQGGGGQGGGQGK.....",
  "...KGQBBBBBBBBQGK.....",
  "...KGQGGGBBGGGQGK.....",
  "...KSSKGBGGBGKSSK.....",
  "....KKKGXKKXGKKK......",
  "......KGGKKGGK........",
  ".....KSSSKKSSSK.......",
  ".....KKKKKKKKKK......."
 ],
 "kimono-acenando": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSESSSSESSsK.....",
  "...KsSSESSSSESSsK.....",
  "....KSSSSSsSSSSK.KKK..",
  "....KSSMMMMMMSSKKSSSK.",
  "....KSmWWWWWWmSKKSSSK.",
  "....KSSmWWWWmSSKKsSsK.",
  "....KSSSmmmmSSSKKSSK..",
  ".....KSSMMMMSSK.KGGK..",
  "......KKKKKKKK.KGGK...",
  "........KSSK..KGGK....",
  "....KGGGQSSQGGGGGK....",
  "...KGGGGGQSQGGGGK.....",
  "...KGGGGGGQGGGGGK.....",
  "...KGQGGGGQGGGGGK.....",
  "...KGQBBBBBBBBBBK.....",
  "...KGQGGGBBGGGGGK.....",
  "...KSSKGBGGBGGGK......",
  "....KKKGXKKXGKKK......",
  "......KGGKKGGK........",
  ".....KSSSKKSSSK.......",
  ".....KKKKKKKKKK......."
 ],
 "casual": [
  "......KKKKKKKK........",
  ".....KHHHhhHHHK.......",
  "....KHHHHHhhHHHK......",
  "....KfHHHHHHHHfK......",
  "....KgfSSSSSSfgK......",
  "....KgHHSSSSHHgK......",
  "...KsgSSSSSSSSgsK.....",
  "...KsSSESSSSESSsK.....",
  "...KsSSESSSSESSsK.....",
  "....KSSSSSsSSSSK......",
  "....KSSMMMMMMSSK......",
  "....KSmWWWWWWmSK......",
  "....KSSmWWWWmSSK......",
  "....KSSSmmmmSSSK......",
  ".....KSSMMMMSSK.......",
  "......KKKKKKKK........",
  "........KSSK..........",
  "....KRRRKrrKRRRK......",
  "...KRRRRRRRRRRRRK.....",
  "...KRrRcRRRcRRrRK.....",
  "...KSKRcRRcccRKSK.....",
  "...KSKRcRRcRcRKSK.....",
  "...KSKDDDDDDDDKSK.....",
  "...KSSKDDdDDDKSSK.....",
  "....KKKDDKKDDKKK......",
  "......KDDKKDDK........",
  ".....KNNNKKNNNK.......",
  ".....KKKKKKKKKK......."
 ]
}

def desenhar(linhas, escala):
    im = Image.new('RGBA', (len(linhas[0]), len(linhas)), (0, 0, 0, 0))
    for y, linha in enumerate(linhas):
        for x, c in enumerate(linha):
            if c != '.':
                h = PALETA[c]
                im.putpixel((x, y), tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (255,))
    return im.resize((im.width * escala, im.height * escala), Image.NEAREST)

if __name__ == '__main__':
    escala = int(sys.argv[1]) if len(sys.argv) > 1 else 16
    saida = Path(__file__).parent / 'png'
    saida.mkdir(exist_ok=True)
    for nome, linhas in DESENHOS.items():
        desenhar(linhas, escala).save(saida / f'gui-{nome}.png')
        print('ok', nome)
