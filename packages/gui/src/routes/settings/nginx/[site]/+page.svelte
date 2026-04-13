<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Badge, Button } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';

  const siteName = $derived(decodeURIComponent($page.params.site));

  let content   = $state('');
  let original  = $state('');
  let loading   = $state(true);
  let saving    = $state(false);
  let testing   = $state(false);
  let reloading = $state(false);
  let dirty     = $derived(content !== original);
  let result    = $state<{ text: string; ok: boolean } | null>(null);

  onMount(async () => {
    try {
      const res = await api.nginx.get.$query({ name: siteName });
      content = res.content;
      original = res.content;
    } catch (e) {
      result = { text: String(e), ok: false };
    } finally {
      loading = false;
    }
  });

  async function save() {
    saving = true; result = null;
    try {
      const res = await api.nginx.set.$command({ name: siteName, content });
      original = content;
      result = { text: res.output || 'saved — nginx -t passed', ok: true };
    } catch (e) {
      result = { text: String(e), ok: false };
    } finally {
      saving = false;
    }
  }

  async function testOnly() {
    testing = true; result = null;
    try {
      const res = await api.nginx.test.$query(undefined);
      result = { text: res.output || (res.ok ? 'syntax ok' : 'test failed'), ok: res.ok };
    } catch (e) {
      result = { text: String(e), ok: false };
    } finally {
      testing = false;
    }
  }

  async function reloadNginx() {
    reloading = true; result = null;
    try {
      const res = await api.nginx.reload.$command(undefined);
      result = { text: res.output || 'nginx reloaded', ok: true };
    } catch (e) {
      result = { text: String(e), ok: false };
    } finally {
      reloading = false;
    }
  }

  function reset() {
    content = original;
    result = null;
  }
</script>

<div class="flex flex-col gap-4 max-w-3xl">
  <div class="flex items-center gap-2 text-sm flex-wrap">
    <a href="/settings" class="text-muted-c hover:text-control-c">settings</a>
    <span class="text-muted-c">/</span>
    <a href="/settings/nginx" class="text-muted-c hover:text-control-c">nginx</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c font-mono">{siteName}</span>
    {#if dirty}
      <Badge color="blue">unsaved</Badge>
    {/if}
  </div>

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else}
    <textarea
      bind:value={content}
      spellcheck="false"
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-4 h-[60vh] resize-none outline-none focus:border-accent leading-relaxed"
    ></textarea>

    <div class="flex gap-2 flex-wrap items-center">
      <Button small onclick={save} disabled={saving || !dirty}>
        {saving ? 'saving…' : 'save'}
      </Button>
      <Button ghost small onclick={testOnly} disabled={testing}>
        {testing ? 'testing…' : 'test config'}
      </Button>
      <Button ghost small onclick={reloadNginx} disabled={reloading}>
        {reloading ? 'reloading…' : 'reload nginx'}
      </Button>
      {#if dirty}
        <Button ghost small onclick={reset}>reset</Button>
      {/if}
    </div>

    {#if result}
      <pre class="text-xs rounded-lg px-4 py-3 font-mono whitespace-pre-wrap
                  {result.ok
                    ? 'bg-raised text-accent border border-canvas'
                    : 'bg-raised text-red-400 border border-canvas'}">{result.text}</pre>
    {/if}

    <div class="border-t border-canvas pt-3">
      <p class="text-muted-c text-xs">
        Editing <span class="font-mono">/etc/nginx/sites-available/{siteName}</span>.
        <strong>Save</strong> writes the file and runs <span class="font-mono">nginx -t</span> — it restores the previous version if the test fails.
        <strong>Reload nginx</strong> applies the new config to live traffic.
      </p>
    </div>
  {/if}
</div>
