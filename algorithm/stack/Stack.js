// LIFO (Last In, First Out)
function Stack() {
  this._size = 0;
  this._storage = {};
}
 
Stack.prototype.push = function(data) {
  const size = ++this._size;
  this._storage[size] = data;
};
 
Stack.prototype.pop = function() {
  const size = this._size;

  if (size) {
    const deletedData = this._storage[size];

    delete this._storage[size];
    this._size--;

    return deletedData;
  }
};