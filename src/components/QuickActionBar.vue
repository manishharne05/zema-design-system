<!-- eslint-disable vue/html-indent -->
<template>
	<div
		v-if="internalValue"
		class="quick_action_bar"
	>
		<div
			class="quick_action_bar__backdrop"
			@click="onBackdropClick"
			@keyup.esc="internalValue = false"
			@keyup.enter="onEnterPress"
		>
			<rds-flexbox
				gap="3"
				class="quick_action_bar__input"
				align="center"
			>
				<rds-icon
					height="24"
					width="24"
					name="search-outline"
					class="quick_action_bar__search-icon"
				/>

				<input
					ref="searchInput"
					v-model="searchTerm"
					type="text"
					placeholder="Search by name, CPF or CNS..."
				>

				<span
					v-if="searchTerm"
					class="quick_action_bar__clear"
					@click="clearSearchTerm"
				>
					To clean
				</span>
			</rds-flexbox>

			<rds-flexbox
				direction="column"
				class="quick_action_bar__results"
				wrap="nowrap"
			>
				<rds-flexbox
					v-if="whatToRender === 'renderLoading'"
					direction="column"
					gap="4"
				>
					<rds-flexbox
						v-for="n in 5"
						:key="n"
						direction="column"
						gap="1"
						class="quick_action_bar__skeleton-card"
					>
						<rds-skeleton
							:width="250"
							:height="20"
						/>

						<rds-skeleton
							:width="180"
							:height="20"
						/>
					</rds-flexbox>
				</rds-flexbox>

				<div
					v-else-if="whatToRender === 'renderInitialState'"
					class="quick_action_bar__empty-state"
				>
					{{ initialStateText }}
				</div>

				<div
					v-else-if="whatToRender === 'renderEmptyState'"
					class="quick_action_bar__empty-state"
				>
					{{ emptyStateText }}
				</div>

				<rds-flexbox
					v-for="recentItem in slicedRecents"
					v-else-if="whatToRender === 'renderRecents'"
					:key="recentItem"
					direction="column"
					gap="4"
					class="quick_action_bar__result-item"
					@click="onItemClick(recentItem)"
				>
					<!--
						@slot Slot used to render custom items for recent items. Item data can be accessed through the `recentItem` property.
					-->
					<slot
						v-if="hasSlot($slots, 'recent-item')"
						name="recent-item"
						:data="recentItem"
					/>

					<rds-flexbox
						v-else
						justify="space-between"
						align="center"
					>
						<rds-flexbox
							align="center"
							gap="2"
						>
							<rds-icon
								height="20"
								width="20"
								name="history-outline"
								color="#52616F"
							/>

							<span>
								{{ recentItem.title }}
							</span>
						</rds-flexbox>

						<rds-icon
							height="20"
							width="20"
							name="trash-outline"
							color="#52616F"
							class="quick_action_bar__remove-recent-icon"
							@click.stop="onRemoveRecentClick(recentItem)"
						/>
					</rds-flexbox>
				</rds-flexbox>

				<div
					v-for="(group, index) in internalGroups"
					v-else-if="whatToRender === 'renderResults'"
					:key="index"
					class="quick_action_bar__results-block"
				>
					<rds-divider
						v-if="group.results.length > 0"
						:text="group.category"
						inline
						class="quick_action_bar__divider"
					/>

					<div
						v-for="item in sliceResultsByGroup(group.results)"
						:key="item"
						class="quick_action_bar__result-item-wrapper"
						@click="onItemClick(item)"
					>
						<!--
							@slot Slot used to render custom items for search results. Item data can be accessed through the `item` property.
						-->
						<slot
							v-if="hasSlot($slots, 'result-item')"
							:data="item"
							name="result-item"
						/>

						<div
							v-else
							class="quick_action_bar__result-item"
						>
							<cds-highlight
								:highlighted-text="searchTerm"
							>
								{{ item.title }}
							</cds-highlight>
						</div>
					</div>

					<rds-flexbox
						v-if="group.results.length > 5"
						class="quick_action_bar__show-more"
						align="center"
						justify="start"
						gap="1"
						@click="onSeeMoreClick(group)"
					>
						<span>
							See all {{ group.results.length }} results in <b>{{ group.category }}</b>
						</span>
					</rds-flexbox>
				</div>
			</rds-flexbox>
		</div>
	</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import RdsIcon from './Icon.vue';
