// Map blocks set to ask first, on the Interactivity API: the map loads only when the visitor presses "Show the map".
import { store, getContext, getElement } from '@wordpress/interactivity';

store('anypress/map', {
	actions: {
		load() {
			const { src, title } = getContext();
			const frame = document.createElement('iframe');
			frame.src = src;
			frame.title = title;
			frame.referrerPolicy = 'no-referrer-when-downgrade';
			getElement().ref.replaceWith(frame);
		},
	},
});
