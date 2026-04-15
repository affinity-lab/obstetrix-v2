const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.DreXR4bF.js",app:"_app/immutable/entry/app.BR3152Mc.js",imports:["_app/immutable/entry/start.DreXR4bF.js","_app/immutable/chunks/B7-vS7SU.js","_app/immutable/chunks/BVwrKYFG.js","_app/immutable/entry/app.BR3152Mc.js","_app/immutable/chunks/BVwrKYFG.js","_app/immutable/chunks/BhxVAyZt.js","_app/immutable/chunks/AYkmf9zX.js","_app/immutable/chunks/BmkMrBLf.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DOvTeXNG.js')),
			__memo(() => import('./chunks/1-eJ1H19xw.js')),
			__memo(() => import('./chunks/2-DHz7ovpl.js')),
			__memo(() => import('./chunks/3-D8xyHLDa.js')),
			__memo(() => import('./chunks/4-BdUmoSyn.js')),
			__memo(() => import('./chunks/5-Da3kPB5L.js')),
			__memo(() => import('./chunks/6-CIj1swQv.js')),
			__memo(() => import('./chunks/7-Bh_DwuBu.js')),
			__memo(() => import('./chunks/8-BQSYueq2.js')),
			__memo(() => import('./chunks/9-CNSPuiS-.js')),
			__memo(() => import('./chunks/10-C0XPe_Cs.js')),
			__memo(() => import('./chunks/11-BTevGX2M.js')),
			__memo(() => import('./chunks/12-Clxk9rEx.js')),
			__memo(() => import('./chunks/13-CmlYFkpz.js')),
			__memo(() => import('./chunks/14-D4wB9rk6.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/backup/download",
				pattern: /^\/api\/backup\/download\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-C26YTo7W.js'))
			},
			{
				id: "/api/events",
				pattern: /^\/api\/events\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-6I7V5fM3.js'))
			},
			{
				id: "/api/logs/[project]",
				pattern: /^\/api\/logs\/([^/]+?)\/?$/,
				params: [{"name":"project","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-Bfs_6YFs.js'))
			},
			{
				id: "/api/tango",
				pattern: /^\/api\/tango\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-sG5bNoK-.js'))
			},
			{
				id: "/backups",
				pattern: /^\/backups\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/backups/[name]",
				pattern: /^\/backups\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/project/[name]",
				pattern: /^\/project\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/project/[name]/deploys",
				pattern: /^\/project\/([^/]+?)\/deploys\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/project/[name]/deploys/[deployId]",
				pattern: /^\/project\/([^/]+?)\/deploys\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false},{"name":"deployId","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/project/[name]/journal",
				pattern: /^\/project\/([^/]+?)\/journal\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/project/[name]/logs",
				pattern: /^\/project\/([^/]+?)\/logs\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/settings/nginx",
				pattern: /^\/settings\/nginx\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/settings/nginx/[site]",
				pattern: /^\/settings\/nginx\/([^/]+?)\/?$/,
				params: [{"name":"site","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/settings/project/[name]",
				pattern: /^\/settings\/project\/([^/]+?)\/?$/,
				params: [{"name":"name","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/settings/secrets",
				pattern: /^\/settings\/secrets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map
