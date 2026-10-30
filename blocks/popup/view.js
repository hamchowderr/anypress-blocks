// Popup blocks, on the Interactivity API. Each popup is a <dialog> (render.php sets its context):
//   - it opens on its trigger (delay, scroll, exit or click), at most one automatic popup per page view;
//   - any link on the page to #<popup id> opens it, whatever its trigger;
//   - it closes with its close button, the Escape key or a click outside it;
//   - once closed it stays closed for showAgain days (0: it opens again on every visit).
import { store, getContext, getElement } from '@wordpress/interactivity';

const KEY = 'anypress-popup:';
const DAY = 86400000;
let autoOpened = false;

const seenRecently = (id, days) => {
	if (!days) return false;
	try {
		const at = Number(localStorage.getItem(KEY + id));
		return at > 0 && Date.now() - at < days * DAY;
	} catch {
		return false;
	}
};

const remember = (id) => {
	try {
		localStorage.setItem(KEY + id, String(Date.now()));
	} catch {
		// Storage blocked (private mode): the popup may show again, which is fine.
	}
};

function open(dialog) {
	if (dialog.open) return;
	try {
		if (dialog.classList.contains('is-position-center')) dialog.showModal();
		else dialog.show();
	} catch {
		dialog.setAttribute('open', '');
	}
}

store('anypress/popup', {
	actions: {
		close() {
			getElement().ref.closest('dialog')?.close();
		},
		// A click on the backdrop lands on the dialog itself, outside its box.
		closeOutside(event) {
			const dialog = getElement().ref;
			if (event.target !== dialog) return;
			const box = dialog.getBoundingClientRect();
			const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
			if (!inside) dialog.close();
		},
		remember() {
			remember(getElement().ref.id);
		},
		// Links to #<popup id> anywhere on the page.
		openFromLink(event) {
			const dialog = getElement().ref;
			const link = event.target.closest?.('a[href*="#"]');
			if (!link) return;
			const url = new URL(link.href, location.href);
			if (url.origin !== location.origin || url.pathname !== location.pathname || decodeURIComponent(url.hash.slice(1)) !== dialog.id) return;
			event.preventDefault();
			open(dialog);
		},
	},
	callbacks: {
		setUp() {
			const dialog = getElement().ref;
			const { trigger, delay, scroll, showAgain } = getContext();
			const cleanups = [];
			const openOnce = () => {
				if (autoOpened || seenRecently(dialog.id, showAgain) || document.querySelector('dialog.wp-block-anypress-popup[open]')) return;
				autoOpened = true;
				open(dialog);
			};
			const onScroll = (percent) => {
				const check = () => {
					const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
					if (scrolled * 100 >= percent) {
						window.removeEventListener('scroll', check);
						openOnce();
					}
				};
				window.addEventListener('scroll', check, { passive: true });
				cleanups.push(() => window.removeEventListener('scroll', check));
			};

			if (trigger === 'delay') {
				const timer = setTimeout(openOnce, delay * 1000);
				cleanups.push(() => clearTimeout(timer));
			} else if (trigger === 'scroll') {
				onScroll(scroll);
			} else if (trigger === 'exit') {
				// Phones and tablets have no pointer leaving the page: open halfway down instead.
				if (window.matchMedia('(hover: none)').matches) {
					onScroll(50);
				} else {
					const onLeave = (event) => {
						if (!event.relatedTarget && event.clientY <= 0) openOnce();
					};
					document.addEventListener('mouseout', onLeave);
					cleanups.push(() => document.removeEventListener('mouseout', onLeave));
				}
			}

			if (location.hash === `#${dialog.id}`) open(dialog);

			// Runs when the popup leaves the page (client-side navigation), so nothing is left listening.
			return () => cleanups.forEach((cleanup) => cleanup());
		},
	},
});
