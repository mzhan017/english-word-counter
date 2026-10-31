const fileInput = document.getElementById("import-file");
const importStatus = document.getElementById("import-status");

function parseImportedWords(contents, fileName) {
  const lowerFileName = fileName.toLowerCase();
  let entries;
  if (lowerFileName.endsWith(".json")) {
    entries = JSON.parse(contents);
    if (!Array.isArray(entries)) {
      throw new Error("The JSON file must contain an array of words.");
    }
  } else if (lowerFileName.endsWith(".txt") || lowerFileName.endsWith(".csv")) {
    entries = [contents.replace(/^\uFEFF/, "")];
  } else {
    throw new Error("Choose a .txt, .csv, or .json file.");
  }

  const words = new Set();
  let invalidCount = 0;
  for (const entry of entries) {
    if (typeof entry !== "string") {
      invalidCount++;
      continue;
    }

    for (const token of entry.split(/[\s,;|]+/)) {
      const word = token.replace(/^[^a-z]+|[^a-z]+$/gi, "").toLowerCase();
      if (!word) {
        continue;
      }
      if (!/^[a-z]+(?:['’][a-z]+)*$/.test(word)) {
        invalidCount++;
        continue;
      }
      words.add(word);
    }
  }

  return { words, invalidCount };
}

async function importWords() {
  const [file] = fileInput.files;
  if (!file) {
    return;
  }

  importStatus.textContent = `Reading ${file.name}…`;
  try {
    const contents = await file.text();
    const { words, invalidCount } = parseImportedWords(contents, file.name);
    if (!words.size) {
      importStatus.textContent = invalidCount
        ? `No valid words found. Skipped ${invalidCount} invalid entries.`
        : "The file is empty. Nothing was imported.";
      return;
    }

    const stored = await browser.storage.local.get("knownWords");
    const existing = Array.isArray(stored.knownWords)
      ? stored.knownWords
          .filter((word) => typeof word === "string")
          .map((word) => word.trim().toLowerCase())
          .filter(Boolean)
      : [];
    const updated = new Set(existing);
    const previousSize = updated.size;
    for (const word of words) {
      updated.add(word);
    }

    await browser.storage.local.set({ knownWords: [...updated].sort() });
    const addedCount = updated.size - previousSize;
    const duplicateCount = words.size - addedCount;
    importStatus.textContent =
      `Import complete. Added ${addedCount} words; ${duplicateCount} were already known.` +
      (invalidCount ? ` Skipped ${invalidCount} invalid entries.` : "");
  } catch (error) {
    importStatus.textContent = `Import failed: ${error.message}`;
    console.error("Could not import known words:", error);
  } finally {
    fileInput.value = "";
  }
}

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    importWords();
  }
});
