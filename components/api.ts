import { TelegramAccount } from "@/components/tg/account-table-types";

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

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseURL}${endpoint}`, options);
		if (!response.ok) {
			console.log(response);
			throw new Error('Network response was not okay.');
		}
		return response.json();
	}

	public async getClients(): Promise<Array<TelegramAccount>> {
		// TODO: zod verify...
		return this.request<Array<TelegramAccount>>('/clients');
	}
}