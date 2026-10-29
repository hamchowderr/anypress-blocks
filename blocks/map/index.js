// Map block, editor side. Plain JavaScript on the editor's globals (no build step).
// Type an address and press "Find" to place the pin (it asks OpenStreetMap's Nominatim search once), or type the
// latitude and longitude. The preview is the same OpenStreetMap map the site shows.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button, Notice } = wp.components;
	const { createElement: el, Fragment, useState } = wp.element;
	const { __ } = wp.i18n;

	const embed = (a) => {
		const dlon = 540 / Math.pow(2, a.zoom);
		const dlat = dlon * Math.cos((a.lat * Math.PI) / 180) * 0.6;
		const r = (n) => Math.round(n * 1e5) / 1e5;
		const bbox = [r(a.lon - dlon), r(a.lat - dlat), r(a.lon + dlon), r(a.lat + dlat)].join(',');
		return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${a.lat},${a.lon}`;
	};
	const hasPlace = (a) => typeof a.lat === 'number' && typeof a.lon === 'number';

	function Finder({ attributes: a, setAttributes }) {
		const [busy, setBusy] = useState(false);
		const [error, setError] = useState('');
		const find = () => {
			if (!a.address.trim()) return;
			setBusy(true);
			setError('');
			fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(a.address))
				.then((res) => res.json())
				.then((found) => {
					if (!found.length) {
						setError(__('No place found for that address. Check it, or type the latitude and longitude.', 'anypress-blocks'));
						return;
					}
					setAttributes({ lat: Number(Number(found[0].lat).toFixed(6)), lon: Number(Number(found[0].lon).toFixed(6)) });
				})
				.catch(() => setError(__('The map search could not be reached. Type the latitude and longitude instead.', 'anypress-blocks')))
				.finally(() => setBusy(false));
		};
		return el(
			Fragment,
			null,
			el(TextControl, {
				label: __('Address or place', 'anypress-blocks'),
				value: a.address,
				onChange: (address) => setAttributes({ address }),
				onKeyDown: (event) => {
					if (event.key === 'Enter') {
						event.preventDefault();
						find();
					}
				},
				__nextHasNoMarginBottom: true,
			}),
			el(Button, { variant: 'secondary', onClick: find, isBusy: busy, disabled: busy || !a.address.trim(), style: { marginTop: '8px' } }, __('Find on the map', 'anypress-blocks')),
			error && el(Notice, { status: 'warning', isDismissible: false }, error)
		);
	}

	registerBlockType('anypress/map', {
		edit(props) {
			const { attributes: a, setAttributes } = props;
			const blockProps = useBlockProps({ style: { '--anypress-map-aspect': a.aspect } });
			const number = (key) =>
				el(TextControl, {
					label: key === 'lat' ? __('Latitude', 'anypress-blocks') : __('Longitude', 'anypress-blocks'),
					type: 'number',
					value: a[key] === undefined ? '' : String(a[key]),
					onChange: (value) => setAttributes({ [key]: value === '' ? undefined : Number(value) }),
					__nextHasNoMarginBottom: true,
				});

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Place', 'anypress-blocks') },
						el(Finder, props),
						number('lat'),
						number('lon'),
						el(RangeControl, {
							label: __('Zoom', 'anypress-blocks'),
							help: __('Higher shows streets, lower shows the whole area you cover.', 'anypress-blocks'),
							value: a.zoom,
							min: 3,
							max: 18,
							onChange: (zoom) => setAttributes({ zoom }),
							__nextHasNoMarginBottom: true,
						})
					),
					el(
						PanelBody,
						{ title: __('Look', 'anypress-blocks'), initialOpen: false },
						el(SelectControl, {
							label: __('Shape', 'anypress-blocks'),
							value: a.aspect,
							options: [
								{ label: __('Wide (16:9)', 'anypress-blocks'), value: '16/9' },
								{ label: __('Extra wide (21:9)', 'anypress-blocks'), value: '21/9' },
								{ label: __('Classic (4:3)', 'anypress-blocks'), value: '4/3' },
								{ label: __('Square', 'anypress-blocks'), value: '1/1' },
							],
							onChange: (aspect) => setAttributes({ aspect }),
							__nextHasNoMarginBottom: true,
						}),
						el(ToggleControl, {
							label: __('"Get directions" link', 'anypress-blocks'),
							checked: a.directions,
							onChange: (directions) => setAttributes({ directions }),
							__nextHasNoMarginBottom: true,
						}),
						el(ToggleControl, {
							label: __('Ask before loading the map', 'anypress-blocks'),
							help: __('Visitors press "Show the map" first, so nothing is sent to OpenStreetMap until they do.', 'anypress-blocks'),
							checked: a.askFirst,
							onChange: (askFirst) => setAttributes({ askFirst }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el(
					'figure',
					blockProps,
					hasPlace(a)
						? el('div', { className: 'wp-block-anypress-map__frame' }, el('iframe', { src: embed(a), title: a.address || __('Map', 'anypress-blocks'), tabIndex: -1 }))
						: el('div', { className: 'wp-block-anypress-map__frame wp-block-anypress-map__empty' }, el('p', null, __('Map: type an address and press "Find on the map".', 'anypress-blocks')), el(Finder, props)),
					a.directions && hasPlace(a) && el('figcaption', { className: 'wp-block-anypress-map__caption' }, el('a', { href: '#', onClick: (e) => e.preventDefault() }, __('Get directions', 'anypress-blocks')))
				)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
