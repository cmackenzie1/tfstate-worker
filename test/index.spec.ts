import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

import "../src"; // Currently required to automatically rerun tests when `main` changes

describe("Echo worker", () => {
	it("responds with 200 OK", async () => {
		const response = await SELF.fetch("https://example.com/health");
		const body = await response.text();
		expect(response.status).toBe(200);
	});
});
