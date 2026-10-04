// Friendly avatars for "By Owner" listings — shown in place of a broker's
// photo so buyers can tell at a glance that the seller is the owner, not
// a broker. Drawn as inline SVG (no image files to host or upload); the
// listing only stores the short key (e.g. "cowboy"), see
// select_listings.owner_avatar.
const SKIN = { light: '#f6d3b8', tan: '#e0a97e', medium: '#c98a5e', dark: '#7a4a2e', olive: '#d9a878' };

// Order matters only for how the picker is laid out.
export const OWNER_AVATARS = [
  { key: 'glasses-man', label: 'Man with glasses', bg: '#cfe3f5', shirt: '#2f6f9f', skin: SKIN.light, hair: '#5a3b22', style: 'short', glasses: true },
  { key: 'long-woman', label: 'Woman, long dark hair', bg: '#f7dfe7', shirt: '#b5476c', skin: SKIN.medium, hair: '#1f1712', style: 'long' },
  { key: 'bald-beard', label: 'Man with beard', bg: '#dff0d8', shirt: '#4c8a3c', skin: SKIN.dark, hair: '#17110d', style: 'bald', beard: true },
  { key: 'bun-woman', label: 'Woman, blonde bun', bg: '#fdf0c9', shirt: '#d98f2b', skin: SKIN.light, hair: '#d9b45a', style: 'bun' },
  { key: 'cowboy', label: 'Cowboy hat', bg: '#f0e0cc', shirt: '#8a4f2a', skin: SKIN.tan, hair: '#8b8b8b', style: 'cowboy', beard: true },
  { key: 'short-woman', label: 'Woman, short curly hair', bg: '#e6dcf5', shirt: '#6d4bb0', skin: SKIN.dark, hair: '#120d0a', style: 'curly' },
  { key: 'cap-man', label: 'Man with ball cap', bg: '#d9ecec', shirt: '#2a8a8a', skin: SKIN.olive, hair: '#2b2118', style: 'cap' },
  { key: 'silver-woman', label: 'Woman, silver hair', bg: '#e8ecf2', shirt: '#4b5f7a', skin: SKIN.light, hair: '#c4c9d1', style: 'long', glasses: true },
];

export const OWNER_AVATAR_KEYS = OWNER_AVATARS.map((a) => a.key);

function hair(a) {
  const c = a.hair;
  switch (a.style) {
    case 'long':
      return `<path d="M30 44 Q27 19 50 19 Q73 19 70 44 L73 70 L63 70 L63 45 Q50 34 37 45 L37 70 L27 70Z" fill="${c}"/>`;
    case 'bun':
      return `<circle cx="50" cy="15" r="8" fill="${c}"/><path d="M32 42 Q31 22 50 22 Q69 22 68 42 Q60 31 50 31 Q40 31 32 42Z" fill="${c}"/>`;
    case 'curly':
      return `<g fill="${c}"><circle cx="35" cy="30" r="9"/><circle cx="46" cy="24" r="9"/><circle cx="58" cy="24" r="9"/><circle cx="66" cy="32" r="8"/><circle cx="32" cy="41" r="6"/><circle cx="68" cy="42" r="6"/></g>`;
    case 'cap':
      return `<path d="M31 40 Q31 20 50 20 Q69 20 69 40Z" fill="${a.shirt}"/><path d="M58 37 H80 V42 H58Z" fill="${a.shirt}"/><path d="M32 40 Q34 34 40 33 L40 40Z" fill="${c}"/>`;
    case 'cowboy':
      return `<ellipse cx="50" cy="33" rx="30" ry="5.5" fill="#6b4423"/><path d="M35 33 Q36 12 50 12 Q64 12 65 33Z" fill="#7d5230"/><path d="M35 30 H65 V33 H35Z" fill="#4a2e17"/>`;
    case 'bald':
      return '';
    default: // short
      return `<path d="M32 42 Q31 21 50 21 Q69 21 68 42 Q60 30 50 30 Q40 30 32 42Z" fill="${c}"/>`;
  }
}

export function ownerAvatarSvg(key, size = 56) {
  const a = OWNER_AVATARS.find((x) => x.key === key);
  if (!a) return ownerBadgeSvg(size);
  const beard = a.beard ? `<path d="M33 47 Q34 66 50 68 Q66 66 67 47 Q60 58 50 58 Q40 58 33 47Z" fill="${a.hair}"/>` : '';
  const glasses = a.glasses
    ? '<g fill="none" stroke="#1d1d1d" stroke-width="1.6"><circle cx="43" cy="44" r="5"/><circle cx="57" cy="44" r="5"/><path d="M48 44 H52"/></g>'
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${a.label}">
    <rect width="100" height="100" fill="${a.bg}"/>
    <path d="M14 100 Q14 72 50 72 Q86 72 86 100Z" fill="${a.shirt}"/>
    <rect x="43" y="58" width="14" height="16" rx="5" fill="${a.skin}"/>
    <ellipse cx="50" cy="44" rx="18" ry="20" fill="${a.skin}"/>
    ${hair(a)}
    ${beard}
    <circle cx="43" cy="44" r="1.9" fill="#2a1d14"/><circle cx="57" cy="44" r="1.9" fill="#2a1d14"/>
    ${glasses}
    <path d="M43 53 Q50 58 57 53" fill="none" stroke="#7a3b2e" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

// The default By Owner symbol when no avatar was picked: the RV "BY OWNER"
// logo Marie chose (public/images/by-owner-logo.png). Returns an <img>
// rather than an <svg> — callers that size it should query 'svg, img'.
export function ownerBadgeSvg(size = 56) {
  return `<img src="/images/by-owner-logo.png" alt="By Owner" width="${size}" height="${size}" style="display:block; width:${size}px; height:${size}px; border-radius:50%;">`;
}
