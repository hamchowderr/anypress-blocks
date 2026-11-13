// Before and After blocks, on the Interactivity API: moving the range input (finger, mouse or arrow keys) moves the
// cut between the two photos.
import { store, getElement } from '@wordpress/interactivity';

store('anypress/before-after', {
	actions: {
		move() {
			const { ref } = getElement();
			ref.closest('.wp-block-anypress-before-after').style.setProperty('--anypress-ba-pos', `${ref.value}%`);
		},
	},
});
