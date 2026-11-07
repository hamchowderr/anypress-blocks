// Notice Bar block, editor side. Plain JavaScript on the editor's globals (no build step).
// The message is edited in place; on the site render.php adds the close button.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, useInnerBlocksProps, InnerBlocks, InspectorControls } = wp.blockEditor;
	const { PanelBody, RangeControl, ToggleControl } = wp.components;
	const { createElement: el, Fragment, useEffect } = wp.element;
	const { __ } = wp.i18n;

	const TEMPLATE = [['core/paragraph', { placeholder: __('One short message, such as holiday hours or free delivery.', 'anypress-blocks') }]];

	registerBlockType('anypress/notice-bar', {
		edit({ attributes: a, setAttributes, clientId }) {
			useEffect(() => {
				if (!a.noticeId) setAttributes({ noticeId: 'notice-' + clientId.slice(0, 8) });
			}, []);
			const blockProps = useBlockProps({ className: a.dismissible ? 'is-dismissible' : '' });
			const innerBlocksProps = useInnerBlocksProps(blockProps, { template: TEMPLATE, allowedBlocks: ['core/paragraph', 'core/buttons'], templateLock: false });
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Closing', 'anypress-blocks') },
						el(ToggleControl, { label: __('Visitors can close it', 'anypress-blocks'), checked: a.dismissible, onChange: (dismissible) => setAttributes({ dismissible }), __nextHasNoMarginBottom: true }),
						a.dismissible &&
							el(RangeControl, {
								label: __('Show again after (days)', 'anypress-blocks'),
								help: __('After a visitor closes it. Changing the message shows it again straight away. 0 shows it on every page.', 'anypress-blocks'),
								value: a.showAgainDays,
								min: 0,
								max: 365,
								onChange: (showAgainDays) => setAttributes({ showAgainDays }),
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
