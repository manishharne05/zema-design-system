<template>
	<div
		v-if="modelValue"
		class="side-sheet__overlay"
		tabindex="0"
		@click="shouldCloseOnBackdrop"
	>
		<div
			class="side-sheet__container"
			@click.stop
		>
			<header>
				<!-- @slot Slot used to use custom headers. -->
				<slot name="header">
					<div class="side-sheet__header">
						<h3>{{ title }}</h3>
						<div
							class="side-sheet__close-icon"
							@click="closeHandle"
						>
							<rds-clickable
								clickable
							>
								<rds-icon
									height="20"
									width="20"
									name="x-outline"
								/>
							</rds-clickable>
						</div>
					</div>
				</slot>
			</header>

			<rds-scrollable
				max-height="100%"
			>
				<!-- @slot Slot used to display content within the component. -->
				<slot />
			</rds-scrollable>
			<footer
				v-if="!noFooter"
				class="side-sheet__footer"
			>
				<!-- @slot Slot used to insert custom footers. -->
				<slot name="footer">
					<rds-button
						v-if="!noCancelButton"
						:text="cancelButtonText"
						secondary
						:disabled="disableCancelButton"
						@click="!disableCancelButton ? cancelHandle() : false"
					/>
					<rds-button
						class="footer__ok-button"
						:text="okButtonText"
						:variant="actionButtonVariant"
						:disabled="disableOkButton"
						:block="blockOkButton"
						@click="!disableOkButton ? okHandle() : false"
					/>
				</slot>
			</footer>
		</div>
	</div>
</template>

<script>
import RdsIcon from '../components/Icon.vue';
import RdsClickable from '../components/Clickable.vue';
import sassColorVariables from '../assets/sass/colors.module.scss';
import hexToRgb from '../utils/methods/hexToRgb';
import { KeyCodes } from '../utils';
import RdsButton from '../components/Button.vue';
import RdsScrollable from '../components/Scrollable.vue';

