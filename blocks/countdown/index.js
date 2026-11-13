// Countdown block, editor side. Plain JavaScript on the editor's globals (no build step).
// Pick the date and time in the block settings; the preview counts down the way the site does.
(function (wp) {
	const { registerBlockType } = wp.blocks;
	const { useBlockProps, InspectorControls } = wp.blockEditor;
	const { PanelBody, DateTimePicker, TextControl, ToggleControl, Placeholder } = wp.components;
	const { createElement: el, Fragment, useEffect, useState } = wp.element;
	const { __ } = wp.i18n;

	const pad = (n) => String(n).padStart(2, '0');

	function Preview({ a }) {
		const [now, setNow] = useState(Date.now());
		useEffect(() => {
			const timer = setInterval(() => setNow(Date.now()), 1000);
			return () => clearInterval(timer);
		}, []);
		// The picked date is in the site's time zone; the editor's clock is close enough for a preview.
		const left = Math.max(0, Math.floor((new Date(a.date).getTime() - now) / 1000));
		if (left === 0) return el('p', { className: 'wp-block-anypress-countdown__ended', style: { display: 'block' } }, a.endText || __('The time is up. This countdown is hidden on the site until you set a later date or add words for when it ends.', 'anypress-blocks'));
		const units = [
			[String(Math.floor(left / 86400)), __('Days', 'anypress-blocks')],
			[pad(Math.floor(left / 3600) % 24), __('Hours', 'anypress-blocks')],
			[pad(Math.floor(left / 60) % 60), __('Minutes', 'anypress-blocks')],
		];
		if (a.showSeconds) units.push([pad(left % 60), __('Seconds', 'anypress-blocks')]);
		return el(
			'div',
			{ className: 'wp-block-anypress-countdown__units' },
			units.map(([value, label]) => el('span', { key: label, className: 'wp-block-anypress-countdown__unit' }, el('span', { className: 'wp-block-anypress-countdown__value' }, value), el('span', { className: 'wp-block-anypress-countdown__label' }, label)))
		);
	}

	registerBlockType('anypress/countdown', {
		edit({ attributes: a, setAttributes }) {
			const blockProps = useBlockProps();
			const picker = el(DateTimePicker, { currentDate: a.date || undefined, onChange: (date) => setAttributes({ date: date || '' }), is12Hour: true });
			return el(
				Fragment,
				null,
				el(
					InspectorControls,
					null,
					el(
						PanelBody,
						{ title: __('Counts down to', 'anypress-blocks') },
						picker,
						el(TextControl, { label: __('When it ends, show', 'anypress-blocks'), help: __('For example "This offer has ended". Leave empty to hide the countdown.', 'anypress-blocks'), value: a.endText, onChange: (endText) => setAttributes({ endText }), __nextHasNoMarginBottom: true }),
						el(ToggleControl, { label: __('Show seconds', 'anypress-blocks'), checked: a.showSeconds, onChange: (showSeconds) => setAttributes({ showSeconds }), __nextHasNoMarginBottom: true })
					)
				),
				el('div', blockProps, a.date ? el(Preview, { a }) : el(Placeholder, { label: __('Countdown', 'anypress-blocks'), instructions: __('Pick the date and time it counts down to.', 'anypress-blocks') }, picker))
			);
		},
		save() {
			return null;
		},
	});
})(window.wp);
