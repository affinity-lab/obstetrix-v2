<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Chip, Button, Breadcrumb, Textarea, getToastManager } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';

  const siteName = $derived(decodeURIComponent($page.params.site));

  let content   = $state('');
  let original  = $state('');
  let loading   = $state(true);
  let saving    = $state(false);
  let testing   = $state(false);
  let reloading = $state(false);
  let dirty     = $derived(content !== original);
  let testResult = $state<{ text: string; ok: boolean } | null>(null);

  const toast = getToastManager();

  onMount(async () => {
    try {
      const res = await api.nginx.get.$query({ name: siteName });
      content = res.content;
      original = res.content;
    } catch (e) {
      testResult = { text: String(e), ok: false };
    } finally {
      loading = false;
    }
  });

  async function save() {
    saving = true; testResult = null;
    try {
      const res = await api.nginx.set.$command({ name: siteName, content });
      original = content;
      testResult = { text: res.output || 'saved — nginx -t passed', ok: true };
      toast.show('Config saved', { type: 'success' });
    } catch (e) {
      testResult = { text: String(e), ok: false };
    } finally { saving = false; }
  }

  async function testOnly() {
    testing = true; testResult = null;
    try {
      const res = await api.nginx.test.$query(undefined);
      testResult = { text: res.output || (res.ok ? 'syntax ok' : 'test failed'), ok: res.ok };
    } catch (e) {
      testResult = { text: String(e), ok: false };
    } finally { testing = false; }
  }

  async function reloadNginx() {
    reloading = true; testResult = null;
    try {
      const res = await api.nginx.reload.$command(undefined);
      toast.show(res.output || 'nginx reloaded', { type: 'success' });
    } catch (e) {
      toast.show(String(e), { type: 'error' });
    } finally { reloading = false; }
  }

  function reset() {
    content = original;
    testResult = null;
  }
</script>

<div class="flex flex-col gap-4 max-w-3xl">
  <div class="flex items-center gap-2 flex-wrap">
    <Breadcrumb items={[
      { label: 'settings', href: '/settings' },
      { label: 'nginx', href: '/settings/nginx' },
      { label: siteName },
    ]} />
    {#if dirty}
      <Chip color="blue">unsaved</Chip>
    {/if}
  </div>

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else}
    <Textarea
      bind:value={content}
      monospace
      rows={28}
    />

    <div class="flex gap-2 flex-wrap items-center">
      <Button small onclick={save} disabled={saving || !dirty} loading={saving}>
        {saving ? 'saving…' : 'save'}
      </Button>
      <Button ghost small onclick={testOnly} loading={testing}>
        {testing ? 'testing…' : 'test config'}
      </Button>
      <Button ghost small onclick={reloadNginx} loading={reloading}>
        {reloading ? 'reloading…' : 'reload nginx'}
      </Button>
      {#if dirty}
        <Button ghost small onclick={reset}>reset</Button>
      {/if}
    </div>

    {#if testResult}
      <pre class="text-xs rounded-lg px-4 py-3 font-mono whitespace-pre-wrap border border-base-b
                  {testResult.ok ? 'bg-raised text-green-400' : 'bg-raised text-red-400'}">{testResult.text}</pre>
    {/if}

    <div class="border-t border-base-b pt-3">
      <p class="text-muted-c text-xs">
        Editing <span class="font-mono">/etc/nginx/sites-available/{siteName}</span>.
        <strong>Save</strong> writes the file and runs <span class="font-mono">nginx -t</span> — restores the previous version if the test fails.
        <strong>Reload nginx</strong> applies the new config to live traffic.
      </p>
    </div>
  {/if}
</div>
