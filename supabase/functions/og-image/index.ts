import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // SVG content matching the app's home screen design
    const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f172a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <circle cx="120" cy="95" r="40" fill="#22c55e" opacity="0.15"/>
  <circle cx="1020" cy="158" r="30" fill="#22c55e" opacity="0.12"/>
  <circle cx="300" cy="504" r="20" fill="#22c55e" opacity="0.18"/>
  <circle cx="960" cy="441" r="25" fill="#22c55e" opacity="0.12"/>
  <circle cx="540" cy="63" r="15" fill="#22c55e" opacity="0.15"/>
  <circle cx="780" cy="284" r="22" fill="#22c55e" opacity="0.13"/>

  <ellipse cx="600" cy="190" rx="110" ry="110" fill="#22c55e" opacity="0.15" filter="url(#glow)"/>

  <rect x="510" y="100" width="180" height="180" rx="32" fill="url(#logoGrad)" filter="url(#glow)"/>

  <g transform="translate(600, 190)">
    <path d="M -30 -35 Q -20 -38 -10 -35 Q 0 -32 10 -35 Q 20 -38 30 -35 L 30 5 Q 20 2 10 5 Q 0 8 -10 5 Q -20 2 -30 5 Z"
          fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="-30" y1="-35" x2="-30" y2="45" stroke="white" stroke-width="3" stroke-linecap="round"/>
  </g>

  <text x="600" y="395" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="120" font-weight="900" letter-spacing="8" fill="url(#textGrad)" filter="url(#glow)">
    RANGE ROUNDS
  </text>

  <line x1="370" y1="420" x2="830" y2="420" stroke="#22c55e" stroke-width="2" opacity="0.3"/>

  <text x="600" y="470" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" font-weight="300" letter-spacing="2" fill="#e2e8f0">
    Virtual Course Simulator
  </text>
</svg>`;

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
