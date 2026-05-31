/**
 * You are given a string sentence that may contain leading or trailing spaces, 
 * as well as multiple spaces between words. 
 * Your task is to reverse the order of the words in the sentence without changing
 * the order of characters within each word. Return the resulting modified sentence 
 * as a single string with words separated by a single space, 
 * and no leading or trailing spaces.

 * @param {string} sentence - The input sentence to reverse.
 * @returns {string} - The sentence with the order of words reversed.
 */
export default function reverseWords(sentence) {
  let words = sentence.trim().split(/\s+/);
  let left = 0;
  let right = words.length - 1;

  while (left < right) {
    [words[left], words[right]] = [words[right], words[left]];
    left++;
    right--;
  }

  return words.join(' ');
}


// Split the sentence into words, filter out any empty strings (from multiple spaces), and reverse the array
export default function reverseWords(sentence) {
  // Split the sentence into words, filter out any empty strings (from multiple spaces), and reverse the array
  const words = sentence.split(' ').filter(word => word.length > 0);
  return words.reverse().join(' ');
}