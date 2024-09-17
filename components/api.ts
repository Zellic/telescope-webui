import { ITelegramAccount } from "@/components/models/telegram";
import { IEnvironment } from "@/components/models/environment";

export type Result<T, E = string> = {
	success: true;
	data: T;
} | {
	success: false;
	error: E;
};

export interface ClientList {
	hash: string,
	items: Array<ITelegramAccount> | undefined
}

export interface MessageResult {
	message: string;
}

export class ApiService {
	private static instance: ApiService;
	private readonly baseURL: string;

	private constructor() {
		const currentProtocol = window.location.protocol;  // 'http:' or 'https:'
		const currentHostname = window.location.hostname;
		const protocol = currentProtocol === "https:" ? "https" : "http";

		// when we're running the python server and the frontend separately we'll be on localhost
		// thus the python backend is probably running on :8888
		if (currentHostname === "localhost") {
			this.baseURL = `${protocol}://localhost:8888`;
		} else {
			const port = window.location.port;

			if (port == "") {
				this.baseURL = `${protocol}://${currentHostname}`;
			} else {
				this.baseURL = `${protocol}://${currentHostname}:${port}`;
			}
		}
	}

	public static getInstance(): ApiService {
		if (!ApiService.instance) {
			ApiService.instance = new ApiService();
		}
		return ApiService.instance;
	}

	private async request<T>(endpoint: string, options?: RequestInit): Promise<Result<T>> {
		try {
			const response = await fetch(`${this.baseURL}${endpoint}`, options);
			const data = await response.json();

			if (!response.ok) {
				return {
					success: false,
					error: data.error || "Unknown error occurred"
				};
			}

			return {
				success: true,
				data: data as T
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred"
			};
		}
	}

	public async getClients(hash: string | null | undefined): Promise<Result<ClientList>> {
		if (hash)
			return this.request<ClientList>("/clients?hash=" + hash);
		return this.request<ClientList>("/clients");
	}

	public async connectClient(phone: string): Promise<Result<MessageResult>> {
		return this.request<MessageResult>("/tgconnect?phone=" + phone);
	}

	public async disconnectClient(phone: string): Promise<Result<MessageResult>> {
		return this.request<MessageResult>("/tgdisconnect?phone=" + phone);
	}

	public async deleteaccount(phone: string): Promise<Result<MessageResult>> {
		return this.request<MessageResult>("/deleteaccount?phone=" + phone);
	}

	public async setpassword(phone: string, password: string): Promise<Result<MessageResult>> {
		return this.request<{ message: string }>("/setpassword?phone=" + phone, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ password })
		});
	}

	public async submitValue(phone: string, stage: string, value: string): Promise<Result<{ message: string }>> {
		return this.request<{ message: string }>("/submitvalue", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ phone, stage, value })
		});
	}

	public async addAccount(
		phoneNumber: string,
		email: string | null,
		comment: string | null
	): Promise<Result<{ message: string }>> {
		return this.request<{ message: string }>("/addtgaccount", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				phone_number: phoneNumber,
				email,
				comment
			})
		});
	}

	public async addTestAccount(): Promise<Result<{ message: string }>> {
		return this.request<MessageResult>("/addtestaccount");
	}

	public async environment(): Promise<Result<IEnvironment>> {
		return this.request<IEnvironment>("/environment", {});
	}
}