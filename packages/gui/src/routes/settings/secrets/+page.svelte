<script lang="ts">
  import { onMount } from 'svelte';
  import { Button, Switch, Textarea, Breadcrumb, getToastManager } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';

  let confText = $state('');
  let masked   = $state(true);
  let saving   = $state(false);
  let loaded   = $state(false);

  const toast = getToastManager();

  async function load() {
    const m = await api.config.getMainConf.$query({ mask: masked });
    confText = Object.entries(m).map(([k, v]) => `${k}=${v}`).join('\n');
  }

  // Reload when masked toggle changes (after initial mount)
  $effect(() => {
    masked; // reactive dependency
    if (loaded) load();
  });

  onMount(async () => {
    await load();
    loaded = true;
  });

  async function save() {
    saving = true;
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
      toast.show('Saved', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { saving = false; }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <Breadcrumb items={[
    { label: 'settings', href: '/settings' },
    { label: 'obstetrix.conf' },
  ]} />

  <p class="text-muted-contrast text-xs">
    All settings including <code class="font-mono">GITHUB_TOKEN</code> and
    <code class="font-mono">PORT.*</code> assignments. Values for keys containing
    TOKEN / SECRET / KEY are masked by default.
  </p>

  <Switch bind:value={masked} label="mask secret values" />

  <Textarea
    bind:value={confText}
    monospace
    rows={24}
  />

  <div class="flex gap-2">
    <Button small onclick={save} loading={saving}>{saving ? 'saving...' : 'save'}</Button>
  </div>
</div>
