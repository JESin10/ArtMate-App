export const parseDateSafe = (dateStr) => {
  if (!dateStr) return null;

  const s = String(dateStr).trim();

  if (/^\d{8}$/.test(s)) {
    const year = s.slice(0, 4);
    const month = s.slice(4, 6);
    const day = s.slice(6, 8);

    return new Date(`${year}-${month}-${day}`);
  }

  const normalized = s.replace(/\./g, "-").slice(0, 10);
  const d = new Date(normalized);

  return isNaN(d.getTime()) ? null : d;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";

  const s = String(dateStr).trim();

  if (/^\d{8}$/.test(s)) {
    const year = s.slice(0, 4);
    const month = Number(s.slice(4, 6));
    const day = Number(s.slice(6, 8));

    return `${year}년 ${month}월 ${day}일`;
  }

  return s;
};
