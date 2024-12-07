<template>
	<div
		v-if="showOverlay"
		class="landscape-overlay"
	>
		<div class="landscape-overlay__container">
			<img
				class="landscape-overlay__image"
				:src="imgSrc"
			>
			<span class="landscape-overlay__title">{{ titleText }}</span>
			<span class="landscape-overlay__subtitle">{{ descriptionText }}</span>
			<div
				v-if="block-interaction === 'mobile'"
				class="landscape-overlay__button"
			>
				<rds-button
					:variant="buttonVariant"
					block
					@button-click="emits('button-click')"
				>
					{{ buttonText }}
				</rds-button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import isDeviceType from '../utils/methods/isDeviceType';
import { colorOptions } from '../utils/constants/colors';
import RdsButton from './Button.vue';

// Props
const props = defineProps({
	/**
	* Defines which criteria will be used to display the component.
	*/
	blockInteraction: {
		type: String,
		required: true,
		default: 'mobile',
		validator: (value) => ['mobile', 'landscape'].includes(value.toLowerCase()),
	},
	/**
	*Defines the component title.
	*/
	title: {
		type: String,
		default: '',
	},
	/**
	*Defines the descriptive message to be displayed in the component.
	*/
	description: {
		type: String,
		default: '',
	},
	/**
	* Defines the color variant of the button displayed when the 'block-interaction' property is 'mobile'.
	*/
	buttonVariant: {
		type: String,
		default: 'green',
		validator: (value) => colorOptions.includes(value.toLowerCase()),
	},
	/**
	* Defines which button text is displayed when the 'block-interaction' property is 'mobile'.
	*/
	buttonText: {
		type: String,
		default: 'Go to top',
	},
});

// Emits
const emits = defineEmits([
	/**
	* Event indicating that the action button was clicked
	* @event button-click
	* @type {Event}
	*/
	'button-click'
]);

// Variáveis reativas
const showOverlay = ref(false);
const titleText = ref('');
const descriptionText = ref('');
const imgSrc = ref('');

// Computed variables
const isMobile = computed(() => {
	return isDeviceType('smartphone') || isDeviceType('tablet');
});

const isLandscape = computed(() => {
	return (window.outerWidth > window.outerHeight) && isMobile.value;
});

// Watcher
watch(showOverlay, (newValue) => {
	if (newValue) {
		document.body.style.overflow = 'hidden';
	} else {
		document.body.style.overflow = 'auto';
	}
});

watchEffect(() => {
	if (!isMobile.value && !isLandscape.value) {
		showOverlay.value = false;
	}
})

// Lifecycle hooks
onMounted(() => {
	if (props.blockInteraction === 'mobile') {
		if (isMobile.value) {
			showOverlay.value = true;
			props.title === '' ? titleText.value = 'Access content on a computer' : titleText.value = props.title;
			props.description === '' ? descriptionText.value = 'This screen is not optimized for mobile browsing.' : descriptionText.value = props.description;
			imgSrc.value = '/img/page-not-responsive.svg';
		}
		return
	}

	if (props.blockInteraction === 'landscape') {
		if  (isLandscape.value) {
			showOverlay.value = true;
			props.title === '' ? titleText.value = 'Rotate your device' : titleText.value = props.title;
			props.description === '' ? descriptionText.value = 'This content is optimized for portrait viewing.' : descriptionText.value = props.description;
			imgSrc.value = '/img/smartphone-rotation.svg';
		}
	}
})

</script>

<style lang="scss" scoped>
@import '../assets/sass/tokens.scss';

.landscape-overlay {
	background: rgba($color: $n-900, $alpha: 0.97);
	color: $n-20;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: $z-index-toast;
	display: flex;
	justify-content: center;
	align-items: center;

    &__title {
        @include heading-3;
        font-weight: $font-weight-bold;
        color: $n-20;
		text-align: center;
    }

    &__subtitle {
		text-align: center;
		@include body-2;
        color: $n-20;
    }

	&__container {
        display: flex;
		padding: px(5);
        flex-direction: column;
        align-items: center;
        gap: spacer(3);
	}

	&__image {
		width: 80px;
		height: 80px;
        filter: invert(88%) sepia(64%) saturate(0%) hue-rotate(231deg) brightness(106%) contrast(102%);
	}

	&__button {
		justify-self: flex-end;
		width: 100%;
		height: 100%;
		margin: mt(4);
	}
}

</style>