browser.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "GET_PAGE_WORDS") {
    return undefined;
  }

  const text = (document.body ? document.body.innerText : "").replace(
    /(^|[^A-Za-z0-9-])([A-F0-9]+(?:-[A-F0-9]+)*-*)(?=$|[^A-Za-z0-9-])/gi,
    (match, boundary, identifier) =>
      identifier.replace(/-/g, "").length >= 32 ? `${boundary} ` : `${boundary}${identifier}`
  );
  const words = text.match(/[A-Za-z]+(?:['’][A-Za-z]+|[._@][A-Za-z]+)*/g) || [];
  const counts = {};

  for (const word of words) {
    if (/[._@]/.test(word)) {
      continue;
    }
    const normalized = word.toLowerCase().replace(/['’](?:s|re|m|d|ve)$/, "");
    if (!normalized) {
      continue;
    }
    counts[normalized] = (Object.hasOwn(counts, normalized) ? counts[normalized] : 0) + 1;
  }

  return Promise.resolve({ counts });
});
