// Phone Bar block, editor side. Plain JavaScript on the editor's globals (no build step).
// The preview shows the bar in place; on the site it is fixed to the bottom of the screen.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, SelectControl, TextControl, Notice } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __ } = wp.i18n;

	registerBlockType('anypress/phone-bar', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps();
			const text = (key, label, help, placeholder) => el(TextControl, { label, help, placeholder, value: a[key], onChange: (value) => setAttributes({ [key]: value }), __nextHasNoMarginBottom: true });
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Buttons', 'anypress-blocks') },
						text('phone', __('Phone number', 'anypress-blocks'), __('Leave empty to use the phone number in Site details.', 'anypress-blocks')),
						text('callLabel', __('Call button', 'anypress-blocks'), '', __('Call now', 'anypress-blocks')),
						text('bookUrl', __('Booking page link', 'anypress-blocks'), __('For example /book/. Leave empty for a Call button only.', 'anypress-blocks')),
						text('bookLabel', __('Book button', 'anypress-blocks'), '', __('Book online', 'anypress-blocks')),
						el(SelectControl, {
							label: __('Show on', 'anypress-blocks'),
							value: a.showOn,
							options: [
								{ label: __('Phones only', 'anypress-blocks'), value: 'phones' },
								{ label: __('Every screen (a corner box on computers)', 'anypress-blocks'), value: 'all' },
							],
							onChange: (showOn) => setAttributes({ showOn }),
							__nextHasNoMarginBottom: true,
						})
					)
				),
				el(
					'div',
					blockProps,
					el('span', { className: 'wp-block-anypress-phone-bar__call wp-element-button', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48 } }, a.callLabel || __('Call now', 'anypress-blocks')),
					a.bookUrl && el('span', { className: 'wp-block-anypress-phone-bar__book', style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48 } }, a.bookLabel || __('Book online', 'anypress-blocks'))
				),
				el(Notice, { status: 'info', isDismissible: false }, a.showOn === 'phones' ? __('On the site this bar sits at the bottom of phone screens.', 'anypress-blocks') : __('On the site this bar sits at the bottom of the screen.', 'anypress-blocks'))
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
