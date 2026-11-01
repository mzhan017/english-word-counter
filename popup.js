const pageStatus = document.getElementById("page-status");
const pageSummary = document.getElementById("page-summary");
const pageWords = document.getElementById("page-words");
const frequencySummary = document.getElementById("frequency-summary");
const frequencyWords = document.getElementById("frequency-words");
const knownWords = document.getElementById("known-words");
const knownTotal = document.getElementById("known-total");
const pageSearch = document.getElementById("page-search");
const frequencySearch = document.getElementById("frequency-search");
const knownSearch = document.getElementById("known-search");
const pageSort = document.getElementById("page-sort");
const pagePanel = document.getElementById("page-panel");
const frequencyPanel = document.getElementById("frequency-panel");
const knownPanel = document.getElementById("known-panel");
const pageTab = document.getElementById("page-tab");
const frequencyTab = document.getElementById("frequency-tab");
const knownTab = document.getElementById("known-tab");
const exportWordsButton = document.getElementById("export-words");
const importWordsButton = document.getElementById("import-words");

let counts = {};
let knownSet = new Set();
let activeTab = null;
let pageError = false;
let storageError = false;

function sortedWords(words) {
  if (pageSort.value === "alphabetical") {
    return words.sort((a, b) => a.localeCompare(b));
  }
  if (pageSort.value === "length") {
    return words.sort(
      (a, b) => a.replace(/[^a-z]/gi, "").length - b.replace(/[^a-z]/gi, "").length ||
        a.localeCompare(b)
    );
  }
  return words.sort((a, b) => (counts[b] || 0) - (counts[a] || 0) || a.localeCompare(b));
}

function isKnown(word) {
  const alternate = word.endsWith("s") ? word.slice(0, -1) : `${word}s`;
  return knownSet.has(word) || knownSet.has(alternate);
}

function addEmptyRow(target, message, columnCount) {
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.className = "empty";
  cell.colSpan = columnCount;
  cell.textContent = message;
  row.append(cell);
  target.append(row);
}

function renderPageWords() {
  pageWords.replaceChildren();
  const search = pageSearch.value.trim().toLowerCase();
  const words = sortedWords(
    Object.keys(counts).filter((word) => !isKnown(word) && word.includes(search))
  );
  const unknownCount = Object.keys(counts).filter((word) => !isKnown(word)).length;
  const totalOccurrences = Object.entries(counts).reduce(
    (total, [word, count]) => total + (isKnown(word) ? 0 : count),
    0
  );

  pageSummary.textContent =
    `${unknownCount} words to learn, ${totalOccurrences} occurrences` +
    (knownSet.size ? ` (${Object.keys(counts).length - unknownCount} known words skipped)` : "");

  if (pageError) {
    addEmptyRow(pageWords, "Can't read this page. Switch to a regular webpage and try again.", 3);
    return;
  }

  if (!words.length) {
    addEmptyRow(pageWords, search ? "No matching words." : "No words to learn on this page.", 3);
    return;
  }

  for (const word of words) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const countCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const button = document.createElement("button");

    nameCell.textContent = word;
    countCell.textContent = String(counts[word]);
    button.className = "action";
    button.type = "button";
    button.textContent = "Known";
    button.setAttribute("aria-label", `Mark ${word} as known`);
    button.disabled = storageError;
    button.addEventListener("click", () => markKnown(word));
    actionCell.append(button);
    row.append(nameCell, countCell, actionCell);
    pageWords.append(row);
  }
}

function renderFrequencyWords() {
  frequencyWords.replaceChildren();
  const search = frequencySearch.value.trim().toLowerCase();
  const allWords = Object.keys(counts);
  const words = allWords
    .filter((word) => word.includes(search))
    .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
  const totalOccurrences = Object.values(counts).reduce((total, count) => total + count, 0);

  frequencySummary.textContent =
    `${allWords.length} words, ${totalOccurrences} occurrences (including known words)`;

  if (pageError) {
    addEmptyRow(frequencyWords, "Can't read this page. Switch to a regular webpage and try again.", 2);
    return;
  }

  if (!words.length) {
    addEmptyRow(frequencyWords, search ? "No matching words." : "No English words on this page.", 2);
    return;
  }

  for (const word of words) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const countCell = document.createElement("td");

    nameCell.textContent = word;
    countCell.textContent = String(counts[word]);
    row.append(nameCell, countCell);
    frequencyWords.append(row);
  }
}

