# Tabs

A tab navigation system with two visual variants (`line` and `button`). Built from composable components: `Tabs`, `TabList`, `Tab`, `TabPanels`, and `TabPanel`.

## Import

```sveltehtml
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@atom-forge/ui';
```

---

## Components

| Component | Description |
|-----------|-------------|
| `Tabs` | Context provider. Tracks the active tab. |
| `TabList` | Renders the tab button row. Styled based on `variant`. |
| `Tab` | Individual tab button. |
| `TabPanels` | Wrapper for the panel area. |
| `TabPanel` | Content panel for one tab. Only rendered when its tab is active. |

---

## Tabs Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialTabId` | `string` | — | ID of the tab that is active on mount. |
| `variant` | `'line' \| 'button'` | `'line'` | Visual style. `line` = underline indicator; `button` = pill tabs on a secondary background. |
| `onTabChange` | `(id: string) => void` | — | Called whenever the active tab changes. |
| `children` | `Snippet` | — | `TabList` + `TabPanels` structure. |

---

## Tab Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Must match the corresponding `TabPanel` id. |
| `children` | `Snippet` | Tab label content. |

---

## TabPanel Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Must match the corresponding `Tab` id. |
| `children` | `Snippet` | Panel content, rendered only when this tab is active. |

---

## Usage

```sveltehtml
<Tabs initialTabId="overview">
  <TabList>
    <Tab id="overview">Overview</Tab>
    <Tab id="details">Details</Tab>
    <Tab id="history">History</Tab>
  </TabList>
  <TabPanels>
    <TabPanel id="overview">
      <p>Overview content</p>
    </TabPanel>
    <TabPanel id="details">
      <p>Details content</p>
    </TabPanel>
    <TabPanel id="history">
      <p>History content</p>
    </TabPanel>
  </TabPanels>
</Tabs>
```

### Button variant

```sveltehtml
<Tabs initialTabId="a" variant="button">
  <TabList>
    <Tab id="a">Alpha</Tab>
    <Tab id="b">Beta</Tab>
  </TabList>
  <TabPanels>
    <TabPanel id="a">Alpha panel</TabPanel>
    <TabPanel id="b">Beta panel</TabPanel>
  </TabPanels>
</Tabs>
```

### Controlled (external tab change callback)

```sveltehtml
<Tabs initialTabId="a" onTabChange={(id) => console.log('Active:', id)}>
  ...
</Tabs>
```
