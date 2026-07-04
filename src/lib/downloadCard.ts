/**
 * Renders a build-in-public card to an offscreen canvas and triggers a real
 * PNG download. Pure client-side — no server, no external image library —
 * which is enough to make the "Download" action actually do something
 * instead of being a dead button.
 */
export function downloadCard(opts: { headline: string; subline: string; filename?: string }) {
  const { headline, subline, filename = 'shift-card.png' } = opts;

  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background: the app's charcoal-to-black gradient.
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#131418');
  bg.addColorStop(1, '#0a0b0d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle violet glow, echoing the app's glass-card accent.
  const glow = ctx.createRadialGradient(width * 0.82, height * 0.18, 0, width * 0.82, height * 0.18, 520);
  glow.addColorStop(0, 'rgba(131,53,253,0.28)');
  glow.addColorStop(1, 'rgba(131,53,253,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Card border.
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  // Headline.
  ctx.fillStyle = '#f5f4f2';
  ctx.font = '600 56px "Space Grotesk", "Inter", sans-serif';
  wrapText(ctx, headline, width / 2, height / 2 - 40, width - 200, 66);

  // Subline.
  ctx.fillStyle = 'rgba(245,244,242,0.64)';
  ctx.font = '400 30px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(subline, width / 2, height / 2 + 60);

  // Footer wordmark.
  ctx.fillStyle = '#8335fd';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BUILT WITH SHIFT', width / 2, height - 64);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  ctx.textAlign = 'center';
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}
