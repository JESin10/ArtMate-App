const xmlParser = (xmlText, parser) => {
  if (!xmlText || xmlText.trim().length === 0) return null;

  const jsonData = parser.parse(xmlText);
  return jsonData?.response?.body?.items?.item || null;
};

export default xmlParser;
