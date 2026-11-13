// Notice Bar blocks, on the Interactivity API. A closed bar stays hidden for showAgain days (0: for this page view only),
// and a changed message has a new key, so it shows again.
import { store, getContext, getElement } from '@wordpress/interactivity';

const KEY = 'anypress-notice:';
const DAY = 86400000;

store('anypress/notice-bar', {
	actions: {
		dismiss() {
			const { key, showAgain } = getContext();
			getElement().ref.closest('.wp-block-anypress-notice-bar').hidden = true;
			if (!showAgain) return;
			try {
				localStorage.setItem(KEY + key, String(Date.now()));
			} catch {
				// Storage blocked (private mode): the bar shows again on the next page, which is fine.
			}
		},
	},
	callbacks: {
		check() {
			const { key, showAgain } = getContext();
			if (!showAgain) return;
			try {
				const at = Number(localStorage.getItem(KEY + key));
				if (at > 0 && Date.now() - at < showAgain * DAY) getElement().ref.hidden = true;
			} catch {
				// Storage blocked: keep showing it.
			}
		},
	},
});
