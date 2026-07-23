function flatMap(array, callback, thisArg) {
  const result = [];

  for (let index = 0; index < array.length; index++) {
    if (!(index in array)) continue;

    const mapped = callback.call(
      thisArg,
      array[index],
      index,
      array
    );

    if (Array.isArray(mapped)) {
      result.push(...mapped);
    } else {
      result.push(mapped);
    }
  }

  return result;
}