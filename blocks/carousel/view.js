// Carousel blocks: arrows move one slide, dots jump to a place, and autoplay (data-autoplay seconds) moves on by
// itself, pausing while the visitor hovers, touches or tabs into it, and never when they prefer reduced motion.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function setUp(carousel) {
	const track = carousel.querySelector('.wp-block-anypress-carousel__track');
	if (!track) return;
	const slides = () => Array.from(track.children);
	const prev = carousel.querySelector('.wp-block-anypress-carousel__prev');
	const next = carousel.querySelector('.wp-block-anypress-carousel__next');
	let nav = carousel.querySelector('.wp-block-anypress-carousel__nav');

	// Where the track is: the slide whose left edge is nearest the scroll position.
	const pos = (slide) => slide.offsetLeft - track.offsetLeft;
	const current = () => {
		let best = 0;
		slides().forEach((slide, i, all) => {
			if (Math.abs(pos(slide) - track.scrollLeft) < Math.abs(pos(all[best]) - track.scrollLeft)) best = i;
		});
		return best;
	};
	const atEnd = () => track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
	const go = (index) => {
		const list = slides();
		const target = list[Math.max(0, Math.min(index, list.length - 1))];
		if (target) track.scrollTo({ left: pos(target), behavior: reduced.matches ? 'auto' : 'smooth' });
	};

	// One dot per place the track can stop: with three slides shown, five slides have three places.
	let dots = [];
	let holder = null;
	const places = () => {
		const first = slides()[0];
		if (!first || !first.offsetWidth) return slides().length;
		const shown = Math.max(1, Math.floor((track.clientWidth + 4) / first.offsetWidth));
		return Math.max(1, slides().length - shown + 1);
	};
	const buildDots = () => {
		if (carousel.dataset.dots !== '1') return;
		const count = places() < 2 ? 0 : places();
		if (count === dots.length) return;
		if (!nav) {
			nav = document.createElement('div');
			nav.className = 'wp-block-anypress-carousel__nav';
			carousel.append(nav);
		}
		if (!holder) {
			holder = document.createElement('div');
			holder.className = 'wp-block-anypress-carousel__dots';
			nav.prepend(holder);
		}
		holder.replaceChildren();
		dots = Array.from({ length: count }, (_, i) => {
			const dot = document.createElement('button');
			dot.type = 'button';
			dot.className = 'wp-block-anypress-carousel__dot';
			dot.setAttribute('aria-label', `${i + 1} / ${count}`);
			dot.addEventListener('click', () => go(i));
			holder.append(dot);
			return dot;
		});
	};

	slides().forEach((slide, i, all) => {
		slide.setAttribute('role', 'group');
		slide.setAttribute('aria-roledescription', 'slide');
		if (!slide.hasAttribute('aria-label')) slide.setAttribute('aria-label', `${i + 1} / ${all.length}`);
	});

	const update = () => {
		const index = atEnd() ? dots.length - 1 : current();
		dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
		if (prev) prev.disabled = track.scrollLeft <= 2;
		if (next) next.disabled = atEnd();
		carousel.classList.toggle('is-static', track.scrollWidth <= track.clientWidth + 2);
	};
	buildDots();
	update();

	prev?.addEventListener('click', () => go(current() - 1));
	next?.addEventListener('click', () => go(current() + 1));
	track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
	window.addEventListener('resize', () => { buildDots(); update(); });
	track.addEventListener('keydown', (event) => {
		if (event.target !== track) return;
		if (event.key === 'ArrowRight') { event.preventDefault(); go(current() + 1); }
		if (event.key === 'ArrowLeft') { event.preventDefault(); go(current() - 1); }
	});

	const seconds = Number(carousel.dataset.autoplay || 0);
	if (seconds > 0 && slides().length > 1) {
		let paused = false;
		carousel.addEventListener('mouseenter', () => { paused = true; });
		carousel.addEventListener('mouseleave', () => { paused = false; });
		carousel.addEventListener('focusin', () => { paused = true; });
		carousel.addEventListener('focusout', () => { paused = false; });
		carousel.addEventListener('touchstart', () => { paused = true; }, { passive: true });
		setInterval(() => {
			if (paused || reduced.matches || document.hidden) return;
			if (atEnd()) go(0);
			else go(current() + 1);
		}, seconds * 1000);
	}
}

document.querySelectorAll('.wp-block-anypress-carousel').forEach(setUp);
