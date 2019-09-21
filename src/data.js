const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

// COPIED from chart.js since not exposed

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the 'onData*' callbacks (e.g. onDataPush, etc.) with same arguments.
 */
export function listenArrayEvents(array, listener) {
	if (array._chartjs) {
		array._chartjs.listeners.push(listener);
		return;
	}

	Object.defineProperty(array, '_chartjs', {
		configurable: true,
		enumerable: false,
		value: {
			listeners: [listener]
		}
	});

	arrayEvents.forEach((key)  => {
		const method = 'onData' + key.charAt(0).toUpperCase() + key.slice(1);
		const base = array[key];

		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value() {
				const args = Array.prototype.slice.call(arguments);
				const res = base.apply(this, args);

				array._chartjs.listeners.forEach((object) => {
					if (typeof object[method] === 'function') {
						object[method].apply(object, args);
					}
				});

				return res;
			}
		});
	});
}

/**
 * Removes the given array event listener and cleanup extra attached properties (such as
 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
 */
export function unlistenArrayEvents(array, listener) {
	const stub = array._chartjs;
	if (!stub) {
		return;
	}

	const listeners = stub.listeners;
	const index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}

	if (listeners.length > 0) {
		return;
	}

	arrayEvents.forEach((key) => {
		delete array[key];
	});

	delete array._chartjs;
}
