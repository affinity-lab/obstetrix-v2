<script lang="ts">
    import { twMerge } from 'tailwind-merge';

    interface Props {
        class?: string;
        total?: number;
        currentIndex?: number;
        [key: string]: unknown;
    }

    let {
        class: classes,
        total = 0,
        currentIndex = $bindable(0),
        ...props
    }: Props = $props();

    const cls = $derived(twMerge('flex items-center justify-center gap-1.5', classes));
</script>

<div class={cls} role="tablist" aria-label="Slide indicators" {...props}>
    {#each { length: total } as _, i}
        <button
            role="tab"
            aria-selected={currentIndex === i}
            aria-label="Go to slide {i + 1}"
            class={twMerge(
                'rounded-full transition-all duration-200 cursor-pointer',
                currentIndex === i
                    ? 'w-4 h-2 bg-canvas-contrast'
                    : 'w-2 h-2 bg-canvas-contrast/30 hover:bg-canvas-contrast/60'
            )}
            onclick={() => { currentIndex = i; }}
        ></button>
    {/each}
</div>
