// Map blocks set to ask first: the map loads only when the visitor presses "Show the map".
document.querySelectorAll('.wp-block-anypress-map__load').forEach((button) => {
	button.addEventListener('click', () => {
		const frame = document.createElement('iframe');
		frame.src = button.dataset.src;
		frame.title = button.dataset.title || '';
		frame.referrerPolicy = 'no-referrer-when-downgrade';
		button.replaceWith(frame);
	});
});
