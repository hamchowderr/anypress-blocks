// Opens and closes Popup blocks. Each popup is a <dialog>:
//   - it opens on its trigger (data-trigger: delay, scroll, exit or click), at most one automatic popup per page view;
//   - any link to #<popup id> opens it, whatever its trigger;
//   - it closes with its close button, the Escape key or a click outside it;
//   - once closed it stays closed for data-show-again days (0: it opens again on every visit).
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

const isModal = (dialog) => dialog.classList.contains('is-position-center');

function open(dialog) {
	if (dialog.open) return;
	try {
		if (isModal(dialog)) dialog.showModal();
		else dialog.show();
	} catch {
		dialog.setAttribute('open', '');
	}
}

function setUp(dialog) {
	const id = dialog.id;
	const days = Number(dialog.dataset.showAgain || 0);

	dialog.addEventListener('close', () => remember(id));
	dialog.querySelector('.wp-block-anypress-popup__close')?.addEventListener('click', () => dialog.close());
	// A click on the backdrop lands on the dialog itself, outside its box.
	dialog.addEventListener('click', (event) => {
		if (event.target !== dialog) return;
		const box = dialog.getBoundingClientRect();
		const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
		if (!inside) dialog.close();
	});

	const openOnce = () => {
		if (autoOpened || seenRecently(id, days) || document.querySelector('dialog.wp-block-anypress-popup[open]')) return;
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
	};

	const trigger = dialog.dataset.trigger;
	if (trigger === 'delay') {
		setTimeout(openOnce, Number(dialog.dataset.delay || 0) * 1000);
	} else if (trigger === 'scroll') {
		onScroll(Number(dialog.dataset.scroll || 50));
	} else if (trigger === 'exit') {
		// Phones and tablets have no pointer leaving the page: open halfway down instead.
		if (window.matchMedia('(hover: none)').matches) {
			onScroll(50);
		} else {
			document.addEventListener('mouseout', (event) => {
				if (!event.relatedTarget && event.clientY <= 0) openOnce();
			});
		}
	}

	if (location.hash === `#${id}`) open(dialog);
}

const popups = document.querySelectorAll('dialog.wp-block-anypress-popup');
popups.forEach(setUp);

if (popups.length) {
	document.addEventListener('click', (event) => {
		const link = event.target.closest?.('a[href*="#"]');
		if (!link) return;
		const url = new URL(link.href, location.href);
		if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash.length < 2) return;
		const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
		if (!target || !target.matches('dialog.wp-block-anypress-popup')) return;
		event.preventDefault();
		open(target);
	});
}
