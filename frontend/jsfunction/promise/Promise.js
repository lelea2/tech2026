// Create a promise class from scratch

export default class CustomPromise {
    status = 'pending';
    value = undefined;
    thenCallbacks = [];
    errorCallbacks = [];

    constructor(action) {
        action(this.resolve.bind(this), this.reject.bind(this));
    }

    resolve(value) {
        if (this.status !== 'pending') return; // do not proceed if promise already resolved/rejected
        this.state = 'resolved';
        this.value = value;
        this.thenCallbacks.forEach(callback => callback(this.value));
        
    }

    reject(value) {
        if (this.status !== 'pending') return; // do not proceed if promise already resolved/rejected
        this.state = 'rejected';
        this.value = value;
        this.errorCallbacks.forEach(callback => callback(this.value));
    }

    then(callback) {
        this.thenCallbacks.push(callback);
        return this;
    }

    catch(callback) {
        this.errorCallbacks.push(callback);
        return this;
    }
}

// Usage example
let promise = new CustomPromise((resolver, reject) => {
  setTimeout(() => {
    const rand = Math.ceil(Math.random(1 * 1 + 6) * 6);
    if (rand > 2) {
      resolver('Success');
    } else {
      reject('Error');
    }
  }, 1000);
});

promise
  .then(function(response){
    console.log(response)
  })
  .catch(function(error){
    console.log(error)
  });