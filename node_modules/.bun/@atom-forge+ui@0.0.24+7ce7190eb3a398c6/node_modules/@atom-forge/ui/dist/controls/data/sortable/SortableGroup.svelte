<script lang="ts">
    import { setContext } from "svelte";
    import { twMerge } from "tailwind-merge";
    import { onMount } from "svelte";

    export type GroupRules = {
        [targetListId: string]: {
            accepts: string[] | boolean;
        };
    };

    // Callbacks the group exposes so child SortableLists can call back up
    export interface GroupContext {
        rules: GroupRules | undefined;
        typeField: string;
        /** Called when a cross-list drop has been resolved */
        onCrossListDrop: (args: {
            sourceListId: string;
            targetListId: string;
            itemId: string | number;
            targetIndex?: number; // optional: insert at specific position, default = append at end
        }) => void;
    }

    // Map<listId, { items, setItems }>  — registered by each child SortableList
    type ListRegistry = Map<
        string,
        {
            getItems: () => any[];
            setItems: (items: any[]) => void;
        }
    >;

    interface Props {
        class?: string;
        rules?: GroupRules;
        typeField?: string;
        children?: import("svelte").Snippet;
        [key: string]: unknown;
    }

    let {
        class: classes,
        rules,
        typeField = "type",
        children,
        ...props
    }: Props = $props();

    const registry: ListRegistry = new Map();

    function registerList(
        listId: string,
        getItems: () => any[],
        setItems: (items: any[]) => void,
    ) {
        registry.set(listId, { getItems, setItems });
        return () => registry.delete(listId);
    }

    function canDrop(
        targetListId: string,
        itemType: string | undefined,
    ): boolean {
        if (!rules) return true;
        const rule = rules[targetListId];
        if (!rule) return true;
        if (rule.accepts === true) return true;
        if (rule.accepts === false) return false;
        if (!itemType) return true;
        return (rule.accepts as string[]).includes(itemType);
    }

    // Provide context to child SortableLists
    setContext<GroupContext>("dnd-group", {
        get rules() {
            return rules;
        },
        get typeField() {
            return typeField;
        },
        onCrossListDrop({ sourceListId, targetListId, itemId, targetIndex }) {
            console.groupCollapsed(`[DnD] cross-list drop`);
            console.log('  source list :', sourceListId);
            console.log('  target list :', targetListId);
            console.log('  item id     :', itemId);
            console.log('  targetIndex :', targetIndex);

            const sourceList = registry.get(sourceListId);
            const targetList = registry.get(targetListId);
            console.log('  source registered?', !!sourceList, '| target registered?', !!targetList);
            if (!sourceList || !targetList) {
                console.warn('  ❌ abort: list not found in registry');
                console.groupEnd();
                return;
            }

            const sourceItems = [...sourceList.getItems()];
            console.log('  source items:', sourceItems.map(i => i.id));
            const itemIndex = sourceItems.findIndex((i) => i.id === itemId);
            console.log('  item index in source:', itemIndex);
            if (itemIndex === -1) {
                console.warn('  ❌ abort: item not found in source list');
                console.groupEnd();
                return;
            }

            const [movedItem] = sourceItems.splice(itemIndex, 1);
            console.log('  moved item  :', movedItem);

            const itemType = movedItem[typeField];
            const allowed = canDrop(targetListId, itemType);
            console.log(`  canDrop("${targetListId}", "${itemType}") =`, allowed);
            if (!allowed) {
                console.warn('  ❌ abort: rejected by rules');
                console.groupEnd();
                return;
            }

            sourceList.setItems(sourceItems);
            const targetItems = [...targetList.getItems()];
            const insertAt = targetIndex ?? targetItems.length;
            console.log('  target items before:', targetItems.map(i => i.id));
            console.log('  insert at index    :', insertAt);
            targetItems.splice(insertAt, 0, movedItem);
            console.log('  target items after :', targetItems.map(i => i.id));
            targetList.setItems(targetItems);
            console.log('  ✅ done');
            console.groupEnd();
        },
    });

    // Also expose registerList via context so child SortableLists can self-register
    setContext<
        (
            listId: string,
            getItems: () => any[],
            setItems: (v: any[]) => void,
        ) => () => void
    >("dnd-group-register", registerList);

    const cls = $derived(twMerge(classes));
</script>

<div class={cls} {...props}>
    {#if children}{@render children()}{/if}
</div>
