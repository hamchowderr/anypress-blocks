// Before and After block, editor side. Plain JavaScript on the editor's globals (no build step).
// Pick the two photos, then drag the handle in the preview to choose where it starts.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls, MediaPlaceholder, MediaUpload, MediaUploadCheck, BlockControls } = wp.blockEditor;
	const { PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToolbarGroup, ToolbarButton } = wp.components;
	const { createElement: el, Fragment } = wp.element;
	const { __ } = wp.i18n;

	const picked = (side) => (media) => ({ [side + 'Id']: media.id, [side + 'Url']: media.sizes?.large?.url || media.url, [side + 'Alt']: media.alt || '' });

	registerBlockType('anypress/before-after', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps({ style: { '--anypress-ba-aspect': a.aspect, '--anypress-ba-pos': a.start + '%' } });
			const before = a.beforeLabel || __('Before', 'anypress-blocks');
			const after = a.afterLabel || __('After', 'anypress-blocks');

			const placeholder = (side, label) =>
				el(MediaPlaceholder, {
					key: side,
					icon: 'format-image',
					labels: { title: label, instructions: side === 'before' ? __('The photo from before the job.', 'anypress-blocks') : __('The photo of the finished job, taken from the same spot.', 'anypress-blocks') },
					accept: 'image/*',
					allowedTypes: ['image'],
					onSelect: (media) => setAttributes(picked(side)(media)),
				});
			const replace = (side, label) =>
				el(MediaUploadCheck, { key: side }, el(MediaUpload, { allowedTypes: ['image'], value: a[side + 'Id'], onSelect: (media) => setAttributes(picked(side)(media)), render: ({ open }) => el(ToolbarButton, { onClick: open }, label) }));

			const inspector = el(
				InspectorControls,
				null,
				el(
					PanelBody,
					{ title: __('Photos', 'anypress-blocks') },
					el(TextareaControl, { label: __('Describe the "before" photo', 'anypress-blocks'), value: a.beforeAlt, onChange: (beforeAlt) => setAttributes({ beforeAlt }), __nextHasNoMarginBottom: true }),
					el(TextareaControl, { label: __('Describe the "after" photo', 'anypress-blocks'), value: a.afterAlt, onChange: (afterAlt) => setAttributes({ afterAlt }), __nextHasNoMarginBottom: true }),
					el(TextControl, { label: __('Label on the left', 'anypress-blocks'), placeholder: __('Before', 'anypress-blocks'), value: a.beforeLabel, onChange: (beforeLabel) => setAttributes({ beforeLabel }), __nextHasNoMarginBottom: true }),
					el(TextControl, { label: __('Label on the right', 'anypress-blocks'), placeholder: __('After', 'anypress-blocks'), value: a.afterLabel, onChange: (afterLabel) => setAttributes({ afterLabel }), __nextHasNoMarginBottom: true }),
					el(RangeControl, { label: __('Handle starts at (%)', 'anypress-blocks'), value: a.start, min: 5, max: 95, onChange: (start) => setAttributes({ start }), __nextHasNoMarginBottom: true }),
					el(SelectControl, {
						label: __('Shape', 'anypress-blocks'),
						value: a.aspect,
						options: [
							{ label: __('Wide (16:9)', 'anypress-blocks'), value: '16/9' },
							{ label: __('Standard (4:3)', 'anypress-blocks'), value: '4/3' },
							{ label: __('Square', 'anypress-blocks'), value: '1/1' },
							{ label: __('Tall (3:4)', 'anypress-blocks'), value: '3/4' },
						],
						onChange: (aspect) => setAttributes({ aspect }),
						__nextHasNoMarginBottom: true,
					})
				)
			);

			if (!a.beforeUrl || !a.afterUrl) {
				return el(Fragment, null, inspector, el('div', blockProps, el('div', { className: 'wp-block-anypress-before-after__pick' }, !a.beforeUrl ? placeholder('before', before) : el('img', { src: a.beforeUrl, alt: '' }), !a.afterUrl ? placeholder('after', after) : el('img', { src: a.afterUrl, alt: '' }))));
			}

			return el(
				Fragment,
				null,
				inspector,
				el(BlockControls, null, el(ToolbarGroup, null, replace('before', __('Replace before', 'anypress-blocks')), replace('after', __('Replace after', 'anypress-blocks')))),
				el(
					'figure',
					blockProps,
					el(
						'div',
						{ className: 'wp-block-anypress-before-after__frame' },
						el('img', { className: 'wp-block-anypress-before-after__before', src: a.beforeUrl, alt: a.beforeAlt }),
						el('img', { className: 'wp-block-anypress-before-after__after', src: a.afterUrl, alt: a.afterAlt }),
						el('span', { className: 'wp-block-anypress-before-after__label is-before' }, before),
						el('span', { className: 'wp-block-anypress-before-after__label is-after' }, after),
						el('span', { className: 'wp-block-anypress-before-after__handle' }, el('svg', { viewBox: '0 0 24 24', width: 24, height: 24 }, el('path', { d: 'M9 6l-6 6 6 6M15 6l6 6-6 6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
						el('input', { type: 'range', className: 'wp-block-anypress-before-after__range', min: 5, max: 95, value: a.start, 'aria-label': __('Where the handle starts', 'anypress-blocks'), onChange: (event) => setAttributes({ start: Number(event.target.value) }) })
					)
				)
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
