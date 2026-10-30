// Counter blocks, on the Interactivity API: each counts up from zero to its number the first time it scrolls
// into view. The page already shows the final number; with reduced motion, or without IntersectionObserver,
// it stays as it is.
import { store, getContext, getElement } from '@wordpress/interactivity';

function run(counter, { number, decimals, duration }) {
	const out = counter.querySelector('.wp-block-anypress-counter__number');
	if (!out || !duration) return;
	const format = new Intl.NumberFormat(document.documentElement.lang || undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	const finalText = out.textContent;
	const start = performance.now();
	const step = (now) => {
		const t = Math.min(1, (now - start) / (duration * 1000));
		const eased = 1 - Math.pow(1 - t, 3);
		out.textContent = t < 1 ? format.format(number * eased) : finalText;
		if (t < 1) requestAnimationFrame(step);
	};
	out.textContent = format.format(0);
	requestAnimationFrame(step);
}

store('anypress/counter', {
	callbacks: {
		countWhenSeen() {
			if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
			const counter = getElement().ref;
			const settings = { ...getContext() };
			// Counters already on screen when the page opens count too.
			const seen = new IntersectionObserver((entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				seen.disconnect();
				run(counter, settings);
			}, { threshold: 0.5 });
			seen.observe(counter);
			return () => seen.disconnect();
		},
	},
});
