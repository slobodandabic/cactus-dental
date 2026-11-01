# CLAUDE.md: pravila za sve sajtove (Slobodan Dabić / Gazda)

Ovaj fajl stoji u svakom repou. Pročitaj ga pre svakog rada na sajtu.

## Ko sam i kako radimo
- Ja sam Slobodan Dabić (Gazda). Pravim sajtove za male firme: demo sajtove za US tržište, klijente u Srbiji i svoj portfolio **sdabic.com**. Za US publiku se potpisujem kao „Slobodan Dabic”, bez dijakritika.
- Odgovaraj mi na **srpskom** (latinica). Kratko i jasno, bez nabrajanja koraka koje si već uradio.
- Sajtove radiš direktno u repou. Kad završiš: proveri, napravi commit sa jasnom porukom, pa **push**. Push sam objavljuje sajt na Cloudflare za oko 30 sekundi.
- Pre većih izmena (redizajn, brisanje fajlova, menjanje domena ili DNS-a) prvo me pitaj.

## Tehnologija i format
- Vanilla **HTML, CSS i JavaScript**, **Tailwind CSS** (kompajliran i ubačen inline) i CSS promenljive.
- Jedan samostalan **`index.html`** sa svim CSS-om i JS-om inline. Fontovi i slike su u svojim folderima (`fonts/`, `images/`).
- Animacije: **GSAP** (ScrollTrigger, SplitText…) preko CDN script tagova. Za 3D **Three.js**, samo za jedan upečatljiv trenutak, sa lazy učitavanjem i običnom slikom kao rezervom. Bez React-a i R3F-a.
- Za dizajn koristi skillove **design-taste-frontend** (TasteSkill) i **gsap-***. Cilj: sajt ne sme da izgleda kao „generički AI sajt”.
- Demo sajtovi smeju da budu „award-level”. Sajtovi za prave klijente: prvo jasnoća, brzina i poziv na kontakt, efekti tek posle toga.

## Hosting (sve na Cloudflare-u, od novembra 2026)
- Cloudflare nalog: **slobodan@sdabic.com**. Svaki sajt je Worker sa statičkim fajlovima (`wrangler.jsonc` sa `"assets": { "directory": "./" }`).
- `.assetsignore` mora da sakrije: `wrangler.jsonc`, `.assetsignore`, `.gitattributes`, `README.md`, `vercel.json`, `.git`, `.github`, `.wrangler`.
- Zaglavlja idu u `_headers` (ne `vercel.json`): fontovi `max-age=31536000, immutable`, slike oko 7 dana, plus `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN` i `Permissions-Policy`.
- GitHub nalog: **slobodandabic**. Repoi su javni.
- Vercel više ne koristimo za nove sajtove.
- Domen klijenta se registruje na ime klijenta.

## Obavezni spisak (svaki sajt, bez izuzetka)
### SEO osnova
- Jedinstven `<title>` sa ključnom reči i lokacijom (50–60 znakova), meta description oko 150 znakova, **tačno jedan H1** i logični H2/H3.
- `canonical` sa **punom adresom**. Kod višejezičnih sajtova: `hreflang` + `x-default` i prekidač za jezik.
- `sitemap.xml` (sa hreflang alternativama) i `robots.txt` sa linkom na sitemap.
- Open Graph + Twitter tagovi. `og:image` 1200×630 sa **punom URL adresom**, plus `og:image:alt`, `og:url`, `og:site_name` i `og:locale`.
- Favicon (SVG), `apple-touch-icon` i `site.webmanifest`.
- Google Search Console sa poslatim sitemap-om; za lokalne firme Google Business Profile.

### AI / agentic SEO
- `llms.txt` u korenu sajta: ko je firma, usluge, cene, proces, projekti/linkovi, utisci, kontakt.
- `robots.txt` eksplicitno dozvoljava: OAI-SearchBot, GPTBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended i Applebot-Extended.
- JSON-LD `@graph`: Person i/ili LocalBusiness/ProfessionalService (adresa, areaServed, telefon, email, priceRange, offers), WebSite/WebPage, FAQPage, ItemList radova, Review samo ako je pravi i prikazan na stranici, sameAs i knowsLanguage.
- Sav ključni sadržaj (cene, FAQ, kontakt, utisci) mora da se čita i bez JavaScript-a.

### Brzina i kvalitet
- Lighthouse **90+ u sve četiri kategorije**, na telefonu i na desktopu.
- Kontrast WCAG AA (4.5:1), uključujući beli tekst na obojenim dugmićima. Pristupačno ime mora da odgovara vidljivom tekstu. Dekorativne slike imaju `alt=""`.
- Slike su WebP, sa zadatim `width`/`height` i lazy učitavanjem ispod prvog ekrana. Hero slika dobija srcset i `fetchpriority="high"`.
- Fontovi su **self-hosted** (latin + latin-ext za naša slova) i preload-ovani. **Nikad Google Fonts.**
- Kad menjaš sliku ili CSS/JS pod istim imenom fajla, dodaj `?v=N` da se ne prikaže stara verzija iz keša.
- Animacije sporo i suptilno. Uvek poštuj `prefers-reduced-motion`.
- Stranica 404 u stilu sajta, sa `noindex`.

### Kontakt i konverzija
- Poziv i WhatsApp jednim dodirom. Forma koja stvarno šalje (Web3Forms), sa honeypot poljem, porukom o uspehu/grešci i tekstom koji se sam popuni kad posetilac klikne paket ili ponudu.
- Na telefonu: kontakt traka zalepljena za dno ekrana, koja se sakrije blizu kontakt sekcije. Dugme „na vrh” sa prstenom napretka nikad ne sme da je prekrije.
- Utisci samo pravi, sa imenom. Ako su prevedeni, uz napomenu „translated from Serbian”.

### Analitika
- Cloudflare Web Analytics. Moje posete se isključuju sa `?me=1` (a uključuju sa `?me=0`).
- Na sajtovima klijenata u futeru ide link na **sdabic.com**.

### Demo (concept) sajtovi
- U futeru napomena da je projekat koncept i potpis „Designed & built by Slobodan Dabic”. Telefoni iz opsega 555.

## Portfolio (sdabic.com, repo `slobodandabic`)
- Fontovi: **Fraunces** (naslovi, brojevi, sat), **Schibsted Grotesk** (tekst, tagovi) i **JetBrains Mono** samo za oznake sekcija. Ne dodavati četvrti font.
- Dizajn: topao, miran, animacije suptilne. Bez linkova na GitHub i kod.
- Slike projekata: `images/<ime>-full.webp` (900 px širine, ceo sajt), `<ime>-mfull.webp` (280 px, telefon) i `<ime>-thumb.webp` (180×112). Posle zamene podigni `?v=N`.
- Kartice projekata postoje u **dve verzije**: `index.html` (EN) i `sr/index.html` (SR). Menjaj obe, plus `llms.txt` i JSON-LD.
