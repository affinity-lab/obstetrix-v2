import { createClient } from "@atom-forge/tango-rpc";
const [api] = createClient("/api/tango");
export {
  api as a
};
