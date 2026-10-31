browser.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "GET_PAGE_WORDS") {
    return undefined;
  }

  const text = document.body ? document.body.innerText : "";
  const words = text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g) || [];
  const counts = {};

  for (const word of words) {
    const normalized = word.toLowerCase().replace(/['’](?:s|re|m|d|ve)$/, "");
    if (!normalized) {
      continue;
    }
    counts[normalized] = (Object.hasOwn(counts, normalized) ? counts[normalized] : 0) + 1;
  }

  return Promise.resolve({ counts });
});
