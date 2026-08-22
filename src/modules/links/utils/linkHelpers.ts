export const isYouTube = (u: string) => /youtube\.com|youtu\.be/i.test(u);
export const isInstagram = (u: string) => /instagram\.com/i.test(u);
export const isPinterest = (u: string) => /pinterest\.com|pin\.it/i.test(u);

export const getYouTubeId = (u: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = u.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const getDomain = (u: string) => {
  try {
    const urlObj = new URL(u);
    return urlObj.hostname;
  } catch {
    return u;
  }
};

export const isValidLink = (u: string) => {
  try {
    const parsed = new URL(u);
    return isYouTube(u) || isInstagram(u) || isPinterest(u) || parsed.protocol.startsWith('http');
  } catch {
    return false;
  }
};
