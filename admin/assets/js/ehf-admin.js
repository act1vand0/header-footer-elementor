;( function( $ ) {

	'use strict';

	var HFEAdmin = {

		/**
		 * Start the engine.
		 *
		 * @since 1.3.9
		 */
		init: function() {
			
			$( document ).ready( function( e ) {

				var ehf_hide_shortcode_field = function() {
					var selected = $('#ehf_template_type').val() || 'none';
					$( '.hfe-options-table' ).removeClass().addClass( 'hfe-options-table widefat hfe-selected-template-type-' + selected );
				}
			
				$(document).on( 'change', '#ehf_template_type', function( e ) {
					ehf_hide_shortcode_field();
				});
			
				ehf_hide_shortcode_field();
			
				// Templates page modal popup.
				HFEAdmin._display_modal();

				$( '.hfe-subscribe-field' ).on( 'keyup', function( e ) {
					$( '.hfe-subscribe-message' ).remove();
				});

				$(document).on( 'focusout change', '.hfe-subscribe-field', HFEAdmin.validate_single_field);
				$(document).on( 'click input', '.hfe-subscribe-field', HFEAdmin._animate_fields);

				$( document ).on( 'click', '.hfe-guide-content .button', HFEAdmin._subscribe );
			});

		},

		_animate_fields: function ( event ) {
			event.preventDefault();
			event.stopPropagation();
			var parentWrapper = $(this).parents( '.hfe-input-container' );
			parentWrapper.addClass( 'subscription-anim' );
		},

		validate_single_field: function ( event ) {
			event.preventDefault();
			event.stopPropagation();
			HFEAdmin._validate_field( event.target );
		},

		_validate_field: function ( target ) {

			var field = $( target );
			var fieldValue = field.val() || '';
			var parentWrapper = $(target).parents( '.hfe-input-container' );
			var fieldStatus = fieldValue.length ? true : false;

			if ((field.hasClass('hfe-subscribe-email') && false === HFEAdmin.isValidEmail( fieldValue ))) {
				fieldStatus = false;
			}

			if ( fieldStatus ) {
				parentWrapper.removeClass('subscription-error').addClass('subscription-success');

			} else {
				parentWrapper.removeClass('subscription-success subscription-anim').addClass('subscription-error');

				if ( field.hasClass('hfe-subscribe-email') && fieldValue.length ) {
					parentWrapper.addClass('subscription-anim')
				}
			}

		},

		/**
		 * Subscribe Form
		 *
		 */
		_subscribe: function( event ) {

			event.preventDefault();
			event.stopPropagation();

			var submit_button = $(this);

			var is_modal = $( '.hfe-guide-modal-popup.hfe-show' );

			var first_name_field = $('.hfe-subscribe-field[name="hfe_subscribe_name"]');
			var email_field = $('.hfe-subscribe-field[name="hfe_subscribe_email"]');
			var user_type_field = $('.hfe-subscribe-field[name="wp_user_type"]');
			var build_for_field = $('.hfe-subscribe-field[name="build_website_for"]');

			var subscription_first_name = first_name_field.val() || '';
			var subscription_email = email_field.val() || '';
			var subscription_user_type = user_type_field.val() || '';
			var subscription_build_for = build_for_field.val() || '';

			HFEAdmin._validate_field( first_name_field );
			HFEAdmin._validate_field( email_field );
			HFEAdmin._validate_field( user_type_field );
			HFEAdmin._validate_field( build_for_field );

			$( '.hfe-subscribe-message' ).remove();

			if ( $( '.hfe-input-container' ).hasClass( 'subscription-error' )) {
				return;
			}

			if( ! $( '.hfe-checkbox-container input.hfe-guide-checkbox' ).is( ':checked' ) ) {
				$( '.hfe-guide-checkbox' ).addClass( 'hfe-error' );
				return;
			}

			submit_button.removeClass( 'submitted' );

			if( ! submit_button.hasClass( 'submitting' ) ) {
				submit_button.addClass( 'submitting' );
			} else {
				return;
			}

			var subscription_fields = {
				EMAIL: subscription_email,
				FIRSTNAME: subscription_first_name,
				PAGE_BUILDER: hfe_admin_data.default_builder,
				WP_USER_TYPE: subscription_user_type,
				BUILD_WEBSITE_FOR: subscription_build_for,
				SOURCE: hfe_admin_data.data_source
			};

			$.ajax({
				url  : hfe_admin_data.ajax_url,
				type : 'POST',
				data : {
					action : 'hfe-update-subscription',
					nonce : hfe_admin_data.nonce,
					data: JSON.stringify( subscription_fields ),
				},
				beforeSend: function() {
					console.groupCollapsed( 'Email Subscription' );

					submit_button.after( '<span class="dashicons dashicons-update hfe-loader"></span>' );

				},
			})
			.done( function ( response ) {

				$( '.hfe-loader.dashicons-update' ).remove();

				submit_button.removeClass( 'submitting' ).addClass('submitted');

				if( response.success === true ) {
					$('.hfe-subscribe-fieldform').trigger("reset");

					submit_button.after( '<span class="hfe-subscribe-message success">' + hfe_admin_data.subscribe_success + '</span>' );
				} else {
					submit_button.after( '<span class="hfe-subscribe-message error">' + hfe_admin_data.subscribe_error + '</span>' );
				}
				
				if( is_modal.length ) {
					window.setTimeout( function () {
						window.location = $( '.hfe-guide-modal-popup' ).data( 'new-page' );
					}, 3000 );
				}

			});

		},

		/**
		 * Display error if email field is invalid
		 *
		 */
		// addEmailError: function( subscription_email ) {

		// 	$( '.hfe-input-container' ).removeClass( 'hfe-error' );

		// 	if( ! subscription_email || false === HFEAdmin.isValidEmail( subscription_email ) ) {
		// 		$( '.hfe-input-container' ).addClass( 'hfe-error' );

		// 		return false;
		// 	}

		// 	return true;

		// },

		/**
		 * email Validation
		 *
		 */
		isValidEmail: function(eMail) {
			if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test( eMail ) ) {
				return true;
			}
			
			return false;
		},

		/**
		 * Display the Modal Popup
		 *
		 */
		_display_modal: function() {
			var hf_new_post = $( '.post-type-elementor-hf' ).find( '.page-title-action' );

			var close_button = $( '.hfe-close-icon' );
			var modal_wrapper = $( '.hfe-guide-modal-popup' );
			var new_page_link = modal_wrapper.data( 'new-page' );
			var display_allow = hfe_admin_data.popup_dismiss;

			if( 'dismissed' !== display_allow[0] ) {
				// Display Modal Popup on click of Add new button.
				hf_new_post.on( 'click', function(e) {
					if( modal_wrapper.length && ! modal_wrapper.hasClass( 'hfe-show' ) ) {
						e.preventDefault();
						e.stopPropagation();
						modal_wrapper.addClass( 'hfe-show' );
					}
				});
			}
		
			// Close popup and redirect to edit page.
			close_button.on( 'click', function(e) {
				
				$.ajax({
					url: hfe_admin_data.ajax_url,
					type: 'POST',
					data: {
						action  : 'hfe_admin_modal',
						nonce   : hfe_admin_data.nonce,
					},
				});

				if( modal_wrapper.hasClass( 'hfe-show' ) ) {
					modal_wrapper.removeClass( 'hfe-show' );
				}

				// window.location = new_page_link;
			});
		},

	};

	HFEAdmin.init();

	window.HFEAdmin = HFEAdmin;

} )( jQuery );