import RdsFlexbox from './Flexbox.vue';
import RdsDivider from './Divider.vue';
import RdsSkeleton from './Skeleton.vue';
import hasSlot from '../utils/methods/hasSlot';
import CdsHighlight from './Highlight.vue';

const props = defineProps({
	/**
	 *  Controls the display of the search bar.
	 */
	modelValue: {
		type: Boolean,
		required: true,
		default: false,
	},
	/**
	 * Informs the component whether the request is still in progress or has already been completed.
	 */
	loading: {
		type: Boolean,
		required: true,
		default: false,
	},
	/**
	 * Search results to be shown. List objects must have a "category" key and a "results" list.
	 * Results items must have a key called "title".
	 */
	groups: {
		type: Array,
		required: true,
		default: () => [],
	},
	/**
	 * Recent search items to be shown in the initial state of the component. Items must have a key called "title".
	 */
	recents: {
		type: Array,
		required: false,
		default: () => [],
	},
	/**
	 * Sets the maximum amount of recent items that will be displayed. The minimum number of items is 1 and the maximum is 10.
	 */
	numRecents: {
		type: Number,
		required: false,
		default: 5,
		validator: (n) => n > 0 && n <= 10,
	},
	/**
	 * Sets the text that will be displayed in the initial state when there are no recent items.
	 */
	initialStateText: {
		type: String,
		required: false,
		default: 'There is nothing here yet. Try doing a search!',
	},
	/**
	 * Defines the text that will be displayed when there are no results.
	 */
	emptyStateText: {
		type: String,
		required: false,
		default: 'No results found',
	},
});

const emits = defineEmits([
	/**
	 * Event that indicates whether the display control variable has changed.
	* @event ok
	* @type {Event}
	*/
	'update:modelValue',

	/**
	* Event triggered when there is a pause in typing and returns the search text.
	* @event ok
	* @type {Event}
	*/
	'search',

	/**
	 * Event that indicates which item in the results list was clicked.
	* @event ok
	* @type {Event}
	*/
	'onItemClick',

	/**
	 * Event that indicates that the "See more" button was clicked.
	* @event ok
	* @type {Event}
	*/
	'onSeeMoreClick',

	/**
	 * Event that indicates that the search bar has been closed.
	* @event ok
	* @type {Event}
	*/
	'close',

	/**
	 * Event that returns the item to be removed.
	* @event ok
	* @type {Event}
	*/
	'onRemoveRecent',

	/**
	 * Event that indicates whether the enter key was pressed in the search field.
	* @event ok
	* @type {Event}
	*/
	'onEnterPress'
]);

const internalValue = ref(props.modelValue);
const internalGroups = ref([]);
const idTimeout = ref(null);
const isTyping = ref(false);
const searchInput = ref(null);
const searchTerm = ref('');

const whatToRender = computed(() => {
	let hasResults = internalGroups.value.some(item => item.results && item.results.length > 0);
	let hasRecents = props.recents.length > 0;

	if (hasResults && !isTyping.value && !props.loading) {
		return 'renderResults';
	}
	if (isTyping.value || props.loading) {
		return 'renderLoading';
	}
	if (!isTyping.value && !hasResults && searchTerm.value.length > 0) {
		return 'renderEmptyState'
	}
	if (searchTerm.value.length === 0 && hasRecents) {
		return 'renderRecents';
	}
	if (!isTyping.value && !hasRecents && searchTerm.value.length === 0) {
		return 'renderInitialState';
	}

	return 'renderEmptyState';
});

const slicedRecents = computed(() => {
	return props.recents.slice(0, props.numRecents);
});

watch(searchTerm, () => {
	onChangeSearchTerm();
});

watch(() => props.modelValue, (newValue) => {
	internalValue.value = newValue;

	if (newValue) {
		setTimeout(() => {
			searchInput.value?.focus();
		}, 100);
	}
});

