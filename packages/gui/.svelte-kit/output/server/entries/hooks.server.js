import { h as handler } from "../chunks/tango-api.js";
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});
const API_ROUTES = {
  "/api/tango": handler
};
const handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const match = Object.keys(API_ROUTES).sort((a, b) => b.length - a.length).find((prefix) => pathname.startsWith(prefix));
  if (match) {
    const path = pathname.slice(match.length).replace(/^\//, "");
    event.params = { path };
    return API_ROUTES[match](event);
  }
  return resolve(event);
};
export {
  handle
};
