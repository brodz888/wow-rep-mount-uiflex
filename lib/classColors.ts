export const CLASS_COLORS: Record<string, string> = {
  "Death Knight": "#C41E3A",
  "Demon Hunter": "#A330C9",
  "Evoker":       "#33937F",
  "Druid":        "#FF7C0A",
  "Hunter":       "#AAD372",
  "Mage":         "#3FC7EB",
  "Monk":         "#00FF98",
  "Paladin":      "#F48CBA",
  "Priest":       "#FFFFFF",
  "Rogue":        "#FFF468",
  "Shaman":       "#0070DE",
  "Warlock":      "#8788EE",
  "Warrior":      "#C69B3A",
};

export function getClassColor(className: string): string {
  return CLASS_COLORS[className] ?? "#C8AA6E";
}
