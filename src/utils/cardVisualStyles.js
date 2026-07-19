const MODEL_RADIUS = {
  classico: '20px',
  moderno: '14px',
  minimalista: '6px',
  executivo: '10px',
  premium: '24px',
  escuro: '18px',
  claro: '18px',
  neon: '12px',
  vidro: '20px',
  futurista: '8px'
};

const STYLE_FILTER = {
  glassmorphism: 'blur(16px)',
  vidro: 'blur(12px)'
};

function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (isNaN(r)) return `rgba(99,102,241,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function getCardStyle(card) {
  if (!card) return {};
  const color = card.color || '#6366f1';
  const style = card.style || 'modern';
  const model = card.model || 'classico';
  const intensity = card.intensity != null ? card.intensity : 50;
  const sf = Math.max(0.1, Math.min(2, intensity / 50));

  const borderRadius = MODEL_RADIUS[model] || '20px';
  const backdropFilter = STYLE_FILTER[style] || 'none';
  const rgba = (a) => hexToRgba(color, Math.min(1, a * sf));

  let background;
  switch (style) {
    case 'gradient':
    case 'metallic':
      background = `linear-gradient(145deg, ${color}, ${rgba(0.7)})`;
      break;
    case 'outline':
      background = 'transparent';
      break;
    case 'luxury':
      background = `linear-gradient(145deg, ${color}, #b8860b)`;
      break;
    default:
      if (model === 'vidro') background = rgba(0.08);
      else if (model === 'escuro') background = rgba(0.5);
      else if (model === 'claro') background = rgba(0.06);
      else background = rgba(0.12);
  }

  const border = style === 'outline'
    ? `2px solid ${color}`
    : `1px solid ${rgba(0.25)}`;

  let boxShadow;
  switch (style) {
    case 'material':
      boxShadow = `0 4px 6px ${rgba(0.2)}, 0 2px 4px ${rgba(0.1)}`;
      break;
    case 'neumorphism':
      boxShadow = `3px 3px 6px ${rgba(0.15)}, -3px -3px 6px rgba(255,255,255,0.03)`;
      break;
    case 'shadow':
      boxShadow = `0 10px 25px ${rgba(0.25)}`;
      break;
    case 'neon':
      boxShadow = `0 0 15px ${rgba(0.4)}, inset 0 0 15px ${rgba(0.1)}`;
      break;
    default:
      boxShadow = `0 4px 15px ${rgba(0.15)}`;
  }
  if (style === 'plano' || style === 'outline' || style === 'minimal') {
    boxShadow = 'none';
  }

  return {
    background,
    border,
    boxShadow,
    borderRadius,
    backdropFilter,
    WebkitBackdropFilter: backdropFilter
  };
}
