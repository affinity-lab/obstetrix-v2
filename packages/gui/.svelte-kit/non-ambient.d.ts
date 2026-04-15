
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api" | "/api/backup" | "/api/backup/download" | "/api/events" | "/api/logs" | "/api/logs/[project]" | "/api/tango" | "/backups" | "/backups/[name]" | "/project" | "/project/[name]" | "/project/[name]/deploys" | "/project/[name]/deploys/[deployId]" | "/project/[name]/journal" | "/project/[name]/logs" | "/settings" | "/settings/nginx" | "/settings/nginx/[site]" | "/settings/project" | "/settings/project/[name]" | "/settings/secrets";
		RouteParams(): {
			"/api/logs/[project]": { project: string };
			"/backups/[name]": { name: string };
			"/project/[name]": { name: string };
			"/project/[name]/deploys": { name: string };
			"/project/[name]/deploys/[deployId]": { name: string; deployId: string };
			"/project/[name]/journal": { name: string };
			"/project/[name]/logs": { name: string };
			"/settings/nginx/[site]": { site: string };
			"/settings/project/[name]": { name: string }
		};
		LayoutParams(): {
			"/": { project?: string; name?: string; deployId?: string; site?: string };
			"/api": { project?: string };
			"/api/backup": Record<string, never>;
			"/api/backup/download": Record<string, never>;
			"/api/events": Record<string, never>;
			"/api/logs": { project?: string };
			"/api/logs/[project]": { project: string };
			"/api/tango": Record<string, never>;
			"/backups": { name?: string };
			"/backups/[name]": { name: string };
			"/project": { name?: string; deployId?: string };
			"/project/[name]": { name: string; deployId?: string };
			"/project/[name]/deploys": { name: string; deployId?: string };
			"/project/[name]/deploys/[deployId]": { name: string; deployId: string };
			"/project/[name]/journal": { name: string };
			"/project/[name]/logs": { name: string };
			"/settings": { site?: string; name?: string };
			"/settings/nginx": { site?: string };
			"/settings/nginx/[site]": { site: string };
			"/settings/project": { name?: string };
			"/settings/project/[name]": { name: string };
			"/settings/secrets": Record<string, never>
		};
		Pathname(): "/" | "/api/backup/download" | "/api/events" | `/api/logs/${string}` & {} | "/api/tango" | "/backups" | `/backups/${string}` & {} | `/project/${string}` & {} | `/project/${string}/deploys` & {} | `/project/${string}/deploys/${string}` & {} | `/project/${string}/journal` & {} | `/project/${string}/logs` & {} | "/settings" | "/settings/nginx" | `/settings/nginx/${string}` & {} | `/settings/project/${string}` & {} | "/settings/secrets";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | string & {};
	}
}