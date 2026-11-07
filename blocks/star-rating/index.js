// Star Rating block, editor side. Plain JavaScript on the editor's globals (no build step).
// The preview is the same markup render.php prints on the site.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, TextControl, ToggleControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __, _n, sprintf } = wp.i18n;

	const star = (key) => el('svg', { key, viewBox: '0 0 24 24', width: 24, height: 24 }, el('path', { d: 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z' }));

	function words(a, rating, out) {
		const shown = Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
		if (a.count > 0 && a.source) return sprintf(_n('%1$s out of %2$s from %3$s %4$s review', '%1$s out of %2$s from %3$s %4$s reviews', a.count, 'anypress-blocks'), shown, out, a.count.toLocaleString(), a.source);
		if (a.count > 0) return sprintf(_n('%1$s out of %2$s from %3$s review', '%1$s out of %2$s from %3$s reviews', a.count, 'anypress-blocks'), shown, out, a.count.toLocaleString());
		return sprintf(__('Rated %1$s out of %2$s', 'anypress-blocks'), shown, out);
	}

	registerBlockType('anypress/star-rating', {
		edit({ attributes: a, setAttributes }) {
			const out = Math.max(3, Math.min(10, Math.round(a.outOf || 5)));
			const rating = Math.max(0, Math.min(out, Math.round((a.rating || 0) * 10) / 10));
			const row = () => Array.from({ length: out }, (_, i) => star(i));
			const blockProps = useBlockProps({ style: { '--anypress-rating': (rating / out) * 100 + '%' } });

			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Rating', 'anypress-blocks') },
						el(RangeControl, { label: __('Rating', 'anypress-blocks'), value: rating, min: 0, max: out, step: 0.1, onChange: (value) => setAttributes({ rating: value }), __nextHasNoMarginBottom: true }),
						el(RangeControl, { label: __('Out of', 'anypress-blocks'), value: out, min: 3, max: 10, onChange: (outOf) => setAttributes({ outOf }), __nextHasNoMarginBottom: true }),
						el(TextControl, { label: __('Number of reviews', 'anypress-blocks'), help: __('0 leaves it out.', 'anypress-blocks'), type: 'number', min: 0, value: String(a.count || 0), onChange: (count) => setAttributes({ count: Math.max(0, parseInt(count, 10) || 0) }), __nextHasNoMarginBottom: true }),
						el(TextControl, { label: __('Where the reviews are', 'anypress-blocks'), help: __('For example Google, Yelp or Trustpilot.', 'anypress-blocks'), value: a.source, onChange: (source) => setAttributes({ source }), __nextHasNoMarginBottom: true }),
						el(ToggleControl, { label: __('Show the rating in words', 'anypress-blocks'), help: __('Screen readers always hear it.', 'anypress-blocks'), checked: a.showText, onChange: (showText) => setAttributes({ showText }), __nextHasNoMarginBottom: true })
					)
				),
				el(
					'p',
					blockProps,
					el('span', { className: 'wp-block-anypress-star-rating__stars', 'aria-hidden': true }, el('span', { className: 'wp-block-anypress-star-rating__empty' }, row()), el('span', { className: 'wp-block-anypress-star-rating__full' }, row())),
					el('span', { className: 'wp-block-anypress-star-rating__text' + (a.showText ? '' : ' screen-reader-text') }, words(a, rating, out))
				)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
