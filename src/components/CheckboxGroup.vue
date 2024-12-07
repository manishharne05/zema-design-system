<template>
	<div class="checkbox__container">
		<label class="checkbox__label">
			{{ label }}
			<span
				v-if="required"
				class="checkbox__required"
			>
				*
			</span>
		</label>
		<div
			v-for="option in options"
			:key="option.value"
			:class="resolveCheckboxClass(option.value)"
			@click="handleCheckboxClick(option.value)"
		>
			<rds-checkbox
				:model-value="internalValue.includes(option.value)"
				:label="option.label"
				:disabled="disabled"
				:variant="variant"
			/>
		</div>
		<div
			v-if="isInvalid && !disabled"
			class="checkbox__error-message"
		>
			{{ errorMessage }}
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import RdsCheckbox from './Checkbox.vue';
import variantClassResolver from '../utils/methods/variantClassResolver';
import variantValidator from '../utils/validators/variant';


const props = defineProps({
	/**
	* Prop used as v-model to monitor CheckboxGroup selections
	*/
	modelValue: {
		type: Array,
		default: () => ([]),
	},
	/**
	* Options available for selection from the list to be rendered by the component. It must be formed by objects containing `label` and `value`.
	*/
	options: {
		type: Array,
		default: () => ([]),
	},
	/**
	* Component label.
	*/
	label: {
		type: String,
		default: 'Label',
	},
	/**
	 * Displays mandatory asterisk (note: does not validate)
	 */
	required: {
		type: Boolean,
		default: false,
	},
	/**
	* The component variant. There are 10 variants: 'teal', 'green', 'blue',
	* 'indigo', 'violet', 'pink', 'red', 'orange', 'amber' and 'dark'.
	*/
	variant: {
		type: String,
		default: 'green',
		validator: variantValidator,
	},
	/**
	* Controls the status box
	*/
	disabled: {
		type: Boolean,
		default: false,
	},
	/**
	 * Specifies the state of the CheckboxGroup. The options are 'default', 'valid' and 'invalid'.
	 */
	state: {
		type: String,
		default: 'default',
	},
	/**
	 * Specifies the error message, which will be displayed if the state is invalid
	 */
	errorMessage: {
		type: String,
		default: 'Invalid value',
	},
});
const emits = defineEmits(['update:modelValue']);
const internalValue = ref([]);
const checkboxControl = ref(0);
const isInvalid = computed(() => props.state === 'invalid');

watch(internalValue, () => checkboxControl.value += 1);

onMounted(() => {
	internalValue.value = props.modelValue;
});

function resolveCheckboxClass(selectedOption) {
	if (props.disabled) {
		return 'checkbox__item--disabled';
	}
	const variantClass = isInvalid.value
		? 'checkbox__item--error'
		: variantClassResolver('checkbox__item', props.variant);
	return internalValue.value.includes(selectedOption)
		? `checkbox__item--selected ${variantClass}`
		: `checkbox__item ${isInvalid.value ? variantClass : ''}`;
}

function handleCheckboxClick(selectedOption) {
	if (props.disabled) {
		return;
	}
	if (internalValue.value.includes(selectedOption)) {
		internalValue.value = internalValue.value.filter((option) => option !== selectedOption);
		emits('update:modelValue', internalValue.value);
		return;
	}
	internalValue.value.push(selectedOption);
	emits('update:modelValue', internalValue.value);
}
</script>

<style lang="scss" scoped>
@import '../assets/sass/tokens.scss';
.checkbox {
	&__container {
		display: flex;
		flex-direction: column;
		gap: spacer(2);
	}
	&__label {
		@include button-2;
		margin: mb(2);
	}
	&__item {
		cursor: pointer;
		padding: pYX(4, 3);
		@include body-2;
		border: 1px solid $n-50;
		border-radius: $border-radius-extra-small;
		@include variantResolver using ($color-name, $shade-50, $shade-100, $shade-200, $shade-300, $base-color, $shade-500, $shade-600) {
			border-color: $base-color !important;
		}
		&--error {
			border-color: $rc-600;
		}
		&--selected {
			@extend .checkbox__item;
		}
		&--disabled {
			@extend .checkbox__item;
			background-color: $n-10;
		}
	}
	&__required {
		color: $rc-600;
	}
	&__error-message {
		@include caption;
		color: $rc-600;
		margin: mt(1);
	}
}
</style>