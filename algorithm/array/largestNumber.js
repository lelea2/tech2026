// Given a list of non-negative integers nums, arrange them such that they form the largest number and return it.
// Since the result may be very large, so you need to return a string instead of an integer.

 function largestNumber(nums) {
  const arr = nums.map(String); // convert numbers to strings for concatenation and comparison

  arr.sort((a, b) => {
    const ab = a + b;
    const ba = b + a;

    if (ab > ba) return -1;
    if (ab < ba) return 1;
    return 0;
  });

  // Handle [0, 0] -> "0", not "00"
  if (arr[0] === "0") {
    return "0";
  }

  return arr.join("");
}