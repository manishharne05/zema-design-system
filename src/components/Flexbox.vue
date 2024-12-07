<template>
	<div
		class="flexbox"
	>
		<!-- @slot Slot with the internal content of the FlexBox -->
		<slot />
	</div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	/**
	* Defines the direction of items inside the FlexBox. 
	* Accepted values: 'row', 'row-reverse', 'column', 'column-reverse'.
	*/
	direction: {
		type: String,
		default: 'row',
	},
	/**
	* Controls the line wrapping behavior of items in the FlexBox.
	* Accepted values: 'nowrap', 'wrap', 'wrap-reverse'.
	*/
	wrap: {
		type: String,
		default: 'wrap',
	},
	/**
	* Defines the spacing between items in the FlexBox. 
	* The set value is multiplied by 4, just like in Cuida scss tokens.
	* The default value is 0, but can be configured for other numeric values ​​or strings.
	*/
	gap: {
		type: [Number, String],
		default: 0,
	},
	/**
	* Controls the distribution of items along the main axis. 
	* Accepted values: 'flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'.
	*/
	justify: {
		type: String,
		default: 'flex-start',
	},
	/**
	* Sets the alignment of items along the transverse axis.
	* Accepted values: 'stretch', 'flex-start', 'flex-end', 'center', 'baseline'.
	*/
	align: {
		type: String,
		default: 'stretch',
	},
});

const gapAsStringResolver = (gap) => {
	const match = gap.match(/^(\d+(\.\d+)?)(.*)$/);

	if (!match) {
		return null;
	}

	if (!match[3]) {
		return match ? `${(parseFloat(match[1]) * 4)}px` : null
	}

	return gap;
};

const gapResolver = computed(() => {
	let composedGap = '';

	if (props.gap && props.gap !== 0 && props.gap !== '0') {
		return Number.isFinite(props.gap) ? `${props.gap * 4}px` : gapAsStringResolver(props.gap);
	}

	if (props.rowGap) {
		if (Number.isFinite(props.rowGap)) {
			composedGap = `${props.rowGap * 4}px`;
		} else {
			composedGap = gapAsStringResolver(props.rowGap);
		}
	} else {
		composedGap = '0px';
	}

	if (props.colGap) {
		if (Number.isFinite(props.colGap)) {
			composedGap += ` ${props.colGap * 4}px`;
		} else {
			composedGap += ` ${gapAsStringResolver(props.colGap)}`;
		}
	} else {
		composedGap += ' 0px';
	}

	return composedGap;
});
	
</script>
<style lang="scss" scoped>
@import '../assets/sass/tokens.scss';

.flexbox {
	align-items: v-bind(align);
	display: flex;
	gap: v-bind(gapResolver);
	justify-content: v-bind(justify);
	flex-direction: v-bind(direction);
	flex-wrap: v-bind(wrap);
}
</style>