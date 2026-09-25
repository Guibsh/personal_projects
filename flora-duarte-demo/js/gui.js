/* =========================================================
   GUI 8-BIT — o mascote de quem fez a página
   Aparece espiando pela página da Flora (faixa do topo, janela do hero,
   quiz, buquê) e ganha a cena inteira na cena pós-créditos, em cinco atos
   dirigidos pelo scroll: paraquedas, notebook, cabo do WhatsApp, conversa
   com a IA e, no fim, entra na moldura e vira a foto de verdade.

   O desenho é feito aqui mesmo, pixel por pixel: cada linha de texto é uma
   linha do sprite e cada letra, uma cor da paleta. Nenhuma imagem extra.
   Como no girassol e na rosa, tudo que depende do scroll rebobina quando a
   pessoa sobe a página.
   ========================================================= */
(() => {
  'use strict';

  const DADOS = {"pal":{"A":"#5A6173","C":"#DCE6DA","E":"#1E1B18","F":"#1E1B18","G":"#25D366","H":"#2B221D","J":"#434959","K":"#1E1B18","L":"#5A6173","M":"#2B221D","N":"#8A6A4E","O":"#D89882","P":"#333845","R":"#C0705A","S":"#EBBE9B","T":"#C0705A","U":"#F1E9D6","W":"#FFFDF8","Y":"#FFFFFF","f":"#655143","g":"#A08269","h":"#4A3A30","j":"#333845","l":"#B9B29F","m":"#7A3B2E","n":"#6B5240","r":"#F1E9D6","s":"#CF9B78","t":"#F1E9D6","w":"#FFFFFF"},"sprites":{"mascote":{"parado":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSESSSSESSsK.....","...KsSSESSSSESSsK.....","....KSSSSSsSSSSK......","....KSSMMMMMMSSK......","....KSmWWWWWWmSK......","....KSSmWWWWmSSK......","....KSSSmmmmSSSK......",".....KSSMMMMSSK.......","......KKKKKKKK........",".......KCSSCK.........","....KJJJCTTCJJJK......","...KJJJLCTTCLJJJK.....","...KJJJJLtTLJJJJK.....","...KJjJJJTtJJJjJK.....","...KJjJJJtTJJJjJK.....","...KJjJJJJJJJJjJK.....","...KSSKJJJJJJKSSK.....","....KKKPPKKPPKKK......","......KPPKKPPK........",".....KFFFKKFFFK.......",".....KKKKKKKKKK......."],"pisca":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSSSSSSSSSsK.....","...KsSEESSSSEESsK.....","....KSSSSSsSSSSK......","....KSSMMMMMMSSK......","....KSmWWWWWWmSK......","....KSSmWWWWmSSK......","....KSSSmmmmSSSK......",".....KSSMMMMSSK.......","......KKKKKKKK........",".......KCSSCK.........","....KJJJCTTCJJJK......","...KJJJLCTTCLJJJK.....","...KJJJJLtTLJJJJK.....","...KJjJJJTtJJJjJK.....","...KJjJJJtTJJJjJK.....","...KJjJJJJJJJJjJK.....","...KSSKJJJJJJKSSK.....","....KKKPPKKPPKKK......","......KPPKKPPK........",".....KFFFKKFFFK.......",".....KKKKKKKKKK......."],"acena":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSESSSSESSsK.....","...KsSSESSSSESSsK.....","....KSSSSSsSSSSK.KKK..","....KSSMMMMMMSSKKSSSK.","....KSmWWWWWWmSKKSSSK.","....KSSmWWWWmSSKKsSsK.","....KSSSmmmmSSSKKCCK..",".....KSSMMMMSSK.KJJK..","......KKKKKKKK.KJJK...",".......KCSSCK.KJJK....","....KJJJCTTCJJJJJK....","...KJJJLCTTCLJJJK.....","...KJJJJLtTLJJJJK.....","...KJjJJJTtJJJJJK.....","...KJjJJJtTJJJJJK.....","...KJjJJJJJJJJJJK.....","...KSSKJJJJJJJJK......","....KKKPPKKPPKKK......","......KPPKKPPK........",".....KFFFKKFFFK.......",".....KKKKKKKKKK......."],"anda":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSESSSSESSsK.....","...KsSSESSSSESSsK.....","....KSSSSSsSSSSK......","....KSSMMMMMMSSK......","....KSmWWWWWWmSK......","....KSSmWWWWmSSK......","....KSSSmmmmSSSK......",".....KSSMMMMSSK.......","......KKKKKKKK........",".......KCSSCK.........","....KJJJCTTCJJJK......","...KJJJLCTTCLJJJK.....","...KJJJJLtTLJJJJK.....","...KJjJJJTtJJJjJK.....","...KJjJJJtTJJJjJK.....","...KJjJJJJJJJJjJK.....","...KSSKJJJJJJKSSK.....","....KKKPPKKPPKKK......",".....KPPK..KPPK.......","....KFFFK..KFFFK......","....KKKKK..KKKKK......"]},"cabeca":{"parado":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSESSSSESSsK.....","...KsSSESSSSESSsK.....","....KSSSSSsSSSSK......","....KSSMMMMMMSSK......","....KSmWWWWWWmSK......","....KSSmWWWWmSSK......","....KSSSmmmmSSSK......",".....KSSMMMMSSK.......","......KKKKKKKK........"],"pisca":["......KKKKKKKK........",".....KHHHhhHHHK.......","....KHHHHHhhHHHK......","....KfHHHHHHHHfK......","....KgfSSSSSSfgK......","....KgHHSSSSHHgK......","...KsgSSSSSSSSgsK.....","...KsSSSSSSSSSSsK.....","...KsSEESSSSEESsK.....","....KSSSSSsSSSSK......","....KSSMMMMMMSSK......","....KSmWWWWWWmSK......","....KSSmWWWWmSSK......","....KSSSmmmmSSSK......",".....KSSMMMMSSK.......","......KKKKKKKK........"]},"paraquedas":{"parado":["........KKKKKKKKKK........","......KrRRRRrrrrRRRK......","....KrrrRRRRrrrrRRRRrK....","...KrrrrRRRRrrrrRRRRrrK...","..KRrrrrRRRRrrrrRRRRrrrK..",".KRRrrrrRRRRrrrrRRRRrrrrK.",".KRRrrrrRRRRrrrrRRRRrrrrK.",".KRRrrrrRRRRrrrrRRRRrrrrK.","KKRRKKrrKKRRKKrrKKRRKKrrKK",".l......................l.",".l......................l.",".l......................l.","..l....................l..","..l....................l..","..l....................l..","..l....................l..","..l....................l..","...l..................l...","...l..................l...","...l..................l...","...l..................l...","...l..................l...","....l................l....","....l................l....","....l................l....","....l................l....","....l................l....",".....l..............l.....",".....l..............l.....",".....l..............l.....",".....l..............l.....",".....l..............l.....","......l............l......","......l............l......","......l............l......","......l............l......","......l............l......",".......l..........l.......",".......l..........l.......",".......l..........l.......",".........................."]},"notebook":{"parado":[".....KKKKKKKKKKKKKKKK.....",".....KAAAAAAAAAAAAAAK.....",".....KAAAAAAATAAAAAAK.....",".....KAAAAAATtTAAAAAK.....",".....KAAAAAAATAAAAAAK.....",".....KAAAAAAAAAAAAAAK.....","...KKKKKKKKKKKKKKKKKKKK...","KKKKKKKKKKKKKKKKKKKKKKKKKK","KNNNNNNNNNNNNNNNNNNNNNNNNK","KKKKKKKKKKKKKKKKKKKKKKKKKK","..KnK..............KnK....","..KnK..............KnK....","..KnK..............KnK....","..KKK..............KKK...."]},"zap":{"parado":["....KKKKK....","..KKGGGGGKK..",".KGGGGGGGGGK.",".KGGwwGGGGGK.","KGGGwwGGGGGGK","KGGGwwGGGGGGK","KGGGGwwGGGGGK","KGGGGGwwGwwGK",".KGGGGGGwwwK.",".KGGGGGGGGGK.","KGGKKGGGGGKK.","KGKK.KKKKK...","KK..........."]},"orbe":{"parado":["....KKKK....","..KKOOOOKK..",".KOOUUUUOOK.",".KOUYYUUUOK.","KOUYUUUUUUOK","KOUUKUUKUUOK","KOUUKUUKUUOK","KOUUUUUUUUOK",".KOUUUUUUOK.",".KOOUUUUOOK.","..KKOOOOKK..","....KKKK...."],"pisca":["....KKKK....","..KKOOOOKK..",".KOOUUUUOOK.",".KOUYYUUUOK.","KOUYUUUUUUOK","KOUUUUUUUUOK","KOUUKUUKUUOK","KOUUUUUUUUOK",".KOUUUUUUOK.",".KOOUUUUOOK.","..KKOOOOKK..","....KKKK...."]}}};

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fino = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeFora = k => 1 - (1 - k) ** 3;

  /* ---- sprite: um <path> por cor, com as linhas agrupadas em faixas ----
     Cada quadro (parado, pisca, acena, anda) é um <g>; trocar de quadro é só
     mostrar um e esconder os outros. */
  const cacheSvg = {};
  const montarSvg = nome => {
    if (cacheSvg[nome]) return cacheSvg[nome];
    const quadros = DADOS.sprites[nome];
    const nomes = Object.keys(quadros);
    const w = quadros[nomes[0]][0].length;
    const h = quadros[nomes[0]].length;
    const grupos = nomes.map((q, i) => {
      const porCor = {};
      quadros[q].forEach((linha, y) => {
        for (let x = 0; x < w;) {
          const c = linha[x];
          if (c === '.') { x++; continue; }
          let fim = x;
          while (fim + 1 < w && linha[fim + 1] === c) fim++;
          const n = fim - x + 1;
          (porCor[c] = porCor[c] || []).push(`M${x} ${y}h${n}v1h-${n}z`);
          x = fim + 1;
        }
      });
      const paths = Object.entries(porCor).map(([c, d]) => `<path fill="${DADOS.pal[c]}" d="${d.join('')}"/>`).join('');
      return `<g data-q="${q}"${i ? ' style="display:none"' : ''}>${paths}</g>`;
    }).join('');
    cacheSvg[nome] = {
      w, h,
      svg: `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${grupos}</svg>`
    };
    return cacheSvg[nome];
  };

  const vivos = [];   // sprites que piscam, acenam e digitam
  document.querySelectorAll('.gui-sprite[data-gui]').forEach(el => {
    const s = montarSvg(el.dataset.gui);
    el.innerHTML = s.svg;
    el.style.setProperty('--w', s.w);
    el.style.setProperty('--h', s.h);
    if (el.dataset.px) el.style.setProperty('--px', el.dataset.px + 'px');
    el._gs = [...el.querySelectorAll('g')];
    el._q = el._gs[0].dataset.q;
    el._modo = 'parado';
    if (DADOS.sprites[el.dataset.gui].pisca) vivos.push(el);
  });

  const quadro = (el, nome) => {
    if (!el || el._q === nome) return;
    el._q = nome;
    for (const g of el._gs) g.style.display = g.dataset.q === nome ? '' : 'none';
  };

  /* ---- relógio dos gestos: piscar, acenar, digitar ----
     Um só intervalo para todos. "anda" fica de fora: quem escolhe o passo é
     o scroll, não o relógio. */
  let tique = 0;
  setInterval(() => {
    tique++;
    for (const el of vivos) {
      const modo = el._modo;
      if (modo === 'anda') continue;
      if (modo === 'acena') { quadro(el, (tique >> 1) % 2 ? 'acena' : 'parado'); continue; }
      el.classList.toggle('is-bob', modo === 'digita' && tique % 2 === 0);
      if (el._piscaAte > tique) quadro(el, 'pisca');
      else if (!reduced && Math.random() < .03) { el._piscaAte = tique + 1; quadro(el, 'pisca'); }
      else quadro(el, 'parado');
    }
  }, 170);

  const modo = (el, m) => { if (el) el._modo = m; };
  // passo de caminhada escolhido pela posição: rolar devagar anda devagar
  const passo = (el, x, px) => { el._modo = 'anda'; quadro(el, Math.floor(x / (px * 4)) % 2 ? 'anda' : 'parado'); };

  /* =========================================================
     ESPIADAS PELA PÁGINA DA FLORA
     ========================================================= */

  // na faixa do topo: a cabeça sobe, provoca e às vezes se esconde de novo
  const bar = document.getElementById('guiBar');
  if (bar) {
    const balao = bar.querySelector('.gui-balao');
    const FALAS = [
      'Psiu. Quem fez isso tá lá embaixo.',
      'Descendo com calma tem surpresa no caminho.',
      'Pode clicar à vontade. Não vou contar.'
    ];
    let fala = 0, tFala = 0;
    const falar = (txt, ms = 4600) => {
      balao.textContent = txt;
      bar.classList.add('is-falando');
      clearTimeout(tFala);
      tFala = setTimeout(() => bar.classList.remove('is-falando'), ms);
    };
    setTimeout(() => bar.classList.add('is-on'), reduced ? 0 : 1300);
    if (!reduced) setTimeout(() => { if (scrollY < innerHeight * .5) falar(FALAS[0]); }, 2800);
    bar.addEventListener('click', () => { fala = (fala + 1) % FALAS.length; falar(FALAS[fala]); });
    if (!reduced) {
      setInterval(() => {
        if (bar.classList.contains('is-falando') || scrollY > 120) return;
        bar.classList.remove('is-on');
        setTimeout(() => bar.classList.add('is-on'), 1100);
      }, 9000);
    }
  }

  // atrás da janela do topo: sai de trás da moldura, olha e volta
  const janela = document.getElementById('guiJanela');
  if (janela && !reduced) {
    let ultima = -Infinity;
    const espiar = () => {
      const agora = performance.now();
      if (agora - ultima < 12000 || scrollY > innerHeight * .45) return;
      ultima = agora;
      janela.classList.add('is-on');
      setTimeout(() => janela.classList.remove('is-on'), 2600);
    };
    setTimeout(espiar, 6500);
    setTimeout(espiar, 26000);
    if (fino) document.getElementById('scene')?.addEventListener('pointerenter', () => setTimeout(espiar, 700));
  }

  // quiz terminado e buquê completo: sobe, acena, fala e desce
  const subir = (el, ms) => {
    if (!el || reduced) return;
    const spr = el.querySelector('.gui-sprite');
    el.classList.add('is-on');
    modo(spr, 'acena');
    setTimeout(() => { el.classList.remove('is-on'); modo(spr, 'parado'); }, ms);
  };
  document.addEventListener('flora:quiz', () => setTimeout(() => subir(document.getElementById('guiQuiz'), 5200), 700));
  document.addEventListener('flora:buque', () => setTimeout(() => subir(document.getElementById('guiBuque'), 4600), 500));

  /* =========================================================
     CENA PÓS-CRÉDITOS
     ========================================================= */
  const creditos = document.getElementById('bastidores');
  if (!creditos) return;

  // 0 quando o topo do palco entra por baixo, 1 quando o fim dele passa do meio
  const progresso = (el, ini = .92, fim = .42) => {
    const r = el.getBoundingClientRect();
    const a = innerHeight * ini, b = innerHeight * fim;
    return clamp((a - r.top) / (r.height + a - b), 0, 1);
  };
  const unidade = el => parseFloat(getComputedStyle(el).getPropertyValue('--px')) || 3;

  const cenas = [...creditos.querySelectorAll('[data-cena]')].map(el => ({
    el,
    nome: el.dataset.cena,
    ator: el.querySelector('.gui-ator'),
    spr: el.querySelector('.gui-ator [data-gui="mascote"]'),
    px: unidade(el),
    p: -1
  }));

  const ATOS = {
    // ato 1: desce de paraquedas, pousa no título, o paraquedas vai embora
    paraquedas(c, p) {
      const para = c._para || (c._para = c.el.querySelector('.gui-paraquedas'));
      const k = easeFora(clamp(p / .5, 0, 1));
      const y = lerp(-(c.el.offsetHeight + innerHeight * .35), 0, k);
      const balanco = Math.sin(p * 16) * 14 * (1 - k);
      c.ator.style.opacity = p > .005 ? '1' : '0';
      c.ator.style.transform = `translate3d(${balanco.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const solta = clamp((p - .52) / .22, 0, 1);
      para.style.transform = `translate3d(${(solta * 40).toFixed(1)}px, ${(-solta * 160).toFixed(1)}px, 0)`;
      para.style.opacity = (1 - solta).toFixed(2);
      c.el.classList.toggle('is-fala', p > .64);
      modo(c.spr, p > .64 ? 'acena' : 'parado');
    },

    // ato 2: notebook, código subindo e um mini-site montando bloco a bloco
    obra(c, p) {
      const blocos = c._b || (c._b = [...c.el.querySelectorAll('.gui-mini__b')]);
      c.ator.style.opacity = clamp(p / .08, 0, 1).toFixed(2);
      c.el.classList.toggle('is-note', p > .1);
      c.el.classList.toggle('is-digitando', p > .16 && p < .76);
      c.el.querySelector('.gui-mini').classList.toggle('is-on', p > .2);
      blocos.forEach((b, i) => b.classList.toggle('is-on', p > .28 + i * .07));
      c.el.classList.toggle('is-pronto', p > .74);
      modo(c.spr, p > .78 ? 'acena' : p > .16 ? 'digita' : 'parado');
    },

    // ato 3: puxa o cabo do WhatsApp até o celular; conectou, as mensagens chegam
    cabo(c, p) {
      const px = c.px;
      const W = c.el.clientWidth, H = c.el.clientHeight;
      const cel = c._cel || (c._cel = c.el.querySelector('.gui-cel'));
      const path = c._fio || (c._fio = c.el.querySelector('.gui-fio path'));
      const msgs = c._m || (c._m = [...c.el.querySelectorAll('.gui-cel__msg')]);
      const celW = cel.offsetWidth, celH = cel.offsetHeight;
      const inicio = 13 * px + 4;                         // logo depois do ícone
      const chegada = W - celW - 20 * px;                 // parado ao lado do celular
      const k = clamp((p - .1) / .5, 0, 1);
      const x = lerp(inicio, chegada, easeFora(k));
      c.ator.style.opacity = clamp(p / .06, 0, 1).toFixed(2);
      c.ator.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      if (k > 0 && k < 1) passo(c.spr, x, px);
      else modo(c.spr, p > .86 ? 'acena' : 'parado');

      // o fio sai do ícone e vai até a mão; conectado, vai até a entrada do celular
      const ligado = k >= 1;
      const zx = 12 * px, zy = H - 8 * px;
      const fx = ligado ? W - celW : x + 17 * px;
      const fy = ligado ? H - celH * .32 : H - 5 * px;
      const barriga = Math.max(zy, fy) + 6 * px;
      path.setAttribute('d', `M${zx.toFixed(1)} ${zy.toFixed(1)} Q${((zx + fx) / 2).toFixed(1)} ${barriga.toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}`);
      c.el.classList.toggle('is-ligado', ligado);
      msgs.forEach((m, i) => m.classList.toggle('is-on', p > .64 + i * .08));
    },

    // ato 4: pergunta para a IA quem fez o site; a IA entrega, ele pede segredo
    ia(c, p) {
      const k = clamp((p - .04) / .22, 0, 1);
      const x = lerp(-60, 0, easeFora(k));
      c.ator.style.opacity = clamp(p / .06, 0, 1).toFixed(2);
      c.ator.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      if (k > 0 && k < 1) passo(c.spr, x + 60, c.px);
      else modo(c.spr, 'parado');
      c.el.classList.toggle('is-f1', p > .28 && p < .58);
      c.el.classList.toggle('is-digita', p > .42 && p < .58);
      c.el.classList.toggle('is-resp', p >= .58 && p < .8);
      c.el.classList.toggle('is-f2', p >= .8);
    }
  };

  /* ---- ato 5: a foto em pixel ganha resolução enquanto ele entra nela ---- */
  const palco = document.getElementById('guiFinal');
  const cartao = palco?.closest('.credits__card');
  const foto = palco?.querySelector('img');
  const tela = palco?.querySelector('.gui-pixelado');
  const atorFinal = palco?.querySelector('.gui-ator--final');
  const sprFinal = atorFinal?.querySelector('.gui-sprite');
  const sprFim = cartao?.querySelector('.gui-fim .gui-sprite');
  const ctx = tela?.getContext('2d');
  const miniatura = document.createElement('canvas');
  const mctx = miniatura.getContext('2d');
  const BLOCOS = [26, 20, 15, 11, 8, 6, 4, 3, 2];
  let blocoAtual = 0;

  const pixelar = b => {
    if (!tela || b === blocoAtual) return;
    if (b <= 1) { tela.style.opacity = '0'; blocoAtual = b; return; }
    if (!foto.complete || !foto.naturalWidth) return;   // tenta no próximo quadro
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = tela.clientWidth, H = tela.clientHeight;
    if (!W || !H) return;
    tela.width = Math.round(W * dpr);
    tela.height = Math.round(H * dpr);
    // mesmo recorte do object-fit: cover / object-position: 50% 20% da foto
    const iw = foto.naturalWidth, ih = foto.naturalHeight;
    const esc = Math.max(W / iw, H / ih);
    const sw = W / esc, sh = H / esc;
    const cw = Math.max(1, Math.round(W / b)), ch = Math.max(1, Math.round(H / b));
    miniatura.width = cw;
    miniatura.height = ch;
    mctx.imageSmoothingEnabled = true;
    mctx.drawImage(foto, (iw - sw) * .5, (ih - sh) * .2, sw, sh, 0, 0, cw, ch);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(miniatura, 0, 0, cw, ch, 0, 0, tela.width, tela.height);
    tela.style.opacity = '1';
    blocoAtual = b;
  };
  addEventListener('resize', () => { blocoAtual = 0; cenas.forEach(c => { c.px = unidade(c.el); c.p = -1; }); }, { passive: true });

  const pFinal = () => {
    const r = palco.getBoundingClientRect();
    const a = innerHeight * .95, b = innerHeight * .28;
    return clamp((a - r.top) / (a - b), 0, 1);
  };

  const atoFinal = p => {
    if (!palco) return;
    // nítida a partir de .82; antes disso, blocos cada vez menores
    const k = clamp((p - .28) / .54, 0, 1);
    pixelar(p >= .82 ? 1 : BLOCOS[Math.min(BLOCOS.length - 1, Math.floor(k * BLOCOS.length))]);

    const px = unidade(palco);
    const larg = palco.offsetWidth, eu = 22 * px;
    const anda = clamp((p - .04) / .28, 0, 1);
    const x = lerp(-larg * .75 - eu, (larg - eu) / 2, easeFora(anda));
    // dentro da moldura ele "falha" como sinal ruim e some na foto
    const some = clamp((p - .6) / .2, 0, 1);
    const falha = some > 0 && some < 1 && Math.floor(performance.now() / 70) % 2 ? .25 : 1;
    atorFinal.style.opacity = (p > .02 ? (1 - some) * falha : 0).toFixed(2);
    atorFinal.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
    if (anda > 0 && anda < 1) passo(sprFinal, x, px);
    else modo(sprFinal, 'parado');

    const fim = p > .88;
    cartao.classList.toggle('is-fim', fim);
    modo(sprFim, fim ? 'acena' : 'parado');
  };

  /* ---- barra "carregando criador": 0% no começo da cena, 100% com a foto nítida ---- */
  const hud = document.getElementById('guiHud');
  const hudTxt = hud?.querySelector('.gui-hud__txt');
  const hudPct = hud?.querySelector('.gui-hud__pct');
  let pctAtual = -1;
  const pintarHud = () => {
    if (!hud || !palco) return;
    const a = creditos.getBoundingClientRect().top - innerHeight * .55;
    const b = palco.getBoundingClientRect().top - innerHeight * .38;
    const pct = Math.floor(clamp(-a / (b - a), 0, 1) * 100);
    if (pct === pctAtual) return;
    pctAtual = pct;
    hud.style.setProperty('--pct', pct + '%');
    hudPct.textContent = pct + '%';
    const pronto = pct >= 100;
    hud.classList.toggle('is-completo', pronto);
    hudTxt.textContent = pronto ? 'Criador carregado' : 'Carregando criador';
  };

  /* ---- laço: só roda com a cena por perto ---- */
  let ativo = false, raf = 0;
  const laco = () => {
    raf = 0;
    if (!ativo) return;
    for (const c of cenas) {
      const p = reduced ? 1 : progresso(c.el);
      if (Math.abs(p - c.p) < .0008) continue;
      c.p = p;
      ATOS[c.nome]?.(c, p);
    }
    atoFinal(reduced ? 1 : pFinal());
    pintarHud();
    raf = requestAnimationFrame(laco);
  };
  const buque = document.getElementById('guiBuque');
  new IntersectionObserver(([e]) => {
    ativo = e.isIntersecting;
    // a cena é dele: o recado do buquê não fica pendurado no canto
    if (ativo) buque?.classList.remove('is-on');
    if (ativo && !raf) raf = requestAnimationFrame(laco);
  }, { rootMargin: '300px 0px' }).observe(creditos);
})();