watch(internalValue, (newValue) => {
	if (!newValue) {
		clearSearchTerm();
		emits('close');
	}

	emits('update:modelValue', newValue);
	mustDisableExternalScrolls(newValue);
});

watch(() => props.groups, (newValue) => {
	internalGroups.value = newValue.filter(item => item.results.length > 0);
});

function mustDisableExternalScrolls(value) {
	document.body.style.overflow = value ? 'hidden' : 'auto';
}

function clearSearchTerm() {
	searchTerm.value = '';
	searchInput.value?.focus();
	onChangeSearchTerm();
}

function onChangeSearchTerm() {
	clearTimeout(idTimeout.value);
	isTyping.value = true;
	internalGroups.value = [];

	if (searchTerm.value.trim().length === 0) {
		isTyping.value = false;

		return;
	}

	idTimeout.value = setTimeout(() => {
		isTyping.value = false;
		emits('search', searchTerm.value);
	}, 1000);
}

function onItemClick(item) {
	emits('onItemClick', item);
}

function onSeeMoreClick(item) {
	emits('onSeeMoreClick', item);
}

function onBackdropClick(event) {
	if (event.target === event.currentTarget) {
		internalValue.value = false;
	}
}

function onRemoveRecentClick(item) {
	emits('onRemoveRecent', item);
	searchInput.value?.focus();
}

function onEnterPress() {
	if (searchTerm.value.trim().length > 0) {
		emits('onEnterPress', searchTerm.value);
	}

	return;
}

function sliceResultsByGroup(results) {
	return results.slice(0, 5);
}

</script>

<style lang="scss" scoped>
@import '../assets/sass/tokens.scss';

.quick_action_bar {

	&__backdrop {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: fixed;
		padding-top: 80px;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.35);
		z-index: $z-index-modal;
		animation: zoom-in ease .3s;
	}

	&__search-icon {
		color: $n-400;
	}

	&__input {
		width: 50%;
		padding: pa(4);
		background-color: $n-0;
		border-radius: $border-radius-medium;
		border: 1px solid $n-30;
		background-color: $n-0;
		margin: mb(2);
		box-shadow: $shadow-md;

		input {
			font-family: 'Satoshi', sans-serif;
			@include subheading-3;
			font-weight: $font-weight-regular;
			color: $n-800;
			border: none;
			flex-grow: 1;

			&:focus {
				outline: none;
			}
		}
	}

	&__clear {
		@include overline;
		font-weight: $font-weight-semibold;
		color: $n-300;
		cursor: pointer;

		&:hover {
			color: $n-500;
		}
	}

	&__remove-recent-icon {
		display: none;
		cursor: pointer;
	}

	&__results {
		background-color: $n-0;
		border-radius: $border-radius-medium;
		border: 1px solid $n-30;
		padding: py(5);
		width: 50%;
		max-height: 75svh;
		box-shadow: $shadow-md;
		overflow-y: scroll;
	}

	&__skeleton-card {
		margin: ml(5);
	}

	&__empty-state {
		@include body-2;
		font-weight: $font-weight-regular;
		font-style: italic;
		color: $n-400;
		text-align: center;
	}

	&__results-block {

		&:last-child {
			margin: mb(n(3));
		}
	}

	&__divider {
		padding: px(5);
	}

	&__result-item-wrapper {
		cursor: pointer;

		&:last-child {
			margin: mb(3);
		}
	}

	&__result-item {
		cursor: pointer;
		padding: pYX(3, 5);
		@include body-1;
		font-weight: $font-weight-regular;
		color: $n-800;

		&:hover {
			background-color: $n-20;

			.quick_action_bar__remove-recent-icon {
				display: block;
			}
		}
	}

	&__show-more {
		@include caption;
		color: $n-400;
		text-align: left;
		cursor: pointer;
		height: 40px;
		padding: pl(5);
		margin: mb(3);

		&:hover {
			background-color: $bn-50;
			color: $bn-400;
		}
	}
}

@keyframes zoom-in {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}

</style>
