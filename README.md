# Cactus Wren Dental (concept site)

Single-page website for a fictional family dental office in Phoenix, AZ.
Built as a portfolio project by [Slobodan Dabic](https://sdabic.com).

**Live:** https://cactus-dental.slobodan.workers.dev

- One `index.html` with inline CSS and JavaScript, no build step. Hosted on Cloudflare Workers (static assets).
- 3D smile preview: a procedurally modelled molar (Three.js, marching cubes) that is scanned, reviewed and whitened as you scroll (GSAP ScrollTrigger). Loads lazily, with an SVG fallback and a static frame for reduced motion.
- Online booking in 4 steps with real open days and time slots (demo), prefilled from any offer or estimate.
- Insurance checker, cost estimator (PPO vs. membership vs. self-pay) and a membership plan.
- Live "open now" status based on Phoenix time.
- Fonts: Bricolage Grotesque and JetBrains Mono, self-hosted (SIL OFL).

Cactus Wren Dental, its team members, reviews and prices are fictional. Phone numbers use the fictional 555-01xx range. Photos are stock images; logos and names on uniforms were blurred.
