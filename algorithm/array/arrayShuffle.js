/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {*} arr 
 * @returns 
 */
export default function arrayShuffle(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at positions i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * console.log(arrayShuffle([1, 2, 3, 4, 5, 6, 7, 8]));
console.log(arrayShuffle([0, 1, 2, 3, 4, 5, 6, 7, 8,
  9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36,
  37, 38, 39, 40, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 50,
  51]));

 */