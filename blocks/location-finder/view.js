// Location Finder blocks, on the Interactivity API. The block's context (render.php) holds every location's search
// text, map link and position; each list item's context adds its index.
//   - typing filters the list (name and address, any case) and says how many match;
//   - "Near me" asks the browser for the visitor's position, sorts the list nearest first and shows each distance;
//   - picking a location moves the map to it.
import { store, getContext } from '@wordpress/interactivity';

const RADIUS = { km: 6371, mi: 3958.8 };
const rad = (d) => (d * Math.PI) / 180;
const distance = (a, b, units) => {
	const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
	return 2 * RADIUS[units] * Math.asin(Math.sqrt(h));
};
const matches = (context, index) => {
	const query = context.query.trim().toLowerCase();
	return !query || query.split(/\s+/).every((word) => context.places[index].text.includes(word));
};

store('anypress/location-finder', {
	state: {
		get matches() {
			const context = getContext();
			return matches(context, context.index);
		},
		get isCurrent() {
			const context = getContext();
			return context.index === context.current;
		},
		get order() {
			const context = getContext();
			if (!context.dist.length) return String(context.index);
			return String(context.dist.filter((d) => d < context.dist[context.index]).length);
		},
		get distance() {
			const context = getContext();
			const d = context.dist[context.index];
			if (d === undefined) return '';
			return context.words[context.units].replace('%s', d < 10 ? d.toFixed(1) : String(Math.round(d)));
		},
		get src() {
			const context = getContext();
			return context.places[context.current].src;
		},
		get mapTitle() {
			const context = getContext();
			return context.places[context.current].title;
		},
		get statusText() {
			const context = getContext();
			if (context.status) return context.status;
			const total = context.places.length;
			const shown = context.places.filter((_, i) => matches(context, i)).length;
			if (shown === 0) return context.words.none;
			if (shown < total) return context.words.some.replace('%1$d', shown).replace('%2$d', total);
			return context.dist.length ? context.words.sorted : '';
		},
	},
	actions: {
		stop(event) {
			event.preventDefault();
		},
		search(event) {
			const context = getContext();
			context.query = event.target.value;
			context.status = '';
			// Show the first match on the map, so the map follows the search.
			if (!matches(context, context.current)) {
				const first = context.places.findIndex((_, i) => matches(context, i));
				if (first >= 0) context.current = first;
			}
		},
		pick() {
			const context = getContext();
			context.current = context.index;
		},
		*nearMe() {
			const context = getContext();
			if (!navigator.geolocation) {
				context.status = context.words.failed;
				return;
			}
			context.status = context.words.finding;
			try {
				const position = yield new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 600000 }));
				const here = { lat: position.coords.latitude, lon: position.coords.longitude };
				context.dist = context.places.map((place) => distance(here, place, context.units));
				context.current = context.dist.indexOf(Math.min(...context.dist));
				context.query = '';
				context.status = '';
				const input = document.activeElement?.closest('.wp-block-anypress-location-finder')?.querySelector('input[type="search"]');
				if (input) input.value = '';
			} catch {
				context.status = context.words.failed;
			}
		},
	},
});
