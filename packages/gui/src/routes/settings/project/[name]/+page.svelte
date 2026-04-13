<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Switch } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import { BUILD_TEMPLATES, templateToConf } from '$lib/templates.js';

  const name = $derived($page.params.name);
  type Tab = 'deploy' | 'conf' | 'env' | 'npmrc';
  let activeTab  = $state<Tab>('deploy');
  let confText   = $state('');
  let envText    = $state('');
  let npmrcText  = $state('');
  let saving     = $state(false);
  let syncing    = $state(false);
  let msg        = $state<string | null>(null);

  // Deploy tab — structured fields parsed from project.conf
  let deployLoaded  = $state(false);
  let buildCmd      = $state('');
  let branch        = $state('main');
  let healthUrl     = $state('');
  let healthTimeout = $state(60);
  let rollbackOnFail = $state(true);
  let defaultInstances = $state(1);
  let persistentDirs = $state('');

  // Lazy load flags
  let confLoaded  = $state(false);
  let envLoaded   = $state(false);
  let npmrcLoaded = $state(false);

  // Template picker
  let showTemplates = $state(false);

  // Delete state
  let showDelete  = $state(false);
  let removeData  = $state(false);
  let confirmName = $state('');
  let deleting    = $state(false);

  /** Parse key=value lines from the conf string into a map. */
  function parseConf(text: string): Record<string, string> {
    const m: Record<string, string> = {};
    for (const line of text.split('\n')) {
      const eq = line.indexOf('=');
      if (eq > 0) m[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
    }
    return m;
  }

  async function loadConf(): Promise<Record<string, string>> {
    const conf = await api.config.getProjectConf.$query({ name });
    return conf;
  }

  onMount(async () => {
    // Load deploy tab on initial mount since it's the default
    const conf = await loadConf();
    applyConfToDeployFields(conf);
    // Also populate raw confText for the conf tab (don't re-fetch)
    confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join('\n');
    confLoaded = true;
    deployLoaded = true;
  });

  function applyConfToDeployFields(conf: Record<string, string>) {
    buildCmd         = conf['BUILD_CMD']          ?? '';
    branch           = conf['BRANCH']             ?? 'main';
    healthUrl        = conf['HEALTH_CHECK_URL']   ?? '';
    healthTimeout    = parseInt(conf['HEALTH_TIMEOUT'] ?? '60', 10) || 60;
    rollbackOnFail   = (conf['ROLLBACK_ON_FAIL']  ?? 'true') !== 'false';
    defaultInstances = parseInt(conf['DEFAULT_INSTANCES'] ?? '1', 10) || 1;
    persistentDirs   = conf['PERSISTENT_DIRS']    ?? '';
  }

  async function onTabChange(tab: Tab) {
    activeTab = tab;
    msg = null;
    if (tab === 'deploy' && !deployLoaded) {
      const conf = await loadConf();
      applyConfToDeployFields(conf);
      deployLoaded = true;
    }
    if (tab === 'conf' && !confLoaded) {
      const conf = await loadConf();
      confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join('\n');
      confLoaded = true;
    }
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

  async function saveDeploy() {
    saving = true; msg = null;
    try {
      const changes: Record<string, string> = {
        BUILD_CMD:          buildCmd,
        BRANCH:             branch,
        HEALTH_CHECK_URL:   healthUrl,
        HEALTH_TIMEOUT:     String(healthTimeout),
        ROLLBACK_ON_FAIL:   rollbackOnFail ? 'true' : 'false',
        DEFAULT_INSTANCES:  String(defaultInstances),
        PERSISTENT_DIRS:    persistentDirs,
      };
      await api.config.setProjectConf.$command({ name, changes });
      // Invalidate conf tab so it re-loads if visited
      confLoaded = false;
      msg = 'saved — changes apply on next deploy';
    } catch (e) { msg = `error: ${e}`; }
    finally { saving = false; }
  }

  function applyTemplate(tplId: string) {
    const tpl = BUILD_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    if (activeTab === 'deploy') {
      buildCmd         = tpl.buildCmd;
      healthUrl        = `http://127.0.0.1:$PORT${tpl.healthPath}`;
      healthTimeout    = tpl.healthTimeout;
      defaultInstances = tpl.defaultInstances;
      persistentDirs   = tpl.persistentDirs;
      showTemplates = false;
      msg = `template "${tpl.label}" applied — review and save`;
    } else {
      let repoUrl = '';
      let br = branch || 'main';
      for (const line of confText.split('\n')) {
        const eq = line.indexOf('=');
        if (eq <= 0) continue;
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        if (k === 'REPO_URL') repoUrl = v;
        if (k === 'BRANCH')   br = v;
      }
      confText = templateToConf(tpl, repoUrl, br);
      showTemplates = false;
      confLoaded = true;
      msg = `template "${tpl.label}" applied — review and save`;
    }
  }

  async function saveConf() {
    saving = true; msg = null;
    try {
      const changes = parseConf(confText);
      await api.config.setProjectConf.$command({ name, changes });
      deployLoaded = false; // force reload of deploy fields
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
    { id: 'deploy', label: 'deploy' },
    { id: 'conf',   label: 'project.conf' },
    { id: 'env',    label: '.env' },
    { id: 'npmrc',  label: '.npmrc' },
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

  <!-- ── Deploy tab ─────────────────────────────────────── -->
  {#if activeTab === 'deploy'}

    <div class="flex flex-col gap-4">

      <!-- Build command -->
      <div class="flex flex-col gap-1.5">
        <label class="text-muted-c text-xs font-medium uppercase tracking-wide">
          build command
          <span class="normal-case font-normal ml-1 opacity-70">— runs in /obstetrix-projects/_work/{name}/</span>
        </label>
        <textarea
          bind:value={buildCmd}
          placeholder="bun install && bun run build"
          spellcheck="false"
          rows="4"
          class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
                 px-3 py-2 resize-y outline-none focus:border-accent leading-relaxed"
        ></textarea>
        <p class="text-muted-c text-xs">
          Use <span class="font-mono">&amp;&amp;</span> to chain commands.
          The working directory is the git checkout root.
          Port is available as <span class="font-mono">$PORT</span> at runtime (not during build).
        </p>
      </div>

      <!-- Template picker -->
      {#if showTemplates}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {#each BUILD_TEMPLATES as tpl}
            <button
              onclick={() => applyTemplate(tpl.id)}
              class="text-left px-3 py-2 rounded border border-canvas text-xs
                     text-muted-c hover:text-control-c hover:border-accent transition-colors"
            >
              <div class="font-medium">{tpl.label}</div>
              <div class="opacity-70 mt-0.5 font-mono">{tpl.buildCmd.slice(0, 32)}{tpl.buildCmd.length > 32 ? '…' : ''}</div>
            </button>
          {/each}
        </div>
        <Button ghost small onclick={() => showTemplates = false}>cancel</Button>
      {:else}
        <Button ghost small onclick={() => showTemplates = true}>load template…</Button>
      {/if}

      <hr class="border-canvas" />

      <!-- Source -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">branch</label>
          <input
            bind:value={branch}
            placeholder="main"
            class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
                   px-3 py-2 outline-none focus:border-accent"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">persistent dirs</label>
          <input
            bind:value={persistentDirs}
            placeholder="uploads,data"
            class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
                   px-3 py-2 outline-none focus:border-accent"
          />
          <p class="text-muted-c text-xs">comma-separated, relative to app dir — survive all deploys</p>
        </div>
      </div>

      <hr class="border-canvas" />

      <!-- Health check -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">health check URL</label>
          <input
            bind:value={healthUrl}
            placeholder="http://127.0.0.1:$PORT/health"
            class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
                   px-3 py-2 outline-none focus:border-accent"
          />
          <p class="text-muted-c text-xs">checked after each instance restart — must return 2xx</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">health timeout (seconds)</label>
          <input
            type="number"
            bind:value={healthTimeout}
            min="5"
            max="300"
            class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
                   px-3 py-2 outline-none focus:border-accent"
          />
        </div>
      </div>

      <hr class="border-canvas" />

      <!-- Behaviour -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">default instances</label>
          <input
            type="number"
            bind:value={defaultInstances}
            min="1"
            max="16"
            class="bg-raised border border-canvas rounded font-mono text-xs text-control-c
                   px-3 py-2 outline-none focus:border-accent"
          />
          <p class="text-muted-c text-xs">how many instances start on first deploy</p>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-muted-c text-xs font-medium uppercase tracking-wide">rollback on fail</label>
          <label class="flex items-center gap-2 cursor-pointer">
            <Switch bind:value={rollbackOnFail} />
            <span class="text-xs text-muted-c">
              {rollbackOnFail ? 'auto-rollback to previous SHA on failure' : 'leave failed — no rollback'}
            </span>
          </label>
        </div>
      </div>

      <div class="flex gap-2">
        <Button small onclick={saveDeploy} disabled={saving}>
          {saving ? 'saving…' : 'save'}
        </Button>
      </div>
    </div>

  <!-- ── Raw conf tab ───────────────────────────────────── -->
  {:else if activeTab === 'conf'}
    <textarea
      bind:value={confText}
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-3 h-64 resize-none outline-none focus:border-accent"
      spellcheck="false"
    ></textarea>

    {#if showTemplates}
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {#each BUILD_TEMPLATES as tpl}
          <button
            onclick={() => applyTemplate(tpl.id)}
            class="text-left px-3 py-2 rounded border border-canvas text-xs
                   text-muted-c hover:text-control-c hover:border-accent transition-colors"
          >
            <div class="font-medium">{tpl.label}</div>
            <div class="opacity-70 mt-0.5 font-mono">{tpl.buildCmd.slice(0, 30)}{tpl.buildCmd.length > 30 ? '…' : ''}</div>
          </button>
        {/each}
      </div>
      <Button ghost small onclick={() => showTemplates = false}>cancel</Button>
    {:else}
      <div class="flex gap-2">
        <Button small onclick={saveConf} disabled={saving}>
          {saving ? 'saving...' : 'save'}
        </Button>
        <Button ghost small onclick={() => showTemplates = true}>load template…</Button>
      </div>
    {/if}

  <!-- ── .env tab ───────────────────────────────────────── -->
  {:else if activeTab === 'env'}
    <textarea
      bind:value={envText}
      placeholder="NODE_ENV=production&#10;DATABASE_URL=$&#123;DATABASE_URL&#125;"
      class="bg-raised border border-canvas rounded-lg font-mono text-xs text-control-c
             p-3 h-64 resize-none outline-none focus:border-accent"
      spellcheck="false"
    ></textarea>
    <p class="text-muted-c text-xs">
      Use <span class="font-mono">$&#123;VAR&#125;</span> to substitute values from
      <span class="font-mono">obstetrix.conf</span> at deploy time.
    </p>
    <div class="flex gap-2">
      <Button small onclick={saveEnv} disabled={saving}>
        {saving ? 'saving...' : 'save'}
      </Button>
      <Button small secondary onclick={syncEnvNow} disabled={syncing}>
        {syncing ? 'syncing...' : 'sync now'}
      </Button>
    </div>

  <!-- ── .npmrc tab ─────────────────────────────────────── -->
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

  <!-- ── Danger zone ────────────────────────────────────── -->
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
