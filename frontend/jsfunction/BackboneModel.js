export default class BackboneModel {
  constructor(initialValues = {}) {
    this.attributes = { ...initialValues };

    this.events = {
      change: {},
      unset: {},
    };

    // Track attributes removed by unset().
    this.unsetAttributes = new Set();
  }

  get(attribute) {
    return this.attributes[attribute];
  }

  set(attribute, value) {
    const hadAttribute = this.has(attribute);
    const oldValue = this.attributes[attribute];

    // Recreated attribute after unset().
    if (this.unsetAttributes.has(attribute)) {
      this.attributes[attribute] = value;
      return;
    }

    // Initial creation does not trigger change.
    if (!hadAttribute) {
      this.attributes[attribute] = value;
      return;
    }

    // Same value => no-op.
    if (Object.is(oldValue, value)) {
      return;
    }

    this.attributes[attribute] = value;

    this._emit(
      'change',
      attribute,
      attribute,
      value,
      oldValue,
    );
  }

  has(attribute) {
    return Object.prototype.hasOwnProperty.call(
      this.attributes,
      attribute,
    );
  }

  unset(attribute) {
    if (!this.has(attribute)) {
      return;
    }

    delete this.attributes[attribute];

    // Mark attribute as removed.
    this.unsetAttributes.add(attribute);

    this._emit('unset', attribute, attribute);
  }

  on(eventName, attribute, callback, context) {
    if (!this.events[eventName]) {
      this.events[eventName] = {};
    }

    if (!this.events[eventName][attribute]) {
      this.events[eventName][attribute] = [];
    }

    this.events[eventName][attribute].push({
      callback,
      context,
    });
  }

  off(eventName, attribute, callback) {
    const listeners = this.events[eventName]?.[attribute];

    if (!listeners) {
      return;
    }

    this.events[eventName][attribute] = listeners.filter(
      (listener) => listener.callback !== callback,
    );
  }

  _emit(eventName, attribute, ...args) {
    const listeners = this.events[eventName]?.[attribute];

    if (!listeners) {
      return;
    }

    for (const listener of listeners) {
      listener.callback.apply(listener.context, args);
    }
  }
}