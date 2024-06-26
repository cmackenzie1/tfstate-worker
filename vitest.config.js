import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		poolOptions: {
			singleWorker: true,
			workers: {
				wrangler: { configPath: "./wrangler.toml" },
			},
		},
	},
});
