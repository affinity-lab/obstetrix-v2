<script lang="ts">
  import { onMount } from 'svelte';
  import { Badge, Button, Switch } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';

  type NginxSite = { name: string; enabled: boolean };

  let sites     = $state<NginxSite[]>([]);
  let loading   = $state(true);
  let testing   = $state(false);
  let reloading = $state(false);
  let msg       = $state<{ text: string; ok: boolean } | null>(null);
  let toggling  = $state<string | null>(null);

  async function load() {
    try {
      sites = await api.nginx.list.$query(undefined);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function testConfig() {
    testing = true; msg = null;
    try {
      const res = await api.nginx.test.$query(undefined);
      msg = { text: res.output || (res.ok ? 'syntax ok' : 'test failed'), ok: res.ok };
    } catch (e) {
      msg = { text: String(e), ok: false };
    } finally {
      testing = false;
    }
  }

  async function reloadNginx() {
    reloading = true; msg = null;
    try {
      const res = await api.nginx.reload.$command(undefined);
      msg = { text: res.output || 'nginx reloaded', ok: true };
    } catch (e) {
      msg = { text: String(e), ok: false };
    } finally {
      reloading = false;
    }
  }

  async function toggleSite(site: NginxSite) {
    toggling = site.name;
    try {
      if (site.enabled) {
        await api.nginx.disable.$command({ name: site.name });
      } else {
        await api.nginx.enable.$command({ name: site.name });
      }
      sites = sites.map(s => s.name === site.name ? { ...s, enabled: !s.enabled } : s);
    } catch (e) {
      msg = { text: String(e), ok: false };
    } finally {
      toggling = null;
    }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <div class="flex items-center gap-2 text-sm">
    <a href="/settings" class="text-muted-c hover:text-control-c">settings</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c">nginx</span>
  </div>

  <div class="flex gap-2 flex-wrap">
    <Button small onclick={testConfig} disabled={testing}>
      {testing ? 'testing…' : 'test config'}
    </Button>
    <Button small secondary onclick={reloadNginx} disabled={reloading}>
      {reloading ? 'reloading…' : 'reload nginx'}
    </Button>
  </div>

  {#if msg}
    <pre class="text-xs rounded-lg px-4 py-3 font-mono whitespace-pre-wrap
                {msg.ok ? 'bg-raised text-accent border border-canvas' : 'bg-raised text-red-400 border border-canvas'}">{msg.text}</pre>
  {/if}

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if sites.length === 0}
    <p class="text-muted-c text-sm">no configs found in /etc/nginx/sites-available/</p>
  {:else}
    <div class="bg-raised border border-canvas rounded-lg overflow-hidden">
      <div class="px-4 py-2 border-b border-canvas">
        <span class="text-muted-c text-xs uppercase tracking-wide">sites-available</span>
      </div>
      {#each sites as site}
        <div class="flex items-center gap-3 px-4 py-3 border-b border-canvas last:border-0">
          <a
            href="/settings/nginx/{encodeURIComponent(site.name)}"
            class="flex-1 text-control-c text-sm font-mono hover:underline"
          >{site.name}</a>
          <Badge color={site.enabled ? 'accent' : undefined}>
            {site.enabled ? 'enabled' : 'disabled'}
          </Badge>
          {#if toggling === site.name}
            <span class="text-muted-c text-xs">…</span>
          {:else}
            <Button micro ghost onclick={() => toggleSite(site)} disabled={toggling !== null}>
              {site.enabled ? 'disable' : 'enable'}
            </Button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
