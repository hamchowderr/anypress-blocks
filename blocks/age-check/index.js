// Age Check block, editor side. Plain JavaScript on the editor's globals (no build step).
// The question is edited in place as a framed box; on the site it covers the page until the visitor answers.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, useInnerBlocksProps, InnerBlocks, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, TextControl } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __, sprintf } = wp.i18n;

	const TEMPLATE = [
		['core/heading', { level: 2, placeholder: __('Are you 21 or over?', 'anypress-blocks') }],
		['core/paragraph', { placeholder: __('You need to be 21 or over to visit this site.', 'anypress-blocks') }],
	];

	registerBlockType('anypress/age-check', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps();
			const { children, ...wrapper } = useInnerBlocksProps(blockProps, { template: TEMPLATE });
			const yes = a.yesLabel || sprintf(__('Yes, I am %d or over', 'anypress-blocks'), a.minAge);
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Age check', 'anypress-blocks') },
						el(RangeControl, { label: __('Minimum age', 'anypress-blocks'), value: a.minAge, min: 13, max: 25, onChange: (minAge) => setAttributes({ minAge }), __nextHasNoMarginBottom: true }),
						el(TextControl, { label: __('Yes button', 'anypress-blocks'), placeholder: yes, value: a.yesLabel, onChange: (yesLabel) => setAttributes({ yesLabel }), __nextHasNoMarginBottom: true }),
						el(TextControl, { label: __('No button', 'anypress-blocks'), placeholder: __('No', 'anypress-blocks'), value: a.noLabel, onChange: (noLabel) => setAttributes({ noLabel }), __nextHasNoMarginBottom: true }),
						el(TextControl, { label: __('After "No", go to', 'anypress-blocks'), help: __('A web address. Leave empty to show a "Sorry" message instead.', 'anypress-blocks'), value: a.leaveUrl, onChange: (leaveUrl) => setAttributes({ leaveUrl }), __nextHasNoMarginBottom: true }),
						el(RangeControl, { label: __('Remember a "Yes" for (days)', 'anypress-blocks'), help: __('0 asks on every visit.', 'anypress-blocks'), value: a.rememberDays, min: 0, max: 365, onChange: (rememberDays) => setAttributes({ rememberDays }), __nextHasNoMarginBottom: true })
					)
				),
				el(
					'div',
					wrapper,
					children,
					el('div', { className: 'wp-block-anypress-age-check__answers' }, el('span', { className: 'wp-element-button' }, yes), el('span', { className: 'wp-block-anypress-age-check__no' }, a.noLabel || __('No', 'anypress-blocks')))
				)
			);
		},
		save() {
			return el(InnerBlocks.Content);
		},
	});
})(window.wp);
