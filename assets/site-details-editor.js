/**
 * Editor side of the "anypress/site-details" bindings source (includes/site-details.php). Values live in the site
 * setting anypress_site_details, read and saved through the core data store, so they save with the rest of the
 * page and every bound block on screen updates at once.
 */
( function ( blocks, data, i18n ) {
	const { __ } = i18n;
	const fields = window.anypressSiteDetailFields || {};
	const read = ( select ) => {
		const site = select( 'core' ).getEditedEntityRecord( 'root', 'site' ) || {};
		const details = Object.assign( {}, site.anypress_site_details || {} );
		if ( ! details.name && site.title ) details.name = site.title;
		return details;
	};
	const valueFor = ( details, key ) => {
		if ( key === 'phone_link' ) return details.phone ? 'tel:' + details.phone.replace( /[^0-9+]/g, '' ) : undefined;
		if ( key === 'email_link' ) return details.email ? 'mailto:' + details.email : undefined;
		return details[ key ] || undefined;
	};

	blocks.registerBlockBindingsSource( {
		name: 'anypress/site-details',
		label: __( 'Site details', 'anypress-blocks' ),
		getValues( { select, clientId, bindings } ) {
			const details = read( select );
			const saved = select( 'core/block-editor' ).getBlockAttributes( clientId ) || {};
			const values = {};
			for ( const [ attribute, binding ] of Object.entries( bindings ) ) {
				const key = binding.args?.key;
				// A detail not set yet shows the text saved in the block, as the page does.
				values[ attribute ] = valueFor( details, key ) ?? saved[ attribute ];
			}
			return values;
		},
		setValues( { select, dispatch, bindings } ) {
			const site = select( 'core' ).getEditedEntityRecord( 'root', 'site' ) || {};
			const details = Object.assign( {}, site.anypress_site_details || {} );
			for ( const binding of Object.values( bindings ) ) {
				const key = binding.args?.key;
				if ( key && Object.prototype.hasOwnProperty.call( fields, key ) ) details[ key ] = binding.newValue;
			}
			dispatch( 'core' ).editEntityRecord( 'root', 'site', undefined, { anypress_site_details: details } );
		},
		canUserEditValue( { select, context, args } ) {
			// The links are made from the phone and email; edit those instead.
			if ( ! args || ! Object.prototype.hasOwnProperty.call( fields, args.key ) ) return false;
			return !! select( 'core' ).canUser( 'update', { kind: 'root', name: 'site' } );
		},
		getFieldsList() {
			const list = Object.entries( fields ).map( ( [ key, label ] ) => ( { label, type: 'string', args: { key } } ) );
			list.push( { label: __( 'Phone (call link)', 'anypress-blocks' ), type: 'string', args: { key: 'phone_link' } } );
			list.push( { label: __( 'Email (mail link)', 'anypress-blocks' ), type: 'string', args: { key: 'email_link' } } );
			return list;
		},
	} );
} )( window.wp.blocks, window.wp.data, window.wp.i18n );
