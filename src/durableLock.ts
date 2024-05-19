import { DurableObject } from "cloudflare:workers";
import type { Bindings } from "hono/dist/types/types";
import type { LockInfo } from "./index";

export type LockResult = {
	status: "locked" | "unlocked" | "already_locked" | "wrong_id" | "error";
	lockInfo: LockInfo;
	error?: string;
};

export class DurableLock extends DurableObject {
	private state: DurableObjectState;
	private lockInfo: LockInfo | null;

	constructor(state: DurableObjectState, env: Bindings) {
		super(state, env);
		this.state = state;
		this.lockInfo = null;
		this.state.blockConcurrencyWhile(async () => {
			this.lockInfo = (await this.state.storage.get("_lock")) || null;
		});
	}

	/**
	 * Get the current lock info. If no lock is present, returns `null`.
	 */
	async info(): Promise<LockInfo | null> {
		return this.lockInfo;
	}

	/**
	 * Lock the state with the given lock info. If the state is already locked, returns the existing lock info.
	 */
	async lock(lockInfo: LockInfo): Promise<LockResult> {
		// Check if already locked
		if (this.lockInfo)
			return { status: "already_locked", lockInfo: this.lockInfo };

		// Store the current lock info
		await this.state.storage.put("_lock", lockInfo);
		this.lockInfo = lockInfo;
		return { status: "locked", lockInfo };
	}

	/**
	 * Unlock the state with the given lock info. If the lock info does not match the current lock info, returns an error.
	 */
	async unlock(lockInfo: LockInfo): Promise<LockResult> {
		if (!lockInfo.ID)
			return { status: "error", lockInfo, error: "ID is required" };
		if (this.lockInfo?.ID !== lockInfo.ID)
			return { status: "wrong_id", lockInfo };

		// Remove the lock
		await this.state.storage.delete("_lock");
		this.lockInfo = null;
		return { status: "unlocked", lockInfo };
	}
}
