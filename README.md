# English Word Counter

A Firefox extension that counts English words on the active webpage. Mark a word as known and it will be excluded from the learning list on future pages. The **Known** tab lets you review saved words and remove a mark.

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Choose this folder's `manifest.json`.
4. Open an HTTP or HTTPS webpage and select the extension button.

The toolbar icon combines an open book with frequency bars to represent vocabulary learning and word counts.

The extension counts case-insensitive alphabetic words (including contractions such as `don't`) from the page's visible text. The **To learn** tab lists not-yet-known words and lets you sort them by frequency (highest first, with alphabetical tie-breaking), alphabetically (A–Z), or by letter length (shortest first, with alphabetical tie-breaking). Apostrophes do not count toward a word's letter length. The **All word counts** tab lists every word on the current page, including known words, sorted by frequency from highest to lowest (alphabetically for ties). Known words are stored locally in Firefox and are not sent anywhere. In the **Known** tab, use **Export words** to save a newline-separated `known-words.txt` file, or **Import words** to open a separate import page that automatically merges a `.txt` or `.csv` word list (separated by lines, spaces, or commas) or a `.json` array of strings into the saved list. Imported words are lowercased and deduplicated.

Some built-in Firefox pages and pages where extensions are restricted cannot be read; the popup will show a message in those cases.
