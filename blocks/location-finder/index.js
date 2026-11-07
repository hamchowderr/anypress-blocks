// Location Finder block, editor side. Plain JavaScript on the editor's globals (no build step).
// Add each location in the block settings: type its address and press "Find on the map" (it asks OpenStreetMap's
// Nominatim search once), or type the latitude and longitude. The preview shows the list and the picked location's map.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, Button, TextControl, ToggleControl, SelectControl, RangeControl, Notice, Placeholder } = wp.components;
	const { createElement: el, Fragment, useState } = wp.element;
	const { __, sprintf } = wp.i18n;

	const embed = (p, zoom) => {
		const dlon = 540 / Math.pow(2, zoom);
		const dlat = dlon * Math.cos((p.lat * Math.PI) / 180) * 0.6;
		const r = (n) => Math.round(n * 1e5) / 1e5;
		return `https://www.openstreetmap.org/export/embed.html?bbox=${[r(p.lon - dlon), r(p.lat - dlat), r(p.lon + dlon), r(p.lat + dlat)].join(',')}&layer=mapnik&marker=${p.lat},${p.lon}`;
	};
	const placed = (p) => typeof p.lat === 'number' && typeof p.lon === 'number';

	function Row({ place, index, update, remove }) {
		const [busy, setBusy] = useState(false);
		const [error, setError] = useState('');
		const set = (key) => (value) => update(index, { ...place, [key]: value });
		const find = () => {
			if (!(place.address || '').trim()) return;
			setBusy(true);
			setError('');
			fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(place.address))
				.then((res) => res.json())
				.then((found) => {
					if (!found.length) {
						setError(__('No place found for that address. Check it, or type the latitude and longitude.', 'anypress-blocks'));
						return;
					}
					update(index, { ...place, lat: Number(Number(found[0].lat).toFixed(6)), lon: Number(Number(found[0].lon).toFixed(6)) });
				})
				.catch(() => setError(__('The map search could not be reached. Type the latitude and longitude instead.', 'anypress-blocks')))
				.finally(() => setBusy(false));
		};
		const text = (key, label, help) => el(TextControl, { label, help, value: place[key] || '', onChange: set(key), __nextHasNoMarginBottom: true });
		const number = (key, label) => el(TextControl, { label, type: 'number', value: place[key] === undefined ? '' : String(place[key]), onChange: (value) => update(index, { ...place, [key]: value === '' ? undefined : Number(value) }), __nextHasNoMarginBottom: true });
		return el(
			PanelBody,
			{ title: place.name || place.address || sprintf(__('Location %d', 'anypress-blocks'), index + 1), initialOpen: !placed(place) },
			el(
				'div',
				{ className: 'anypress-location-finder__row' },
				text('name', __('Name', 'anypress-blocks'), __('For example "Downtown".', 'anypress-blocks')),
				text('address', __('Address', 'anypress-blocks')),
				el(Button, { variant: 'secondary', onClick: find, isBusy: busy, disabled: busy || !(place.address || '').trim() }, __('Find on the map', 'anypress-blocks')),
				error && el(Notice, { status: 'warning', isDismissible: false }, error),
				number('lat', __('Latitude', 'anypress-blocks')),
				number('lon', __('Longitude', 'anypress-blocks')),
				text('phone', __('Phone', 'anypress-blocks')),
				text('hours', __('Opening hours', 'anypress-blocks'), __('One line, for example "Mon to Sat 8 to 6".', 'anypress-blocks')),
				text('url', __('Location page link', 'anypress-blocks'), __('Optional, for example /locations/downtown/.', 'anypress-blocks')),
				el(Button, { variant: 'link', isDestructive: true, onClick: () => remove(index) }, __('Remove this location', 'anypress-blocks'))
			)
		);
	}

	registerBlockType('anypress/location-finder', {
		edit({ attributes: a, setAttributes }) {
			const [current, setCurrent] = useState(0);
			const blockProps = useBlockProps();
			const list = a.locations || [];
			const update = (index, place) => setAttributes({ locations: list.map((p, i) => (i === index ? place : p)) });
			const remove = (index) => setAttributes({ locations: list.filter((_, i) => i !== index) });
			const add = () => setAttributes({ locations: [...list, { name: '', address: '' }] });
			const shown = list.filter(placed);
			const pick = shown[Math.min(current, shown.length - 1)];

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Finder', 'anypress-blocks') },
						el(ToggleControl, { label: __('Search and "Near me"', 'anypress-blocks'), checked: a.search, onChange: (search) => setAttributes({ search }), __nextHasNoMarginBottom: true }),
						el(SelectControl, { label: __('Distances in', 'anypress-blocks'), value: a.units, options: [{ label: __('Miles', 'anypress-blocks'), value: 'mi' }, { label: __('Kilometres', 'anypress-blocks'), value: 'km' }], onChange: (units) => setAttributes({ units }), __nextHasNoMarginBottom: true }),
						el(RangeControl, { label: __('Map zoom', 'anypress-blocks'), value: a.zoom, min: 3, max: 18, onChange: (zoom) => setAttributes({ zoom }), __nextHasNoMarginBottom: true })
					),
					list.map((place, index) => el(Row, { key: index, place, index, update, remove })),
					el(PanelBody, { title: __('Add a location', 'anypress-blocks'), initialOpen: true }, el(Button, { variant: 'primary', onClick: add }, __('Add a location', 'anypress-blocks')))
				),
				el(
					'div',
					blockProps,
					!shown.length
						? el(Placeholder, { label: __('Location Finder', 'anypress-blocks'), instructions: __('Add your locations in the block settings. Each needs an address found on the map.', 'anypress-blocks') }, el(Button, { variant: 'primary', onClick: add }, __('Add a location', 'anypress-blocks')))
						: [
								el(
									'div',
									{ key: 'panel', className: 'wp-block-anypress-location-finder__panel' },
									el(
										'ul',
										{ className: 'wp-block-anypress-location-finder__list' },
										shown.map((p, i) =>
											el(
												'li',
												{ key: i, className: 'wp-block-anypress-location-finder__place' + (p === pick ? ' is-current' : '') },
												el('button', { type: 'button', className: 'wp-block-anypress-location-finder__pick', onClick: () => setCurrent(i) }, el('strong', null, p.name || p.address), p.name && p.address && el('span', null, p.address)),
												p.hours && el('p', { className: 'wp-block-anypress-location-finder__hours' }, p.hours)
											)
										)
									)
								),
								el('div', { key: 'map', className: 'wp-block-anypress-location-finder__map' }, el('iframe', { src: embed(pick, a.zoom), title: pick.name || pick.address, loading: 'lazy' })),
						  ]
				)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
