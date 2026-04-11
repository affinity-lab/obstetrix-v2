<script lang="ts">
  import { onMount } from 'svelte';
  import { Button }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';

  let confText = $state('');
  let masked   = $state(true);
  let saving   = $state(false);
  let msg      = $state<string | null>(null);

  async function load() {
    const m = await api.config.getMainConf.$query({ mask: masked });
    confText = Object.entries(m).map(([k, v]) => `${k}=${v}`).join('\n');
  }

  onMount(load);

  async function save() {
    saving = true; msg = null;
    try {
      const changes: Record<string, string> = {};
      for (const line of confText.split('\n')) {
        const eq = line.indexOf('=');
        if (eq > 0) changes[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
      // Skip lines that still contain masked values
      for (const k of Object.keys(changes)) {
        if (changes[k].includes('****')) delete changes[k];
      }
      await api.config.setMainConf.$command({ changes });
      msg = 'saved';
    } catch (e) { msg = `error: ${e}`; }
    finally { saving = false; }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-3">
    <a href="/settings" class="text-muted-c text-sm hover:text-control-c">← settings</a>
    <span class="text-control-c text-sm font-medium">obstetrix.conf</span>
  </div>

  <p class="text-muted-c text-xs">
    All settings including <code class="font-mono">GITHUB_TOKEN</code> and
    <code class="font-mono">PORT.*</code> assignments. Values for keys containing
    TOKEN / SECRET / KEY are masked by default.
  </p>

  <div class="flex items-center gap-2">
    <label class="flex items-center gap-2 text-muted-c text-xs cursor-pointer">
      <input type="checkbox" bind:checked={masked} onchange={load} class="accent-accent" />
      mask secret values
    </label>
  </div>

  <textarea
    bind:value={confText}
    class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
           p-3 h-[50vh] resize-none outline-none focus:border-accent"
    spellcheck="false"
  ></textarea>

  <div class="flex gap-2">
    <Button small onclick={save} disabled={saving}>{saving ? 'saving...' : 'save'}</Button>
  </div>
  {#if msg}<p class="text-muted-c text-xs">{msg}</p>{/if}
</div>
