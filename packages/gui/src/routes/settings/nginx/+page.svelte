<script lang="ts">
  import { onMount } from 'svelte';
  import { Chip, Button, Breadcrumb, getToastManager } from '@atom-forge/ui';
  import { api } from '$lib/tango.js';

  type NginxSite = { name: string; enabled: boolean };

  let sites     = $state<NginxSite[]>([]);
  let loading   = $state(true);
  let testing   = $state(false);
  let reloading = $state(false);
  let testOutput = $state<{ text: string; ok: boolean } | null>(null);
  let toggling  = $state<string | null>(null);

  const toast = getToastManager();

  async function load() {
    try {
      sites = await api.nginx.list.$query(undefined);
    } finally {
      loading = false;
    }
  }

  onMount(load);

  async function testConfig() {
    testing = true; testOutput = null;
    try {
      const res = await api.nginx.test.$query(undefined);
      testOutput = { text: res.output || (res.ok ? 'syntax ok' : 'test failed'), ok: res.ok };
    } catch (e) {
      testOutput = { text: String(e), ok: false };
    } finally { testing = false; }
  }

  async function reloadNginx() {
    reloading = true; testOutput = null;
    try {
      const res = await api.nginx.reload.$command(undefined);
      toast.show(res.output || 'nginx reloaded', { type: 'success' });
    } catch (e) {
      toast.show(String(e), { type: 'error' });
    } finally { reloading = false; }
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
      toast.show(String(e), { type: 'error' });
    } finally { toggling = null; }
  }
</script>

<div class="flex flex-col gap-6 max-w-2xl">
  <Breadcrumb items={[
    { label: 'settings', href: '/settings' },
    { label: 'nginx' },
  ]} />

  <div class="flex gap-2 flex-wrap">
    <Button small onclick={testConfig} loading={testing}>
      {testing ? 'testing…' : 'test config'}
    </Button>
    <Button small secondary onclick={reloadNginx} loading={reloading}>
      {reloading ? 'reloading…' : 'reload nginx'}
    </Button>
  </div>

  {#if testOutput}
    <pre class="text-xs rounded-lg px-4 py-3 font-mono whitespace-pre-wrap border border-base-b
                {testOutput.ok ? 'bg-raised text-green-400' : 'bg-raised text-red-400'}">{testOutput.text}</pre>
  {/if}

  {#if loading}
    <p class="text-muted-c text-sm">loading...</p>
  {:else if sites.length === 0}
    <p class="text-muted-c text-sm">no configs found in /etc/nginx/sites-available/</p>
  {:else}
    <div class="bg-raised border border-base-b rounded-lg overflow-hidden">
      <div class="px-4 py-2.5 border-b border-base-b">
        <span class="text-muted-c text-xs uppercase tracking-wide">sites-available</span>
      </div>
      {#each sites as site}
        <div class="flex items-center gap-3 px-4 py-3 border-b border-base-b last:border-0">
          <a
            href="/settings/nginx/{encodeURIComponent(site.name)}"
            class="flex-1 text-control-c text-sm font-mono hover:underline"
          >{site.name}</a>
          <Chip color={site.enabled ? 'green' : 'base'}>
            {site.enabled ? 'enabled' : 'disabled'}
          </Chip>
          {#if toggling === site.name}
            <span class="text-muted-c text-xs w-14">…</span>
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
