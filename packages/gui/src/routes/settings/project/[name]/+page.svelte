<script lang="ts">
  import { page }    from '$app/stores';
  import { onMount } from 'svelte';
  import { Button, Switch, Input, Textarea, Tabs, TabList, Tab, TabPanel, Breadcrumb, getToastManager } from '@atom-forge/ui';
  import { api }     from '$lib/tango.js';
  import { BUILD_TEMPLATES, templateToConf } from '$lib/templates.js';

  const name = $derived($page.params.name);
  type TabId = 'deploy' | 'conf' | 'env' | 'npmrc';
  let activeTab  = $state<TabId>('deploy');
  let confText   = $state('');
  let envText    = $state('');
  let npmrcText  = $state('');
  let saving     = $state(false);
  let syncing    = $state(false);

  const toast = getToastManager();

  // Deploy tab — structured fields parsed from project.conf
  let deployLoaded  = $state(false);
  let buildCmd      = $state('');
  let branch        = $state('main');
  let healthUrl     = $state('');
  let healthTimeout = $state('60');
  let rollbackOnFail = $state(true);
  let autoDeploy     = $state(true);
  let defaultInstances = $state('1');
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
    return await api.config.getProjectConf.$query({ name });
  }

  onMount(async () => {
    const conf = await loadConf();
    applyConfToDeployFields(conf);
    confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join('\n');
    confLoaded = true;
    deployLoaded = true;
  });

  function applyConfToDeployFields(conf: Record<string, string>) {
    buildCmd         = conf['BUILD_CMD']          ?? '';
    branch           = conf['BRANCH']             ?? 'main';
    healthUrl        = conf['HEALTH_CHECK_URL']   ?? '';
    healthTimeout    = conf['HEALTH_TIMEOUT']     ?? '60';
    rollbackOnFail   = (conf['ROLLBACK_ON_FAIL']  ?? 'true') !== 'false';
    autoDeploy       = (conf['AUTO_DEPLOY']        ?? 'true') !== 'false';
    defaultInstances = conf['DEFAULT_INSTANCES']   ?? '1';
    persistentDirs   = conf['PERSISTENT_DIRS']    ?? '';
  }

  async function onTabChange(id: string) {
    activeTab = id as TabId;
    if (id === 'deploy' && !deployLoaded) {
      const conf = await loadConf();
      applyConfToDeployFields(conf);
      deployLoaded = true;
    }
    if (id === 'conf' && !confLoaded) {
      const conf = await loadConf();
      confText = Object.entries(conf).map(([k, v]) => `${k}=${v}`).join('\n');
      confLoaded = true;
    }
    if (id === 'env' && !envLoaded) {
      const res = await api.config.getEnv.$query({ name });
      envText = res.content;
      envLoaded = true;
    }
    if (id === 'npmrc' && !npmrcLoaded) {
      const res = await api.config.getNpmrc.$query({ name });
      npmrcText = res.content;
      npmrcLoaded = true;
    }
  }

  async function saveDeploy() {
    saving = true;
    try {
      const changes: Record<string, string> = {
        BUILD_CMD:          buildCmd,
        BRANCH:             branch,
        HEALTH_CHECK_URL:   healthUrl,
        HEALTH_TIMEOUT:     healthTimeout,
        ROLLBACK_ON_FAIL:   rollbackOnFail ? 'true' : 'false',
        AUTO_DEPLOY:        autoDeploy ? 'true' : 'false',
        DEFAULT_INSTANCES:  defaultInstances,
        PERSISTENT_DIRS:    persistentDirs,
      };
      await api.config.setProjectConf.$command({ name, changes });
      confLoaded = false;
      toast.show('Saved — changes apply on next deploy', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { saving = false; }
  }

  function applyTemplate(tplId: string) {
    const tpl = BUILD_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;
    if (activeTab === 'deploy') {
      buildCmd         = tpl.buildCmd;
      healthUrl        = `http://127.0.0.1:$PORT${tpl.healthPath}`;
      healthTimeout    = String(tpl.healthTimeout);
      defaultInstances = String(tpl.defaultInstances);
      persistentDirs   = tpl.persistentDirs;
      showTemplates = false;
      toast.show(`Template "${tpl.label}" applied — review and save`, { type: 'info' });
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
      toast.show(`Template "${tpl.label}" applied — review and save`, { type: 'info' });
    }
  }

  async function saveConf() {
    saving = true;
    try {
      const changes = parseConf(confText);
      await api.config.setProjectConf.$command({ name, changes });
      deployLoaded = false;
      toast.show('Saved — changes apply on next deploy', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { saving = false; }
  }

  async function saveEnv() {
    saving = true;
    try {
      await api.config.setEnv.$command({ name, content: envText });
      toast.show('Saved', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { saving = false; }
  }

  async function saveNpmrc() {
    saving = true;
    try {
      await api.config.setNpmrc.$command({ name, content: npmrcText });
      toast.show('Saved', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { saving = false; }
  }

  async function syncEnvNow() {
    syncing = true;
    try {
      await api.config.syncEnv.$command({ name });
      toast.show('Env synced and services restarted', { type: 'success' });
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
    } finally { syncing = false; }
  }

  async function deleteProject() {
    deleting = true;
    try {
      await api.config.deleteProject.$command({ name, removeData });
      location.href = '/';
    } catch (e) {
      toast.show(`Error: ${e}`, { type: 'error' });
      deleting = false;
    }
  }
</script>

<div class="flex flex-col gap-4 max-w-2xl">
  <Breadcrumb items={[
    { label: 'settings', href: '/settings' },
    { label: name },
  ]} />

  <Tabs initialTabId="deploy" onTabChange={onTabChange}>
    <TabList>
      <Tab id="deploy">deploy</Tab>
      <Tab id="conf">project.conf</Tab>
      <Tab id="env">.env</Tab>
      <Tab id="npmrc">.npmrc</Tab>
    </TabList>

    <!-- ── Deploy tab ─────────────────────────────────────── -->
    <TabPanel id="deploy">
      <div class="flex flex-col gap-4 pt-4">

        <!-- Build command -->
        <div class="flex flex-col gap-1.5">
          <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">
            build command
            <span class="normal-case font-normal ml-1 opacity-70">— runs in /obstetrix-projects/_work/{name}/</span>
          </label>
          <Textarea
            bind:value={buildCmd}
            placeholder="bun install && bun run build"
            monospace
            rows={4}
          />
          <p class="text-muted-contrast text-xs">
            Use <span class="font-mono">&amp;&amp;</span> to chain commands.
            Port is available as <span class="font-mono">$PORT</span> at runtime (not during build).
          </p>
        </div>

        <!-- Template picker -->
        {#if showTemplates}
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {#each BUILD_TEMPLATES as tpl}
              <button
                onclick={() => applyTemplate(tpl.id)}
                class="text-left px-3 py-2 rounded-md border border-frame text-xs
                       text-muted-contrast hover:text-canvas-contrast hover:border-accent/50 hover:bg-secondary/50 transition-colors"
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

        <hr class="border-frame" />

        <!-- Source -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">branch</label>
            <Input bind:value={branch} placeholder="main" monospace compact />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">persistent dirs</label>
            <Input bind:value={persistentDirs} placeholder="uploads,data" monospace compact />
            <p class="text-muted-contrast text-xs">comma-separated, relative to app dir — survive all deploys</p>
          </div>
        </div>

        <hr class="border-frame" />

        <!-- Health check -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">health check URL</label>
            <Input bind:value={healthUrl} placeholder="http://127.0.0.1:$PORT/health" monospace compact />
            <p class="text-muted-contrast text-xs">must return 2xx after each instance restart</p>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">health timeout (seconds)</label>
            <Input bind:value={healthTimeout} type="integer" placeholder="60" compact />
          </div>
        </div>

        <hr class="border-frame" />

        <!-- Behaviour -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">default instances</label>
            <Input bind:value={defaultInstances} type="integer" placeholder="1" compact />
            <p class="text-muted-contrast text-xs">how many instances start on first deploy</p>
          </div>
          <div class="flex flex-col gap-3">
            <label class="text-muted-contrast text-xs font-medium uppercase tracking-wide">behaviour</label>
            <Switch bind:value={rollbackOnFail} label={{ on: 'auto-rollback on failure', off: 'no rollback on failure' }} />
            <Switch bind:value={autoDeploy} label={{ on: 'auto-deploy new commits', off: 'manual deploy only' }} />
          </div>
        </div>

        <div class="flex gap-2">
          <Button small onclick={saveDeploy} loading={saving}>
            {saving ? 'saving…' : 'save'}
          </Button>
        </div>
      </div>
    </TabPanel>

    <!-- ── Raw conf tab ───────────────────────────────────── -->
    <TabPanel id="conf">
      <div class="flex flex-col gap-3 pt-4">
        <Textarea
          bind:value={confText}
          monospace
          rows={16}
        />

        {#if showTemplates}
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {#each BUILD_TEMPLATES as tpl}
              <button
                onclick={() => applyTemplate(tpl.id)}
                class="text-left px-3 py-2 rounded-md border border-frame text-xs
                       text-muted-contrast hover:text-canvas-contrast hover:border-accent/50 hover:bg-secondary/50 transition-colors"
              >
                <div class="font-medium">{tpl.label}</div>
                <div class="opacity-70 mt-0.5 font-mono">{tpl.buildCmd.slice(0, 30)}{tpl.buildCmd.length > 30 ? '…' : ''}</div>
              </button>
            {/each}
          </div>
          <Button ghost small onclick={() => showTemplates = false}>cancel</Button>
        {:else}
          <div class="flex gap-2">
            <Button small onclick={saveConf} loading={saving}>
              {saving ? 'saving...' : 'save'}
            </Button>
            <Button ghost small onclick={() => showTemplates = true}>load template…</Button>
          </div>
        {/if}
      </div>
    </TabPanel>

    <!-- ── .env tab ───────────────────────────────────────── -->
    <TabPanel id="env">
      <div class="flex flex-col gap-3 pt-4">
        <Textarea
          bind:value={envText}
          placeholder="NODE_ENV=production&#10;DATABASE_URL=${DATABASE_URL}"
          monospace
          rows={16}
        />
        <p class="text-muted-contrast text-xs">
          Use <span class="font-mono">$&#123;VAR&#125;</span> to substitute values from
          <span class="font-mono">obstetrix.conf</span> at deploy time.
        </p>
        <div class="flex gap-2">
          <Button small onclick={saveEnv} loading={saving}>
            {saving ? 'saving...' : 'save'}
          </Button>
          <Button small secondary onclick={syncEnvNow} loading={syncing}>
            {syncing ? 'syncing...' : 'sync now'}
          </Button>
        </div>
      </div>
    </TabPanel>

    <!-- ── .npmrc tab ─────────────────────────────────────── -->
    <TabPanel id="npmrc">
      <div class="flex flex-col gap-3 pt-4">
        <Textarea
          bind:value={npmrcText}
          placeholder="frozen-lockfile=true"
          monospace
          rows={12}
        />
        <div>
          <Button small onclick={saveNpmrc} loading={saving}>
            {saving ? 'saving...' : 'save'}
          </Button>
        </div>
      </div>
    </TabPanel>
  </Tabs>

  <!-- ── Danger zone ────────────────────────────────────── -->
  <div class="border-t border-frame pt-4 flex flex-col gap-3 mt-2">
    <span class="text-muted-contrast text-xs uppercase tracking-wide">danger zone</span>
    {#if !showDelete}
      <div>
        <Button destructive small onclick={() => showDelete = true}>delete project…</Button>
      </div>
    {:else}
      <p class="text-muted-contrast text-xs">
        Stops all instances and removes config and port allocation.
        App directories are {removeData ? 'deleted' : 'kept'}.
        State files and deploy logs are always preserved.
      </p>
      <Switch bind:value={removeData} label={`remove app data (/obstetrix-projects/${name}/)`} />
      <Input
        bind:value={confirmName}
        placeholder="type project name to confirm"
        monospace
        compact
      />
      <div class="flex gap-2">
        <Button destructive small
          disabled={confirmName !== name || deleting}
          loading={deleting}
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
