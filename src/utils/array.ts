export const getRandomItems = <T>(
  array: T[],
  count: number
): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

export const groupByKey = <T extends Record<string, any>>(
  items: T[],
  key: keyof T
): Record<string, T[]> => {
  return items.reduce((acc, item) => {
    const value = String(item[key]);

    if (!acc[value]) {
      acc[value] = [];
    }

    acc[value].push(item);

    return acc;
  }, {} as Record<string, T[]>);
};