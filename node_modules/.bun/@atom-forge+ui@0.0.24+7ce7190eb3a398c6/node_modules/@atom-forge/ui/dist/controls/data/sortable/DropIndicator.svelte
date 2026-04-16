<script lang="ts">
    import { dnd } from "../../../helpers/actions";

    let {
        active = false,
        horizontal = false,
        listId = '',
        onenter,
        onleave,
        ondrop,
    }: {
        active?: boolean;
        horizontal?: boolean;
        listId?: string;
        onenter?: () => void;
        onleave?: () => void;
        ondrop?: (source: any, location: any) => void;
    } = $props();

    // self-stretch so this element always fills the cross-axis of the parent flex container,
    // even if the parent has items-center (e.g. a horizontal list).
    const outerCls = $derived(
        horizontal
            ? "flex justify-center items-stretch self-stretch shrink-0 w-2"
            : "flex items-center self-stretch shrink-0 h-2 w-full",
    );

    const innerCls = $derived(
        horizontal
            ? "w-0.5 rounded-full bg-accent transition-opacity duration-100"
            : "h-0.5 w-full rounded-full bg-accent transition-opacity duration-100",
    );
</script>

<div
    class={outerCls}
    use:dnd.dropTarget={{
        getData: () => ({ type: "list-indicator", listId }),
        onDragEnter: () => onenter?.(),
        onDragLeave: () => onleave?.(),
        onDrop: ({ source, location }: any) => ondrop?.(source, location),
    }}
>
    <div
        class={innerCls}
        class:opacity-0={!active}
        class:opacity-100={active}
    ></div>
</div>
