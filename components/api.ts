import { TelegramAccount } from "@/components/tg/account-table-types";

export type Result<T, E = string> = {
	success: true;
	data: T;
} | {
	success: false;
	error: E;
};

export class ApiService {
	private static instance: ApiService;
	private readonly baseURL: string;

	private constructor() {
		// Determine the backend base URL
		const currentProtocol = window.location.protocol;  // 'http:' or 'https:'
		const currentHostname = window.location.hostname;

		// Use https if the current protocol is https
		const protocol = currentProtocol === 'https:' ? 'https' : 'http';

		if (currentHostname === 'localhost') {
			this.baseURL = `${protocol}://localhost:8888`;
		} else {
			this.baseURL = `${protocol}://${currentHostname}`;
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
					error: data.error || 'Unknown error occurred'
				};
			}

			return {
				success: true,
				data: data as T
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	public async getClients(): Promise<Result<Array<TelegramAccount>>> {
		return this.request<Array<TelegramAccount>>('/clients');
	}

	public async submitValue(phone: string, stage: string, value: string): Promise<Result<{ message: string }>> {
		return this.request<{ message: string }>('/submitvalue', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ phone, stage, value }),
		});
	}
}