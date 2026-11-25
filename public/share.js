// Shareable progress card: a 1080×1080 image of your streak, skill rating, and lessons.
// Uses the phone's share sheet when available, otherwise downloads the PNG. Celebrates learning, never winnings.
import { ace } from './ui.js';

function loadSvg(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img); img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="372" '));
  });
}

function roundRect(x, X, Y, W, H, r) { x.beginPath(); x.roundRect(X, Y, W, H, r); }

export async function progressCard({ username, streak = 0, rating = null, tier = null, lessons = 0, track = '' }) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1080;
  const x = cv.getContext('2d');
  const grad = x.createLinearGradient(0, 0, 1080, 1080); grad.addColorStop(0, '#0B1022'); grad.addColorStop(.55, '#1E1B4B'); grad.addColorStop(1, '#4C1D95');
  x.fillStyle = grad; x.fillRect(0, 0, 1080, 1080);
  // Suit pattern
  x.globalAlpha = .06; x.fillStyle = '#fff'; x.font = '64px sans-serif';
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) x.fillText('♠♥♣♦'[(i + j) % 4], i * 130 + (j % 2) * 65, j * 130 + 60);
  x.globalAlpha = 1;
  // Glow
  const glow = x.createRadialGradient(780, 300, 40, 780, 300, 420); glow.addColorStop(0, 'rgba(52,199,89,.35)'); glow.addColorStop(1, 'rgba(52,199,89,0)');
  x.fillStyle = glow; x.fillRect(0, 0, 1080, 1080);
  const font = w => `${w} ui-rounded, "SF Pro Rounded", "Segoe UI", system-ui, sans-serif`;
  x.fillStyle = '#fff'; x.font = font('800 44px'); x.fillText('Felt & Fortune', 80, 120);
  x.fillStyle = 'rgba(255,255,255,.7)'; x.font = font('600 34px'); x.fillText(`${username}${track ? ' · ' + track : ''}`, 80, 172);
  // Ace
  try { const img = await loadSvg(ace('cheer', '')); x.drawImage(img, 640, 210, 300, 372); } catch { /* skip the mascot if SVG images are blocked */ }
  // Big stat
  x.fillStyle = '#FF9F0A'; x.font = font('900 220px'); x.fillText(String(streak), 80, 470);
  x.fillStyle = '#fff'; x.font = font('800 56px'); x.fillText(streak === 1 ? 'day streak' : 'day streak', 86, 545);
  // Tiles
  const tiles = [['Skill rating', rating != null ? `${rating}` : '—', tier || 'Getting started', '#AF52DE'], ['Lessons done', String(lessons), 'and counting', '#34C759']];
  tiles.forEach(([label, value, sub, color], i) => {
    const X = 80 + i * 470, Y = 650;
    x.fillStyle = 'rgba(255,255,255,.08)'; roundRect(x, X, Y, 440, 250, 36); x.fill();
    x.fillStyle = color; x.fillRect(X + 36, Y + 36, 60, 10);
    x.fillStyle = 'rgba(255,255,255,.75)'; x.font = font('700 32px'); x.fillText(label, X + 36, Y + 92);
    x.fillStyle = '#fff'; x.font = font('900 92px'); x.fillText(value, X + 36, Y + 190);
    x.fillStyle = 'rgba(255,255,255,.6)'; x.font = font('600 28px'); x.fillText(sub, X + 36, Y + 230);
  });
  x.fillStyle = 'rgba(255,255,255,.6)'; x.font = font('600 30px'); x.fillText('Learning blackjack the right way. 18+', 80, 990);
  return new Promise(r => cv.toBlob(r, 'image/png'));
}

export async function shareProgress(ctx, data) {
  const blob = await progressCard(data);
  const file = new File([blob], 'felt-and-fortune-progress.png', { type: 'image/png' });
  const text = `I’m on a ${data.streak}-day streak learning blackjack strategy on Felt & Fortune.`;
  window.ffTrack?.('share', { streak: data.streak });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return; } catch { /* canceled */ return; }
  }
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = file.name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  ctx.toast('Saved your progress card.');
}
