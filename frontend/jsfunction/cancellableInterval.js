/**
 * Implement a function setCancellableInterval, 
 * that acts like setInterval but instead of returning a timer ID, 
 * it returns a function that when called, cancels the interval. 
 * The setCancellableInterval function should have the exact same signature as setInterval:
// setCancellableInterval(callback);
// setCancellableInterval(callback, delay);
// setCancellableInterval(callback, delay, param1);
// setCancellableInterval(callback, delay, param1, param2);
// setCancellableInterval(callback, delay, param1, param2, .... paramN);
*/

export default function setCancellableInteral(callback, delay, ...args) {
	const timer = setInterval(callback, delay, ...args);
	return () => clearInterval(timer);
};