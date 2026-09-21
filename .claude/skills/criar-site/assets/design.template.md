# design.md — [Nome do projeto]

> Fonte única de verdade visual. Se um valor não está aqui, ele não deveria estar no CSS.
> Preencha com valores reais antes de escrever a primeira linha de HTML.

## 1. Identidade

- **Projeto:** [nome]
- **O que é:** [uma frase]
- **Público:** [quem compra/usa]
- **Ação principal:** [comprar / agendar / inscrever / contato]
- **Direção visual:** [ex.: editorial suíço · brutalismo refinado · orgânico/terroso]
- **Referências:** [links ou descrição]
- **Palavras que descrevem o site:** [3 adjetivos — ex.: preciso, sóbrio, confiante]
- **O que este site NÃO é:** [ex.: não é playful, não é corporativo genérico]

## 2. Cor

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#FAF9F6` | Fundo da página |
| `--color-surface` | `#FFFFFF` | Cards e blocos elevados |
| `--color-border` | `#E4E2DD` | Bordas e divisores |
| `--color-text` | `#111012` | Texto principal |
| `--color-text-muted` | `#6B6862` | Texto secundário |
| `--color-brand` | `#1B4D3E` | CTA, links, âncora de cor |
| `--color-brand-contrast` | `#FFFFFF` | Texto sobre a cor de marca |
| `--color-accent` | `#E4572E` | Destaque pontual |
| `--color-success` / `--color-error` | `#2F7D4F` / `#B3261E` | Estados |

**Regras de uso:** a cor de marca aparece em no máximo [X] pontos por tela. Fundo
escuro só em [seção]. Contraste mínimo verificado: 4.5:1 no corpo.

## 3. Tipografia

- **Display:** [ex.: Fraunces] — pesos [600, 700] — títulos
- **Corpo:** [ex.: Inter] — pesos [400, 500] — texto e UI
- **Escala (razão [1.333]):** 12 · 14 · 16 · 21 · 28 · 37 · 50 · 66 · 88
- **line-height:** corpo 1.65 · h2/h3 1.2 · display 1.0
- **letter-spacing:** display -0.03em · label +0.08em maiúsculo
- **Medida de leitura:** 65ch

## 4. Espaçamento e layout

- **Escala (base 4px):** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160
- **Padding de seção:** desktop [128px] · mobile [72px]
- **Largura máxima:** conteúdo [1200px] · leitura [700px]
- **Gutter mobile:** [24px]
- **Grid:** [12 colunas, gap 24px]

## 5. Forma

- **Raio:** [ex.: 4px em cards, 999px em botões] — linguagem escolhida: [reta/suave/pill]
- **Borda:** [1px solid var(--color-border)]
- **Sombras:** nível 1 `[0 1px 2px rgba(17,16,18,.06)]` · nível 2 `[0 8px 24px rgba(17,16,18,.08)]`
  (ou: sem sombra, só borda)

## 6. Movimento

- **Durações:** fast 150ms · base 250ms · slow 600ms
- **Easing:** entrada `cubic-bezier(0.16, 1, 0.3, 1)` · hover `ease-out`
- **Reveal:** opacity + translateY(24px), stagger 80ms
- **Efeitos usados:** [reveal, contadores, parallax leve, smooth scroll?]
- `prefers-reduced-motion` respeitado: sim

## 7. Componentes

- **Botão primário:** [fundo brand, texto contrast, padding 16/32, raio pill, hover:
  -1px + escurece 6%]
- **Botão secundário:** [borda 1px, fundo transparente]
- **Card:** [superfície, borda 1px, padding 32, sem sombra em repouso]
- **Input:** [borda 1px, raio 4, foco com anel da cor de marca]
- **Label/eyebrow:** [12px, maiúsculo, letter-spacing .08em, cor muted]

## 8. Estrutura da página

1. [Header fixo transparente que ganha fundo ao rolar]
2. [Hero — promessa + CTA + mídia]
3. [Prova social]
4. [...]
5. [CTA final]
6. [Footer]

## 9. Imagens e mídia

- **Estilo:** [fotografia com grão · ilustração vetorial · screenshots do produto]
- **Tratamento:** [duotone na cor de marca · sem filtro · cantos retos]
- **Origem:** [geradas por IA (quantidade a confirmar antes) · banco · do cliente]
