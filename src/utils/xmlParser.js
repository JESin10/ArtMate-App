import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
});

export const xmlParser = (xmlText) => {
  if (!xmlText || xmlText.trim().length === 0) return null;

  try {
    return parser.parse(xmlText);
  } catch (error) {
    console.error("XML parse error:", error);
    return null;
  }
};

export const parseItems = (xmlText) => {
  const data = xmlParser(xmlText);

  if (!data) return [];

  const items = data?.response?.body?.items?.item;

  if (!items) return [];

  return Array.isArray(items) ? items : [items];
};
