// Popup block, editor side. Plain JavaScript on the editor's globals (no build step).
// The popup is edited in place as a framed box; on the site render.php wraps it in a <dialog> and view.js opens it.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, useInnerBlocksProps, InnerBlocks, InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl, RangeControl, TextControl } = wp.components;
	const { createElement: el, Fragment, useEffect } = wp.element;
	const { __, sprintf } = wp.i18n;

	const TEMPLATE = [
		['core/heading', { level: 2, placeholder: __('Get 10% off your first order', 'anypress-blocks') }],
		['core/paragraph', { placeholder: __('Say what visitors get, then add a signup form or a button.', 'anypress-blocks') }],
	];

	function summary(a) {
		switch (a.trigger) {
			case 'scroll':
				return sprintf(__('Popup: opens at %d%% down the page', 'anypress-blocks'), a.scroll);
			case 'exit':
				return __('Popup: opens when a visitor is about to leave', 'anypress-blocks');
			case 'click':
				return sprintf(__('Popup: opens from links to #%s', 'anypress-blocks'), a.popupId);
			default:
				return sprintf(__('Popup: opens after %d seconds', 'anypress-blocks'), a.delay);
		}
	}

	registerBlockType('anypress/popup', {
		edit({ attributes: a, setAttributes, clientId }) {
			useEffect(() => {
				if (!a.popupId) setAttributes({ popupId: 'popup-' + clientId.slice(0, 8) });
			}, []);

			const blockProps = useBlockProps({
				className: 'is-editor-preview is-size-' + a.size,
				'data-popup-summary': summary(a),
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
						{ title: __('When it opens', 'anypress-blocks') },
						el(SelectControl, {
							label: __('Opens', 'anypress-blocks'),
							value: a.trigger,
							options: [
								{ label: __('After a few seconds', 'anypress-blocks'), value: 'delay' },
								{ label: __('When the visitor scrolls down', 'anypress-blocks'), value: 'scroll' },
								{ label: __('When the visitor is about to leave', 'anypress-blocks'), value: 'exit' },
								{ label: __('Only from a link or button', 'anypress-blocks'), value: 'click' },
							],
							onChange: (trigger) => setAttributes({ trigger }),
							__nextHasNoMarginBottom: true,
						}),
						a.trigger === 'delay' &&
							el(RangeControl, {
								label: __('Seconds after the page opens', 'anypress-blocks'),
								value: a.delay,
								min: 0,
								max: 60,
								onChange: (delay) => setAttributes({ delay }),
								__nextHasNoMarginBottom: true,
							}),
						a.trigger === 'scroll' &&
							el(RangeControl, {
								label: __('How far down the page (%)', 'anypress-blocks'),
								value: a.scroll,
								min: 10,
								max: 100,
								onChange: (scroll) => setAttributes({ scroll }),
								__nextHasNoMarginBottom: true,
							}),
						el(RangeControl, {
							label: __('Show again after (days)', 'anypress-blocks'),
							help: __('After a visitor closes it. 0 shows it on every visit.', 'anypress-blocks'),
							value: a.showAgainDays,
							min: 0,
							max: 90,
							onChange: (showAgainDays) => setAttributes({ showAgainDays }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Popup ID', 'anypress-blocks'),
							help: sprintf(__('Link any button or link to #%s to open this popup.', 'anypress-blocks'), a.popupId),
							value: a.popupId,
							onChange: (popupId) => setAttributes({ popupId: popupId.toLowerCase().replace(/[^a-z0-9-]/g, '-') }),
							__nextHasNoMarginBottom: true,
						})
					),
					el(
						PanelBody,
						{ title: __('Look', 'anypress-blocks'), initialOpen: false },
						el(SelectControl, {
							label: __('Size', 'anypress-blocks'),
							value: a.size,
							options: [
								{ label: __('Small', 'anypress-blocks'), value: 'small' },
								{ label: __('Medium', 'anypress-blocks'), value: 'medium' },
								{ label: __('Large', 'anypress-blocks'), value: 'large' },
							],
							onChange: (size) => setAttributes({ size }),
							__nextHasNoMarginBottom: true,
						}),
						el(SelectControl, {
							label: __('Position', 'anypress-blocks'),
							help: __('Corner popups leave the page usable behind them.', 'anypress-blocks'),
							value: a.position,
							options: [
								{ label: __('Centre, over the page', 'anypress-blocks'), value: 'center' },
								{ label: __('Bottom right corner', 'anypress-blocks'), value: 'bottom-right' },
								{ label: __('Bottom left corner', 'anypress-blocks'), value: 'bottom-left' },
							],
							onChange: (position) => setAttributes({ position }),
							__nextHasNoMarginBottom: true,
						}),
						el(TextControl, {
							label: __('Name for screen readers', 'anypress-blocks'),
							help: __('For example "Newsletter signup".', 'anypress-blocks'),
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
