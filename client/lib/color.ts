export const DEFAULT_BRAND_COLOR = "#0f766e";

function normalizeHexColor(hexColor: string) {
  const cleaned = hexColor.trim().replace("#", "");
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return `#${normalized.toLowerCase()}`;
}

export function getValidBrandColor(hexColor?: string | null) {
  if (!hexColor) {
    return DEFAULT_BRAND_COLOR;
  }

  return normalizeHexColor(hexColor) ?? DEFAULT_BRAND_COLOR;
}

export function getContrastTextColor(hexColor: string) {
  const normalized = normalizeHexColor(hexColor);

  if (!normalized) {
    return "#ffffff";
  }

  const red = parseInt(normalized.slice(1, 3), 16);
  const green = parseInt(normalized.slice(3, 5), 16);
  const blue = parseInt(normalized.slice(5, 7), 16);

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.58 ? "#000000" : "#ffffff";
}
