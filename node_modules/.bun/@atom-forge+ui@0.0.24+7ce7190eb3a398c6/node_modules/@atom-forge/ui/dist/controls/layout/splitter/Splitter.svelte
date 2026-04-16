<script lang="ts">
  import type { Snippet } from "svelte";
  import { untrack } from "svelte";
  import { twMerge } from "tailwind-merge";

  let {
    orientation = "vertical",
    initialSize = 50,
    minSize = 10,
    class: dividerClass,
    rootClass,
    start,
    end,
    divider,
    onresize,
    onresizeend,
  }: {
    orientation?: "vertical" | "horizontal";
    initialSize?: number;
    minSize?: number;
    class?: string;
    rootClass?: string;
    start: Snippet;
    end: Snippet;
    divider?: Snippet;
    onresize?: (detail: { start: number; end: number }) => void;
    onresizeend?: (detail: { start: number; end: number }) => void;
  } = $props();

  const uid = Math.random().toString(36).slice(2, 8);
  const startId = `splitter-start-${uid}`;
  const endId = `splitter-end-${uid}`;

  let startSize = $state(
    untrack(() => Math.max(minSize, Math.min(100 - minSize, initialSize))),
  );
  const endSize = $derived(100 - startSize);

  let dragging = $state(false);
  let container = $state<HTMLDivElement | undefined>();

  const isVertical = $derived(orientation === "vertical");

  function clamp(value: number): number {
    return Math.max(minSize, Math.min(100 - minSize, value));
  }

  function getClientPos(e: MouseEvent | TouchEvent): {
    clientX: number;
    clientY: number;
  } {
    if (e instanceof TouchEvent) {
      const touch = e.touches[0] ?? e.changedTouches[0];
      return { clientX: touch.clientX, clientY: touch.clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  }

  function calcSize(e: MouseEvent | TouchEvent): number {
    if (!container) return startSize;
    const rect = container.getBoundingClientRect();
    const { clientX, clientY } = getClientPos(e);
    const offset = isVertical ? clientX - rect.left : clientY - rect.top;
    const total = isVertical ? rect.width : rect.height;
    return clamp((offset / total) * 100);
  }

  function onDragStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    dragging = true;

    function onMove(e: MouseEvent | TouchEvent) {
      startSize = calcSize(e);
      onresize?.({ start: startSize, end: endSize });
    }

    function onEnd(e: MouseEvent | TouchEvent) {
      dragging = false;
      startSize = calcSize(e);
      onresizeend?.({ start: startSize, end: endSize });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }

  function onKeyDown(e: KeyboardEvent) {
    const step = e.shiftKey ? 10 : 1;
    const decKey = isVertical ? "ArrowLeft" : "ArrowUp";
    const incKey = isVertical ? "ArrowRight" : "ArrowDown";

    if (e.key === decKey) {
      e.preventDefault();
      startSize = clamp(startSize - step);
      onresize?.({ start: startSize, end: endSize });
      onresizeend?.({ start: startSize, end: endSize });
    } else if (e.key === incKey) {
      e.preventDefault();
      startSize = clamp(startSize + step);
      onresize?.({ start: startSize, end: endSize });
      onresizeend?.({ start: startSize, end: endSize });
    }
  }
</script>

<div
  bind:this={container}
  class={twMerge(
    "flex overflow-hidden h-full",
    isVertical ? "flex-row" : "flex-col",
    rootClass,
  )}
>
  <div
    id={startId}
    class="overflow-auto h-full"
    style={isVertical ? `width: ${startSize}%` : `height: ${startSize}%`}
  >
    {@render start()}
  </div>

  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    role="separator"
    tabindex="0"
    aria-orientation={orientation}
    aria-valuenow={Math.round(startSize)}
    aria-valuemin={minSize}
    aria-valuemax={100 - minSize}
    aria-controls="{startId} {endId}"
    class={twMerge(
      "flex-none flex items-center justify-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors bg-muted",
      isVertical
        ? "w-1.5 cursor-col-resize hover:bg-accent/90"
        : "h-1.5 cursor-row-resize hover:bg-accent/90",
      dragging && "bg-accent/30",
      dividerClass,
    )}
    style="touch-action: none"
    onmousedown={onDragStart}
    ontouchstart={onDragStart}
    onkeydown={onKeyDown}
  >
    {#if divider}
      {@render divider()}
    {:else}
      <div
        class={twMerge(
          "rounded-full bg-frame",
          isVertical ? "w-1 h-10" : "h-1 w-10",
        )}
      ></div>
    {/if}
  </div>

  <div id={endId} class="flex-1 overflow-auto min-w-0 min-h-0 h-full">
    {@render end()}
  </div>
</div>
