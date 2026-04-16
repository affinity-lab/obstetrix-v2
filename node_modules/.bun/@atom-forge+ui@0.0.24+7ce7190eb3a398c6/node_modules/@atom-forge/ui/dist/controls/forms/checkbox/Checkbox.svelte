<script lang="ts">
	import type { AnyProp, ClassProp, XOR } from "../../../helpers/types";
	import { onMount, untrack } from 'svelte';
	import { getCheckboxGroupManager, type NamedCheckboxGroupManager } from "./checkbox-group-manager.svelte";
	import CheckboxView from './CheckboxView.svelte';

	let {
		value = $bindable(false),
		checked = $bindable(undefined as boolean | undefined),
		onchange,
		label = '',
		disabled = false,
		master = false,
		group: group_const = undefined,
		primary,
		accent,
		compact,
		small,
		class: classes,
		...props
	}: & AnyProp
		& ClassProp
		& XOR<{ value?: boolean }, { checked?: boolean }>
		& XOR<{}, { primary: true }, { accent: true }>
		& XOR<{}, { compact: true }, { small: true }>
		& {
		onchange?: (checked: boolean) => void
		label?: string
		disabled?: boolean
		master?: boolean
		group?: string
	} = $props();

	const id = Math.random().toString(36).slice(2);
	const manager = getCheckboxGroupManager();
	const group = untrack(() => group_const);
	const usingChecked = untrack(() => checked !== undefined);

	if (group && manager === undefined) throw new Error("AtomForge Checkbox with a group must have a manager in context");

	let groupManager: NamedCheckboxGroupManager;

	const boolValue = $derived(usingChecked ? (checked ?? false) : value);

	// Group-managed checkboxes (especially masters) need a separate $state because
	// the manager drives the 'some' indeterminate state which can't be derived from value alone.
	// Standalone checkboxes derive status directly from boolValue so external binding changes reflect immediately.
	let managedStatus: 'checked' | 'unchecked' | 'some' = $state(boolValue ? 'checked' : 'unchecked');
	const status = $derived(group ? managedStatus : (boolValue ? 'checked' : 'unchecked'));

	function setBoolValue(newVal: boolean) {
		if (usingChecked) checked = newVal;
		else value = newVal;
		onchange?.(newVal);
	}

	function changeState(newStatus: 'checked' | 'unchecked' | 'some') {
		managedStatus = newStatus;
		if (!master) setBoolValue(managedStatus === 'checked');
	}

	if (group) {
		onMount(() => {
			groupManager = master
				? manager.registerMaster(group, id, changeState)
				: manager.registerValue(group, id, boolValue, changeState);
			return () => {
				if (master) manager.unregisterMaster(group, id);
				else manager.unregisterValue(group, id);
			};
		});
	}

	function handleClick() {
		if (disabled) return;
		if (group) {
			if (master) groupManager.toggleAll();
			else groupManager.set(id, !boolValue);
		} else {
			setBoolValue(!boolValue);
		}
	}
</script>

<CheckboxView {status} {label} {disabled} {primary} {accent} {compact} {small} onclick={handleClick} class={classes} {...props}/>
