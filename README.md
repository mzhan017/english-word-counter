# English Word Counter

English Word Counter is a Firefox extension that counts English words on the active webpage and helps users manage vocabulary for future learning.

## Features

- View words that have not been marked as known, sorted by frequency, alphabetically, or by word length.
- Mark words as known to exclude them from learning lists on future pages.
- Review all word counts for the current page, including words marked as known.
- Review, import, and export the saved list of known words.

The extension counts case-insensitive alphabetic words, including contractions such as `don't`. Apostrophes are excluded when calculating word length. Frequency sorting uses alphabetical order to resolve ties.

The **Known** tab supports exporting words as a newline-separated `known-words.txt` file and importing `.txt`, `.csv`, or `.json` word lists. Text and CSV entries may be separated by lines, spaces, or commas; JSON files must contain an array of strings. Imported words are converted to lowercase and deduplicated.

## Privacy

Known words are stored locally in Firefox and are not transmitted elsewhere.

## Limitations

Firefox restricts extension access to certain built-in pages and other protected pages. Word counts are unavailable on those pages.

## Usage

Open an HTTP or HTTPS webpage and select the extension button to view its word counts.
