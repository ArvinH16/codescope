const gradientColors = [
  "from-blue-500 to-cyan-500",
  "from-yellow-500 to-orange-500",
  "from-purple-500 to-pink-500",
  "from-green-500 to-emerald-500",
  "from-red-500 to-rose-500",
  "from-indigo-500 to-blue-500",
  "from-pink-500 to-rose-500",
];

export function getStableGradient(name: string) {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradientColors[hash % gradientColors.length];
}