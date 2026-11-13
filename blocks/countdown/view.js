// Countdown blocks, on the Interactivity API. Each one counts down to its end (milliseconds, from render.php) once a
// second, and when the time is up it shows its "when it ends" words, or hides itself if it has none.
import { store, getContext, getElement } from '@wordpress/interactivity';

const pad = (n) => String(n).padStart(2, '0');

store('anypress/countdown', {
	callbacks: {
		tick() {
			const { ref } = getElement();
			const { end } = getContext();
			const values = Object.fromEntries([...ref.querySelectorAll('[data-unit]')].map((e) => [e.dataset.unit, e]));
			let timer;
			const update = () => {
				const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
				const parts = { days: Math.floor(left / 86400), hours: Math.floor(left / 3600) % 24, minutes: Math.floor(left / 60) % 60, seconds: left % 60 };
				for (const [unit, e] of Object.entries(values)) {
					const text = unit === 'days' ? String(parts.days) : pad(parts[unit]);
					if (e.textContent !== text) e.textContent = text;
				}
				if (left === 0) {
					clearInterval(timer);
					ref.classList.add('is-ended');
					if (!ref.querySelector('.wp-block-anypress-countdown__ended')) ref.hidden = true;
				}
			};
			update();
			timer = setInterval(update, 1000);
			return () => clearInterval(timer);
		},
	},
});
