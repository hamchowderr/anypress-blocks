// Counter block, editor side. Plain JavaScript on the editor's globals (no build step).
// The editor shows the final number; on the site view.js counts up to it when it scrolls into view.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, TextControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __ } = wp.i18n;

	const format = (a) =>
		new Intl.NumberFormat(document.documentElement.lang || undefined, {
			minimumFractionDigits: a.decimals,
			maximumFractionDigits: a.decimals,
		}).format(a.number || 0);

	registerBlockType('anypress/counter', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps();
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Number', 'anypress-blocks') },
						el(TextControl, {
							label: __('Counts up to', 'anypress-blocks'),
							type: 'number',
							value: String(a.number),
							onChange: (value) => setAttributes({ number: Number(value) || 0 }),
							__nextHasNoMarginBottom: true,
						}),
						el(RangeControl, {
							label: __('Decimal places', 'anypress-blocks'),
							value: a.decimals,
							min: 0,
							max: 3,
							onChange: (decimals) => setAttributes({ decimals }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Before the number', 'anypress-blocks'),
							help: __('For example $.', 'anypress-blocks'),
							value: a.prefix,
							onChange: (prefix) => setAttributes({ prefix }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('After the number', 'anypress-blocks'),
							help: __('For example + or %.', 'anypress-blocks'),
							value: a.suffix,
							onChange: (suffix) => setAttributes({ suffix }),
							__nextHasNoMarginBottom: true,
						}),
						el(RangeControl, {
							label: __('Counting time (seconds)', 'anypress-blocks'),
							help: __('0 shows the number without counting.', 'anypress-blocks'),
							value: a.duration,
							min: 0,
							max: 10,
							step: 0.5,
							onChange: (duration) => setAttributes({ duration }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el('p', blockProps, a.prefix, el('span', { className: 'wp-block-anypress-counter__number' }, format(a)), a.suffix)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
