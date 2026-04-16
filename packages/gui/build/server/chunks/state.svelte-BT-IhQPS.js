import { n as noop } from './renderer-Dl7nK692.js';
import './root-BkPoLMvS.js';

const is_legacy = noop.toString().includes("$$") || /function \w+\(\) \{\}/.test(noop.toString());
const placeholder_url = "a:";
if (is_legacy) {
  ({
    url: new URL(placeholder_url)
  });
}
//# sourceMappingURL=state.svelte-BT-IhQPS.js.map
