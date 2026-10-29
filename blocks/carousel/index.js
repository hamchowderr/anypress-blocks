// Carousel block, editor side. Plain JavaScript on the editor's globals (no build step).
// Each block inside is one slide. The editor shows every slide in a grid; on the site render.php puts them in a
// sideways-scrolling track and view.js adds the arrows, dots and autoplay.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, useInnerBlocksProps, InnerBlocks, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, ToggleControl, TextControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __, sprintf } = wp.i18n;

	const slide = (text, name) => [
		'core/group',
		{ layout: { type: 'default' } },
		[
			['core/paragraph', { placeholder: text }],
			['core/paragraph', { placeholder: name }],
		],
	];
	const TEMPLATE = [
		slide(__('What a customer said about you…', 'anypress-blocks'), __('Their name and town', 'anypress-blocks')),
		slide(__('A second review, or a project, a team member or a photo…', 'anypress-blocks'), __('Their name and town', 'anypress-blocks')),
		slide(__('Add as many slides as you like: each block inside is one slide.', 'anypress-blocks'), __('Their name and town', 'anypress-blocks')),
	];

	registerBlockType('anypress/carousel', {
		edit({ attributes: a, setAttributes }) {
			const summary = a.autoplay
				? sprintf(__('Carousel: %1$d slides at a time, moves every %2$d seconds', 'anypress-blocks'), a.perView, a.autoplay)
				: sprintf(__('Carousel: %d slides at a time', 'anypress-blocks'), a.perView);
			const blockProps = useBlockProps({
				className: 'is-editor-preview',
				style: { '--anypress-carousel-per-view': a.perView },
				'data-carousel-summary': summary,
			});
			const innerBlocksProps = useInnerBlocksProps(blockProps, { template: TEMPLATE });

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Slides', 'anypress-blocks') },
						el(RangeControl, {
							label: __('Slides shown at a time', 'anypress-blocks'),
							help: __('On a computer. Phones show one slide and the edge of the next.', 'anypress-blocks'),
							value: a.perView,
							min: 1,
							max: 4,
							onChange: (perView) => setAttributes({ perView }),
							__nextHasNoMarginBottom: true,
						}),
						el(RangeControl, {
							label: __('Move on by itself every (seconds)', 'anypress-blocks'),
							help: __('0 waits for the visitor. It pauses while someone hovers, touches or tabs into it.', 'anypress-blocks'),
							value: a.autoplay,
							min: 0,
							max: 30,
							onChange: (autoplay) => setAttributes({ autoplay }),
							__nextHasNoMarginBottom: true,
						}),
						el(ToggleControl, {
							label: __('Arrows', 'anypress-blocks'),
							checked: a.arrows,
							onChange: (arrows) => setAttributes({ arrows }),
							__nextHasNoMarginBottom: true,
						}),
						el(ToggleControl, {
							label: __('Dots', 'anypress-blocks'),
							checked: a.dots,
							onChange: (dots) => setAttributes({ dots }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Name for screen readers', 'anypress-blocks'),
							help: __('For example "Customer reviews".', 'anypress-blocks'),
							value: a.label,
							onChange: (label) => setAttributes({ label }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el('div', innerBlocksProps)
			);
		},
		save() {
			return el(InnerBlocks.Content);
		},
	});
})(window.wp);