function renderKnownWords() {
  knownWords.replaceChildren();
  knownTotal.textContent = String(knownSet.size);
  exportWordsButton.disabled = storageError || knownSet.size === 0;
  importWordsButton.disabled = storageError;
  const search = knownSearch.value.trim().toLowerCase();
  const words = [...knownSet].filter((word) => word.includes(search)).sort((a, b) => a.localeCompare(b));

  if (storageError) {
    addEmptyRow(knownWords, "Couldn't load saved words. Restart the extension and try again.", 2);
    return;
  }

  if (!words.length) {
    addEmptyRow(knownWords, search ? "No matching words." : "No known words yet.", 2);
    return;
  }

  for (const word of words) {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const button = document.createElement("button");

    nameCell.textContent = word;
    button.className = "action";
    button.type = "button";
    button.textContent = "Remove";
    button.setAttribute("aria-label", `Remove ${word} from known words`);
    button.disabled = storageError;
    button.addEventListener("click", () => unmarkKnown(word));
    actionCell.append(button);
    row.append(nameCell, actionCell);
    knownWords.append(row);
  }
}

async function markKnown(word) {
  const updated = new Set(knownSet);
  updated.add(word);
  try {
    await browser.storage.local.set({ knownWords: [...updated].sort() });
    knownSet = updated;
    renderPageWords();
    renderKnownWords();
    pageStatus.textContent = activeTab ? (activeTab.title || "Current page") : "Current page";
  } catch (error) {
    pageStatus.textContent = "Couldn't save changes. Check extension storage permissions and try again.";
    console.error("Could not save known words:", error);
  }
}

async function unmarkKnown(word) {
  const updated = new Set(knownSet);
  updated.delete(word);
  try {
    await browser.storage.local.set({ knownWords: [...updated].sort() });
    knownSet = updated;
    renderPageWords();
    renderKnownWords();
    pageStatus.textContent = activeTab ? (activeTab.title || "Current page") : "Current page";
  } catch (error) {
    pageStatus.textContent = "Couldn't save changes. Check extension storage permissions and try again.";
    console.error("Could not save known words:", error);
  }
}

function exportKnownWords() {
  const contents = `${[...knownSet].sort((a, b) => a.localeCompare(b)).join("\n")}\n`;
  const url = URL.createObjectURL(new Blob([contents], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "known-words.txt";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  pageStatus.textContent = `Exported ${knownSet.size} words.`;
}

async function openImportPage() {
  try {
    await browser.tabs.create({ url: browser.runtime.getURL("import.html") });
  } catch (error) {
    pageStatus.textContent = "Couldn't open the import page.";
    console.error("Could not open import page:", error);
  }
}

async function loadCurrentPage() {
  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs[0];
    if (!activeTab || typeof activeTab.id !== "number") {
      throw new Error("No active tab is available.");
    }

    const response = await browser.tabs.sendMessage(activeTab.id, { type: "GET_PAGE_WORDS" });
    if (!response || !response.counts || typeof response.counts !== "object") {
      throw new Error("The page did not return a word list.");
    }

    counts = response.counts;
    pageStatus.textContent = activeTab.title || "Current page";
  } catch (error) {
    pageError = true;
    pageStatus.textContent = storageError
      ? "Can't read the page or saved words."
      : "Can't read the current page.";
    console.error("Could not read words from the active tab:", error);
  }

  renderPageWords();
  renderFrequencyWords();
  if (storageError && !pageError) {
    pageStatus.textContent = "Can't load saved words. Marking words as known is disabled.";
  }
}

function showTab(tab) {
  const panels = [
    { name: "page", panel: pagePanel, tab: pageTab },
    { name: "frequency", panel: frequencyPanel, tab: frequencyTab },
    { name: "known", panel: knownPanel, tab: knownTab },
  ];

  for (const item of panels) {
    const isActive = item.name === tab;
    item.panel.hidden = !isActive;
    item.tab.classList.toggle("active", isActive);
    item.tab.setAttribute("aria-selected", String(isActive));
  }
}

pageTab.addEventListener("click", () => showTab("page"));
frequencyTab.addEventListener("click", () => showTab("frequency"));
knownTab.addEventListener("click", () => showTab("known"));
pageSearch.addEventListener("input", renderPageWords);
pageSort.addEventListener("change", renderPageWords);
frequencySearch.addEventListener("input", renderFrequencyWords);
knownSearch.addEventListener("input", renderKnownWords);
exportWordsButton.addEventListener("click", exportKnownWords);
importWordsButton.addEventListener("click", openImportPage);

async function initialize() {
  try {
    const stored = await browser.storage.local.get("knownWords");
    knownSet = new Set(Array.isArray(stored.knownWords) ? stored.knownWords : []);
    renderKnownWords();
  } catch (error) {
    storageError = true;
    renderKnownWords();
    console.error("Could not load known words:", error);
  }

  await loadCurrentPage();
}

initialize();
