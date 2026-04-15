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
		client: {start:"_app/immutable/entry/start.Dd3h3SFm.js",app:"_app/immutable/entry/app.D24lJbPM.js",imports:["_app/immutable/entry/start.Dd3h3SFm.js","_app/immutable/chunks/BdEY9UWb.js","_app/immutable/chunks/CUwUpJBf.js","_app/immutable/entry/app.D24lJbPM.js","_app/immutable/chunks/CUwUpJBf.js","_app/immutable/chunks/WKV7vUDn.js","_app/immutable/chunks/Dr3dSFlc.js","_app/immutable/chunks/BIL3r2Rt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-DRQ1RI_l.js')),
			__memo(() => import('./chunks/1-BF9fGy-1.js')),
			__memo(() => import('./chunks/2-C2SX2S7D.js')),
			__memo(() => import('./chunks/3-8KctrUb0.js')),
			__memo(() => import('./chunks/4-DM_IBGNy.js')),
			__memo(() => import('./chunks/5-CjdqWfpK.js')),
			__memo(() => import('./chunks/6-65Wj7E5w.js')),
			__memo(() => import('./chunks/7-2ShNrOni.js')),
			__memo(() => import('./chunks/8-CmN8ixEt.js')),
			__memo(() => import('./chunks/9-CYkzn7c3.js')),
			__memo(() => import('./chunks/10-BegvG3Km.js')),
			__memo(() => import('./chunks/11-BTClG0AI.js')),
			__memo(() => import('./chunks/12-Cfv4F9G2.js')),
			__memo(() => import('./chunks/13-C5jEuXSX.js')),
			__memo(() => import('./chunks/14-CAy4jrq_.js'))
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
