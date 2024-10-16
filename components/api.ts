import { ITelegramAccount } from "@/components/models/telegram";

export type Result<T, E = string> = {
	success: true;
	data: T;
} | {
	success: false;
	error: E;
};

export interface ClientList {
	hash: string,
	environment: string,
	items: Array<ITelegramAccount> | undefined
}

export interface MessageResult {
	message: string;
}

export class ApiService {
	private static instance: ApiService;
	public readonly baseURL: string;
	public readonly wsURL: string;

	private constructor() {
		const currentProtocol = window.location.protocol;
		const currentHostname = window.location.hostname;
		const protocol = currentProtocol === "https:" ? "https" : "http";
		const protocolWS = currentProtocol === "https:" ? "wss" : "ws";

		// when we're running the python server and the frontend separately we'll be on localhost
		// thus the python backend is probably running on :8888
		if (currentHostname === "localhost") {
			this.baseURL = `${protocol}://localhost:8888`;
			this.wsURL = `${protocolWS}://localhost:8888`;
		} else {``
			const port = window.location.port;

			if (port == "") {
				this.baseURL = `${protocol}://${currentHostname}`;
				this.wsURL = `${protocolWS}://${currentHostname}`;
			} else {``
				this.baseURL = `${protocol}://${currentHostname}:${port}`;
				this.wsURL = `${protocolWS}://${currentHostname}:${port}`;
			}``
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

}