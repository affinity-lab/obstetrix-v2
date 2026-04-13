<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Switch }  from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';

  const name = $derived($page.params.name);
  type Tab = 'conf' | 'env' | 'npmrc';
  let activeTab  = $state<Tab>('conf');
  let confText   = $state('');
  let envText    = $state('');
  let npmrcText  = $state('');
  let saving     = $state(false);
  let syncing    = $state(false);
  let msg        = $state<string | null>(null);

  // Lazy load flags for env and npmrc tabs
  let envLoaded   = $state(false);
  let npmrcLoaded = $state(false);

  // Delete state
  let showDelete  = $state(false);
  let removeData  = $state(false);
  let confirmName = $state('');
  let deleting    = $state(false);

  onMount(async () => {
    const conf = await api.config.getProjectConf.$query({ name });
    confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join('\n');
  });

  async function onTabChange(tab: Tab) {
    activeTab = tab;
    if (tab === 'env' && !envLoaded) {
      const res = await api.config.getEnv.$query({ name });
      envText = res.content;
      envLoaded = true;
    }
    if (tab === 'npmrc' && !npmrcLoaded) {
      const res = await api.config.getNpmrc.$query({ name });
      npmrcText = res.content;
      npmrcLoaded = true;
    }
  }

  async function saveConf() {
    saving = true; msg = null;
    try {
      const changes: Record<string, string> = {};
      for (const line of confText.split('\n')) {
        const eq = line.indexOf('=');
        if (eq > 0) changes[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
      await api.config.setProjectConf.$command({ name, changes });
      msg = 'saved — changes apply on next deploy';
    } catch (e) { msg = `error: ${e}`; }
    finally { saving = false; }
  }

  async function saveEnv() {
    saving = true; msg = null;
    try {
      await api.config.setEnv.$command({ name, content: envText });
      msg = 'saved';
    } catch (e) { msg = `error: ${e}`; }
    finally { saving = false; }
  }

  async function saveNpmrc() {
    saving = true; msg = null;
    try {
      await api.config.setNpmrc.$command({ name, content: npmrcText });
      msg = 'saved';
    } catch (e) { msg = `error: ${e}`; }
    finally { saving = false; }
  }

  async function syncEnvNow() {
    syncing = true; msg = null;
    try {
      await api.config.syncEnv.$command({ name });
      msg = 'env synced and services restarted';
    } catch (e) { msg = `error: ${e}`; }
    finally { syncing = false; }
  }

  async function deleteProject() {
    deleting = true;
    try {
      await api.config.deleteProject.$command({ name, removeData });
      location.href = '/';
    } catch (e) { msg = `error: ${e}`; deleting = false; }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'conf',  label: 'project.conf' },
    { id: 'env',   label: '.env' },
    { id: 'npmrc', label: '.npmrc' },
  ];
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <div class="flex items-center gap-2 text-sm">
    <a href="/settings" class="text-muted-c hover:text-control-c">settings</a>
    <span class="text-muted-c">/</span>
    <span class="text-control-c">{name}</span>
  </div>

  <div class="flex gap-1 border-b border-canvas">
    {#each tabs as tab}
      <button
        onclick={() => onTabChange(tab.id)}
        class="px-3 py-2 text-xs font-mono transition-colors
               {activeTab === tab.id
                 ? 'text-control-c border-b-2 border-accent -mb-px'
                 : 'text-muted-c hover:text-control-c'}"
      >{tab.label}</button>
    {/each}
  </div>

  {#if activeTab === 'conf'}
    <textarea
      bind:value={confText}
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-3 h-64 resize-none outline-none focus:border-accent"
      spellcheck="false"
    ></textarea>
    <div class="flex gap-2">
      <Button small onclick={saveConf} disabled={saving}>
        {saving ? 'saving...' : 'save'}
      </Button>
    </div>

  {:else if activeTab === 'env'}
    <textarea
      bind:value={envText}
      placeholder="NODE_ENV=production&#10;DATABASE_URL=$&#123;DATABASE_URL&#125;"
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-3 h-64 resize-none outline-none focus:border-accent"
      spellcheck="false"
    ></textarea>
    <div class="flex gap-2">
      <Button small onclick={saveEnv} disabled={saving}>
        {saving ? 'saving...' : 'save'}
      </Button>
      <Button small secondary onclick={syncEnvNow} disabled={syncing}>
        {syncing ? 'syncing...' : 'sync now'}
      </Button>
    </div>

  {:else if activeTab === 'npmrc'}
    <textarea
      bind:value={npmrcText}
      placeholder="frozen-lockfile=true"
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-3 h-64 resize-none outline-none focus:border-accent"
      spellcheck="false"
    ></textarea>
    <Button small onclick={saveNpmrc} disabled={saving}>
      {saving ? 'saving...' : 'save'}
    </Button>
  {/if}

  {#if msg}
    <p class="text-muted-c text-xs">{msg}</p>
  {/if}

  <!-- Danger zone -->
  <div class="border-t border-canvas pt-4 flex flex-col gap-3">
    <span class="text-muted-c text-xs uppercase tracking-wide">danger zone</span>
    {#if !showDelete}
      <div>
        <Button destructive small onclick={() => showDelete = true}>delete project…</Button>
      </div>
    {:else}
      <p class="text-muted-c text-xs">
        Stops all instances and removes config and port allocation.
        App directories are {removeData ? 'deleted' : 'kept'}.
        State files and deploy logs are always preserved.
      </p>
      <label class="flex items-center gap-2 text-xs text-muted-c cursor-pointer">
        <Switch bind:value={removeData} />
        remove app data (/obstetrix-projects/{name}/)
      </label>
      <input
        bind:value={confirmName}
        placeholder="type project name to confirm"
        class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
               px-3 py-2 outline-none focus:border-accent"
      />
      <div class="flex gap-2">
        <Button destructive small
          disabled={confirmName !== name || deleting}
          onclick={deleteProject}>
          {deleting ? 'deleting…' : 'delete'}
        </Button>
        <Button ghost small onclick={() => { showDelete = false; confirmName = ''; removeData = false; }}>
          cancel
        </Button>
      </div>
    {/if}
  </div>
</div>