export default {
	components: {
		RdsIcon,
		RdsButton,
		RdsScrollable,
		RdsClickable,
	},
	props: {
		/**
		* Sets the title of the SideSheet.
		*/
		title: {
			type: String,
			default: null,
		},
		/**
		* Prop used as v-model. Controls the visibility of the SideSheet.
		*/
		modelValue: {
			type: Boolean,
			default: false,
			required: true,
		},
		/**
		* Indicates whether an overlay will be used next to the SideSheet.
		*/
		withOverlay: {
			type: Boolean,
			default: false,
		},
		/**
		* Specifies the size of the SideSheet. There are 4 sizes implemented: 'sm', 'md', 'lg', 'xl'.
		*/
		size: {
			type: String,
			default: 'md',
		},
		/**
		* Defines whether the SideSheet will be closed when clicking on the backdrop.
		*/
		noCloseOnBackdrop: {
			type: Boolean,
			default: false,
		},
		/**
		* Defines whether the SideSheet will be closed when the user presses 'ESC'.
		*/
		noCloseOnEsc: {
			type: Boolean,
			default: false,
		},
		/**
		 * Defines the SideSheet action button variant (follows the Cuida button component variants)
		 */
		actionButtonVariant: {
			type: String,
			default: 'green',
		},
		/**
		* Controls the display of the SideSheet footer.
		*/
		noFooter: {
			type: Boolean,
			default: false,
		},
		/**
		* Controls the display of the SideSheet cancel button.
		*/
		noCancelButton: {
			type: Boolean,
			default: false,
		},
		/**
		* Sets the state of the SideSheet action button.
		*/
		disableOkButton: {
			type: Boolean,
			default: false,
		},
		/**
		* Sets the state of the SideSheet cancel button.
		*/
		disableCancelButton: {
			type: Boolean,
			default: false,
		},
		/**
		 * Sets SideSheet action button text
		 */
		okButtonText: {
			type: Boolean,
			default: false,
		},
		/**
		* Sets SideSheet cancel button text
		*/
		cancelButtonText: {
			type: Boolean,
			default: false,
		},
		/**
		* Changes the type of confirmation button to block
		*/
		blockOkButton: {
			type: Boolean,
			default: false,
		},
		/**
		* Controls the action of closing the modal when clicking the action button.
		*/
		noCloseOkButton: {
			type: Boolean,
			default: false,
		},
		/**
		* Controls the action of closing the modal when clicking the cancel button.
		*/
		noCloseCancelButton: {
			type: Boolean,
			default: false,
		},
	},

	data() {
		return {
			sassColorVariables,
		};
	},

	computed: {
		overlayColor() {
			const color = this.withOverlay ? this.sassColorVariables['n900'] : 'transparent';
			return `rgba(${this.hexToRgb(color)}, 0.4)`;
		},

		sideSheetWidth() {
			let width = '328px';

			switch(this.size) {
				case 'xl':
					width = '840px';
					break;
				case 'lg':
					width = '700px';
					break;
				case 'md':
					width = '500px';
					break;
				default:
					width = '340px';
					break;
			}

			return width;
		}
	},

	watch: {
		modelValue(newValue) {
			if (!newValue) {
				this.dettachKeyupEvent();
				return;
			}
			this.attachKeyupEvent();
		},
	},

	created() {
		this.attachKeyupEvent();
	},

	beforeUnmount() {
		this.dettachKeyupEvent();
	},

	methods: {
		hexToRgb,

		shouldCloseOnBackdrop() {
			if (!this.noCloseOnBackdrop) {
				/**
				* Event used to implement the v-model.
				* @event update:modelValue
				* @type {Event}
				*/
				this.$emit('update:modelValue', !this.modelValue);
			}
		},

		shouldCloseOnEsc() {
			if (!this.noCloseOnEsc) {
				this.$emit('update:modelValue', !this.modelValue);
			}
		},

		keyupListener(ev) {
			if (ev.keyCode === KeyCodes.ESC) { // esc
				this.shouldCloseOnEsc();
			}
		},

		attachKeyupEvent() {
			window.addEventListener('keyup', this.keyupListener);
		},

		dettachKeyupEvent() {
			window.removeEventListener('keyup', this.keyupListener);
		},

		closeHandle() {
			/**
			 * Event that indicates whether the SideSheet cancel button was clicked.
			 * @event cancel
			 * @type {Event}
			*/
			this.$emit('close', true);
			this.$emit('update:modelValue', false);
		},
		
		cancelHandle() {
			/**
			 * Event that indicates whether the SideSheet has been hidden.
			 * @event cancle
			 * @type {Event}
			*/
			this.$emit('cancle', true);
			if (!this.noCloseCancelButton) {
				this.$emit('update:modelValue', false);
				/**
				* Event that indicates whether the SideBar was closed.
				* @event close
				* @type {Event}
				*/
				this.$emit('close', true);
			}
		},
		okHandle() {
			/**
			 * Event that indicates whether the SideSheet action button was clicked.
			* @event ok
			* @type {Event}
			*/
			if (!this.noCloseOkButton) {
				this.$emit('update:modelValue', false);
				/**
				* Event that indicates whether the SideBar was closed.
				* @event close
				* @type {Event}
				*/
				this.$emit('close', true);
			}
			this.$emit('ok', true);
		},
	},
};
</script>
<style lang="scss" scoped>
@import '../assets/sass/tokens.scss';

.container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.side-sheet {
	&__overlay {
		animation: fade;
		animation-duration: 0.4s;

		background-color: v-bind(overlayColor);
		bottom: 0;
		padding: 0;
		height: 100%;
		left: 0;
		position: fixed;
		right: 0;
		top: 1;
		width: 100%;
		z-index: 999;
	}

	&__header {
		display: flex;
		justify-content: space-between;
		padding: pb(2);

		h3 {
			color: $n-900;
			@include subheading-1;
			margin: mb(2);
		}
	}

	&__container {
		animation: translate;
		animation-duration: 0.5s;

		background: $n-0;
		border-radius: 0px;
		float: right;
		height: 100%;
		width: v-bind(sideSheetWidth);

		padding: pa(5);
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	&__close-icon {
		color: $n-600;
		display: flex;
		justify-content: end;
		padding: pTRBL(0, 4, 4, 4);
		text-align: right;

		&:hover {
			color: $n-700;
		}
	}

	&__footer {
		display: flex;
		justify-content: end;
		padding: pt(7);
		gap: 32px;
		background-color: $n-0;
	}
}

@keyframes fade {
  from {opacity: 0;}
  to {opacity: 1;}
}

@keyframes translate {
  from {transform: translateX(40px);}
  to {transform: translateX(0px);}
}
</style>
