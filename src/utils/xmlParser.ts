import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
});

//XML → JS 객체 변환
export const xmlParser = <T = unknown>(xmlText: string): T | null => {
  if (!xmlText || xmlText.trim().length === 0) return null;

  try {
    return parser.parse(xmlText) as T;
  } catch (error) {
    console.error("XML parse error:", error);

    return null;
  }
};

//XML 내부 item 배열 추출
export const parseItems = <T = unknown>(xmlText: string): T[] => {
  const data = xmlParser<any>(xmlText);

  if (!data) return [];

  const items = data?.response?.body?.items?.item;

  if (!items) return [];

  return Array.isArray(items) ? items : [items];
};