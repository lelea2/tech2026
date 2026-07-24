function matchMetapattern(
  metapattern: number[][],
  candidate: string
): boolean {
  const words = candidate.trim().split(/\s+/);

  if (metapattern.length !== words.length) {
    return false;
  }

  // pattern ID -> word assigned to that ID
  const idToWord = new Map<number, string>();

  function backtrack(index: number): boolean {
    // Successfully matched every word.
    if (index === words.length) {
      return true;
    }

    const word = words[index];

    // Try every possible pattern ID for this position.
    for (const id of metapattern[index]) {
      if (idToWord.has(id)) {
        // This ID was already assigned, so the word must match.
        if (idToWord.get(id) !== word) {
          continue;
        }

        if (backtrack(index + 1)) {
          return true;
        }
      } else {
        // Temporarily assign this ID to the current word.
        idToWord.set(id, word);

        if (backtrack(index + 1)) {
          return true;
        }

        // Undo the choice.
        idToWord.delete(id);
      }
    }

    return false;
  }

  return backtrack(0);
}