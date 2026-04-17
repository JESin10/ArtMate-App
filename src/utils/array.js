export const getRandomItems = (array, count) => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
};

export const groupByKey = (items, key) => {
  return items.reduce((acc, item) => {
    const value = item[key];

    if (!acc[value]) acc[value] = [];

    acc[value].push(item);

    return acc;
  }, {});
};
