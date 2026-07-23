async function asyncFlatMap(array, callback, thisArg) {
  console.log("array:", array);
  const nestedResults = await Promise.all(
    array.map(async (item, index) => {
      const element = await item;
      return callback.call(
        thisArg,
        element,
        index,
        array
      );
    })
  );
  return nestedResults.flat();
}

// Another solution
async function asyncFlatMapII(array, callback, thisArg) {
  const values = await Promise.all(array);

  const results = await Promise.all(
    values.map((element, index) =>
      callback.call(thisArg, element, index, values)
    )
  );

  return results.flat();
}