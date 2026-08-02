import { Request, Response } from 'express';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapTextForSvg(text: string, maxCharsPerLine: number = 32, maxLines: number = 3): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return ["CampusAI Admission News"];

  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + " " + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + " " + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length === maxLines - 1) {
        break;
      }
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const usedWordsCount = lines.join(" ").split(/\s+/).length;
  if (usedWordsCount < words.length && lines.length > 0) {
    const lastIdx = lines.length - 1;
    lines[lastIdx] = lines[lastIdx].replace(/[.,!?;:]?$/, '...');
  }

  return lines;
}

export function generateOgImageSvg(titleParam?: string, categoryParam?: string, dateParam?: string): string {
  const rawTitle = titleParam ? titleParam.trim() : "CampusAI Admission News & Updates";
  const category = categoryParam ? categoryParam.trim().toUpperCase() : "ADMISSION NEWS";
  const dateStr = dateParam ? dateParam.trim() : "2026/2027 ADMISSION SEASON";

  const cleanTitle = rawTitle.replace(/[\n\r]+/g, ' ');
  const lines = wrapTextForSvg(cleanTitle, 32, 3);

  const startY = lines.length === 1 ? 310 : lines.length === 2 ? 275 : 235;
  const lineHeight = 62;

  const titleSvgText = lines.map((line, idx) => {
    const yPos = startY + (idx * lineHeight);
    const safeLine = escapeXml(line);
    return `<text x="80" y="${yPos}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="900" fill="#FFFFFF" letter-spacing="-0.02em">${safeLine}</text>`;
  }).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#030712" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>

    <!-- Blue / Green Brand Gradient -->
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#2563eb" />
      <stop offset="50%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>

    <!-- Badge Gradient -->
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>

    <!-- Ambient Glow Circles -->
    <radialGradient id="glow1" cx="15%" cy="20%" r="65%">
      <stop offset="0%" stop-color="#2563eb" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0" />
    </radialGradient>

    <radialGradient id="glow2" cx="85%" cy="80%" r="65%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
    </radialGradient>

    <!-- Grid Overlay Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Grid Pattern Layer -->
  <rect width="1200" height="630" fill="url(#grid)" />

  <!-- Ambient Lighting Effects -->
  <circle cx="180" cy="140" r="420" fill="url(#glow1)" />
  <circle cx="1020" cy="520" r="460" fill="url(#glow2)" />

  <!-- Outer Glowing Frame -->
  <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="url(#brandGrad)" stroke-width="2.5" stroke-opacity="0.7" />

  <!-- HEADER BAR: BRAND LOGO & CATEGORY PILL -->
  <g transform="translate(80, 75)">
    <!-- Logo Badge Icon -->
    <rect x="0" y="0" width="50" height="50" rx="14" fill="url(#brandGrad)" />
    <text x="25" y="34" font-family="system-ui, sans-serif" font-size="26" text-anchor="middle" fill="#FFFFFF">🎓</text>

    <!-- CampusAI Typography -->
    <text x="66" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" letter-spacing="-0.04em">
      <tspan fill="#FFFFFF">Campus</tspan><tspan fill="#22d3ee">AI</tspan><tspan fill="#34d399">.ng</tspan>
    </text>

    <!-- Category Pill Badge -->
    <g transform="translate(780, 2)">
      <rect x="0" y="0" width="260" height="42" rx="21" fill="url(#badgeGrad)" stroke="#38bdf8" stroke-width="1" stroke-opacity="0.5" />
      <text x="130" y="26" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.1em">${escapeXml(category)}</text>
    </g>
  </g>

  <!-- Header Divider Line -->
  <line x1="80" y1="155" x2="1120" y2="155" stroke="#334155" stroke-opacity="0.6" stroke-width="1" />

  <!-- ARTICLE HEADLINE -->
  <g>
    ${titleSvgText}
  </g>

  <!-- SUB-FOOTER METADATA -->
  <g transform="translate(80, ${startY + (lines.length * lineHeight) + 20})">
    <text font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#94a3b8">
      ${escapeXml(dateStr)} • Official Verified Admissions Portal
    </text>
  </g>

  <!-- BOTTOM FOOTER BRANDING -->
  <g transform="translate(80, 555)">
    <line x1="0" y1="-25" x2="1040" y2="-25" stroke="url(#brandGrad)" stroke-width="2.5" />

    <text x="0" y="10" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" fill="#60a5fa" letter-spacing="0.06em">
      CAMPUSAI.COM.NG
    </text>

    <text x="1040" y="10" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" fill="#34d399" text-anchor="end" letter-spacing="0.06em">
      NIGERIA'S #1 ADMISSION STRATEGIST
    </text>
  </g>
</svg>`;
}

export function handleOgImageRequest(req: Request, res: Response) {
  try {
    const title = typeof req.query.title === 'string' ? req.query.title : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;

    const svgContent = generateOgImageSvg(title, category, date);

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.status(200).send(svgContent);
  } catch (err: any) {
    console.error("[OG Image Generation Error]:", err);
    const fallbackSvg = generateOgImageSvg("CampusAI Nigeria", "ADMISSION NEWS", "2026 SEASON");
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    return res.status(200).send(fallbackSvg);
  }
}
