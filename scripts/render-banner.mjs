// Renders assets/banner.png from the full page's own hero, so the org card
// shows the same design as site/index.html (the card cannot run its CSS).
//
//   npx playwright install chromium   # once
//   python3 -m http.server 8766 --directory site &
//   node scripts/render-banner.mjs
//   # then round the corners:
//   convert assets/banner.png \( +clone -alpha extract -fill black -colorize 100 \
//     -fill white -draw "roundrectangle 0,0 3199,1165 56,56" \) -alpha off \
//     -compose CopyOpacity -composite -strip assets/banner.png
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2, colorScheme: "dark" });
await p.goto(process.argv[2] ?? "http://localhost:8766/", { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
// Banner = the hero alone: no app bar, no float animation, no copy buttons.
await p.addStyleTag({ content: `
  .appbar { display: none !important; }
  .mark { animation: none !important; }
  .hero { padding: 64px 0 60px !important; }
  .hero::before { inset: 0 !important; }
  .search-actions { display: none !important; }
  .search { padding-right: 20px !important; }
` });
await p.waitForTimeout(500);
const hero = await p.$(".hero");
const box = await hero.boundingBox();
console.log(`hero ${box.width}x${Math.round(box.height)} -> assets/banner.png`);
await hero.screenshot({ path: "assets/banner.png" });
await b.close();
