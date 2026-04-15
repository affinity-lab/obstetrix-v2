<script lang="ts" generics="T">
    import { twMerge } from 'tailwind-merge';
    import type { Snippet } from 'svelte';

    interface Props {
        class?: string;
        items: T[];
        currentIndex?: number;
        showArrows?: boolean;
        loop?: boolean;
        children: Snippet<[{ item: T; index: number }]>;
        [key: string]: unknown;
    }

    let {
        class: classes,
        items = [],
        currentIndex = $bindable(0),
        showArrows = true,
        loop = false,
        children,
        ...props
    }: Props = $props();

    let scrollEl = $state<HTMLElement | null>(null);
    let userScrolling = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
        if (!scrollEl) return;
        scrollEl.scrollTo({ left: index * scrollEl.clientWidth, behavior });
    }

    $effect(() => {
        const idx = currentIndex;
        if (!userScrolling) scrollToIndex(idx);
    });

    function handleScroll() {
        userScrolling = true;
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            if (!scrollEl) return;
            userScrolling = false;
            const idx = Math.round(scrollEl.scrollLeft / scrollEl.clientWidth);
            currentIndex = idx;
        }, 100);
    }

    export function next() {
        currentIndex = loop
            ? (currentIndex + 1) % items.length
            : Math.min(currentIndex + 1, items.length - 1);
    }

    export function prev() {
        currentIndex = loop
            ? (currentIndex - 1 + items.length) % items.length
            : Math.max(currentIndex - 1, 0);
    }

    export function goTo(index: number) {
        currentIndex = Math.max(0, Math.min(index, items.length - 1));
    }

    const cls = $derived(twMerge('relative overflow-hidden', classes));
</script>

<div
    class={cls}
    role="region"
    aria-roledescription="carousel"
    {...props}
>
    <div
        bind:this={scrollEl}
        class="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-live="polite"
        onscroll={handleScroll}
    >
        {#each items as item, index (index)}
            <div
                class="shrink-0 w-full snap-center"
                role="group"
                aria-roledescription="slide"
                aria-label="Slide {index + 1} of {items.length}"
            >
                {@render children({ item, index })}
            </div>
        {/each}
    </div>

    {#if showArrows}
        <button
            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm text-canvas-contrast shadow transition hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
            onclick={prev}
            aria-label="Previous slide"
            disabled={!loop && currentIndex === 0}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
        </button>
        <button
            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm text-canvas-contrast shadow transition hover:bg-surface disabled:opacity-30 disabled:pointer-events-none"
            onclick={next}
            aria-label="Next slide"
            disabled={!loop && currentIndex === items.length - 1}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
    {/if}
</div>
