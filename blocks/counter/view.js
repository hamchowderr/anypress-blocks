// Counter blocks count up from zero to their number the first time they scroll into view.
// The page already shows the final number; with reduced motion, or without IntersectionObserver, it stays as it is.
const counters = document.querySelectorAll('.wp-block-anypress-counter');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function run(counter) {
	const out = counter.querySelector('.wp-block-anypress-counter__number');
	const end = Number(counter.dataset.number || 0);
	const decimals = Number(counter.dataset.decimals || 0);
	const duration = Number(counter.dataset.duration || 2) * 1000;
	if (!out || !duration) return;
	const format = new Intl.NumberFormat(document.documentElement.lang || undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
	const finalText = out.textContent;
	const start = performance.now();
	const step = (now) => {
		const t = Math.min(1, (now - start) / duration);
		const eased = 1 - Math.pow(1 - t, 3);
		out.textContent = t < 1 ? format.format(end * eased) : finalText;
		if (t < 1) requestAnimationFrame(step);
	};
	out.textContent = format.format(0);
	requestAnimationFrame(step);
}

if (counters.length && !reduced && 'IntersectionObserver' in window) {
	const seen = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			seen.unobserve(entry.target);
			run(entry.target);
		});
	}, { threshold: 0.5 });
	counters.forEach((counter) => {
		// Counters already on screen when the page opens count too.
		seen.observe(counter);
	});
}
