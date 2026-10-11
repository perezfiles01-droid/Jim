# Papel Tales: animation toolkit research (October 2026)

## Standing rules added from the user
- **New characters in every story.** Never reuse a previous pair. Used so far:
  Lola Bining (carabao) & Tikoy (tarsier) for Fiesta; Grandma Tula (tortoise) & the fox for Once Again;
  Lolo Kanor (Philippine eagle) & Pina (pilandok mouse-deer) for The Aswang.
- **Mix cut-out styles per scene**, not one look. References the user approved:
  cardboard plus crumpled paper (Papel Tales sign), crayon on construction paper, watercolour cut-outs,
  Lotte Reiniger style silhouettes (blue moon, amber sunset), geometric wood-grain panels,
  gritty grey jointed cut-outs and Czech-style painted faces.
- Title card: crumpled white "PAPEL TALES" sign hung on strings over cardboard, cut-out letters, scissors.

## Free tools worth adding (all verified free or open source)

| Tool | Licence | What it would add | How it fits |
| --- | --- | --- | --- |
| **Remotion** (github.com/remotion-dev/remotion) | Free for individuals and companies of up to 3 people; 4+ need a paid licence | Write each scene as a React component; frame-exact timing; built-in renderer with parallel rendering (much faster than our one-frame-at-a-time Playwright loop) | Best long-term home. Our canvas `draw(t)` functions can be wrapped in a `<Canvas>` component almost unchanged |
| @remotion/transitions | same | Ready wipes, slides, page-flip, clock-wipe between scenes | Replaces hand-coded crossfade, adds a real "paper flip" |
| @remotion/noise, @remotion/paths, @remotion/shapes, @remotion/motion-blur | same | Noise-driven wobble, SVG path drawing on, shapes, motion blur on fast flying creatures | Motion blur on the manananggal wings, path draw-on for maps |
| @remotion/lottie + **lottie-web** (MIT) | MIT | Play Lottie animations; thousands of free ones on LottieFiles (check each file's licence) | Fire, smoke, birds, sparkles without drawing them by hand |
| **GSAP** (github.com/greensock/GSAP) | Free incl. all former paid plugins since 2025 (Standard Licence; not for building competing no-code tools) | MorphSVG (shapeshifting dog to pig to bird), SplitText (letters fly in), CustomEase | Shapeshifter morphs, title-card letter cut-outs |
| **rough.js** (MIT) | MIT | Hand-drawn, sketchy fills and outlines on canvas | Crayon and pencil scenes look truly hand-made |
| **perfect-freehand** (MIT) | MIT | Pressure-style ink strokes | Handwriting and brush lines in scrolls |
| **matter.js** (MIT) | MIT | 2D physics | Paper scraps falling, confetti, leaves settling naturally |
| SVG `feTurbulence` / `feDisplacementMap` (browser built-in) | n/a | Torn and deckled paper edges, watercolour bleed | Makes every cut-out edge look hand-cut |
| **three.js** (MIT) | MIT | Real depth: layered paper planes with parallax and soft lighting | A true "paper diorama" multiplane camera |
| simplex-noise (MIT) | MIT | Already used for camera drift | keep |

## Recommendation
1. Next story: move the pipeline to Remotion (allowed, the channel is an individual's), keep
   Kokoro narration and the same timeline JSON, and render with `npx remotion render --concurrency`.
2. Add rough.js and SVG torn-edge filters first: the biggest visual gain for the least work.
3. Use GSAP MorphSVG for shapeshifting scenes and @remotion/transitions for scene changes.

Sources: remotion.dev/license, remotion.dev/docs/license/faq, webflow.com/blog/gsap-becomes-free,
gsap.com/community/standard-license, each library's GitHub README.
