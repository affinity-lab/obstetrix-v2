# Avatar Group

Renders a horizontal stack of overlapping Avatar components. When the list exceeds `max`, a `+N` overflow chip is shown. Avatars are separated by a ring matching the background color.

## Import

```sveltehtml
import { AvatarGroup } from '@atom-forge/ui';
```

---

## Props

| Prop      | Type                                                | Default | Description                                                            |
|-----------|-----------------------------------------------------|---------|------------------------------------------------------------------------|
| `avatars` | `{ name?: string; src?: string; color?: string }[]` | —       | Array of avatar data. Each entry maps directly to an Avatar component. |
| `max`     | `number`                                            | `5`     | Maximum number of visible avatars. Overflow shown as `+N`.             |
| `compact` | `boolean`                                           | `false` | h-8 w-8 per avatar.                                                    |
| `small`   | `boolean`                                           | `false` | h-6 w-6 per avatar.                                                    |
| `micro`   | `boolean`                                           | `false` | h-5 w-5 per avatar.                                                    |
| `class`   | `string`                                            | —       | Extra Tailwind classes on the wrapper.                                 |

---

## Usage

```sveltehtml
<AvatarGroup avatars={[
  { name: 'Alice Johnson' },
  { name: 'Bob Smith' },
  { name: 'Carol White' },
  { name: 'David Lee' },
  { name: 'Eve Martinez' },
  { name: 'Frank Brown' },
]} max={4}/>

<!-- With images -->
<AvatarGroup avatars={[
  { name: 'Alice', src: '/avatars/alice.jpg' },
  { name: 'Bob' },
  { name: 'Carol', src: '/avatars/carol.jpg' },
]} compact/>
```
