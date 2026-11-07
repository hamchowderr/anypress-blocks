// Age Check block, on the Interactivity API. The dialog opens as a modal unless the visitor said yes within the last
// `remember` days; Escape and closing don't get past it, only an answer does. "No" goes to the leave link, or shows a
// message if there is none.
import { store, getContext, getElement } from '@wordpress/interactivity';

const DAY = 86400000;
const dialogOf = () => getElement().ref.closest('dialog');

store('anypress/age-check', {
	actions: {
		yes() {
			const context = getContext();
			context.ok = true;
			if (context.remember) {
				try {
					localStorage.setItem(context.key, String(Date.now()));
				} catch {
					// Storage blocked (private mode): the check shows again on the next visit.
				}
			}
			dialogOf().close();
			document.documentElement.classList.remove('has-anypress-age-check');
		},
		no() {
			const { leave } = getContext();
			if (leave) {
				location.href = leave;
				return;
			}
			const dialog = dialogOf();
			dialog.querySelector('.wp-block-anypress-age-check__answers').hidden = true;
			dialog.querySelector('.wp-block-anypress-age-check__sorry').hidden = false;
		},
		stay(event) {
			event.preventDefault();
		},
		reopen() {
			if (getContext().ok) return;
			const dialog = getElement().ref;
			// Escape twice in a row can close a dialog even when cancel is stopped; open it straight back.
			requestAnimationFrame(() => dialog.showModal());
		},
	},
	callbacks: {
		check() {
			const context = getContext();
			const dialog = getElement().ref;
			try {
				const at = Number(localStorage.getItem(context.key));
				if (context.remember && at > 0 && Date.now() - at < context.remember * DAY) {
					context.ok = true;
					return;
				}
			} catch {
				// Storage blocked: ask.
			}
			document.documentElement.classList.add('has-anypress-age-check');
			dialog.showModal();
		},
	},
});
