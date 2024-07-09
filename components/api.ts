import { TelegramAccount } from "@/components/tg/account-table-types";

export type Result<T, E = string> = {
	success: true;
	data: T;
} | {
	success: false;
	error: E;
};

export interface ClientList {
	hash: string,
	items: Array<TelegramAccount> | undefined
}

export class ApiService {
	private static instance: ApiService;
	private readonly baseURL: string;

	private constructor() {
		const currentProtocol = window.location.protocol;  // 'http:' or 'https:'
		const currentHostname = window.location.hostname;
		const protocol = currentProtocol === 'https:' ? 'https' : 'http';
		console.log({
			currentProtocol,
			currentHostname,
			protocol,
		})

		if (currentHostname === 'localhost') {
			console.log('a')
			this.baseURL = `${protocol}://localhost:8888`;
		} else {
			const port = window.location.port;

			console.log({port})

			if(port == '') {
				console.log('b')
				this.baseURL = `${protocol}://${currentHostname}`;
			} else {
				console.log('c')
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

	public async getClients(hash: string | null | undefined): Promise<Result<ClientList>> {
		if(hash)
			return this.request<ClientList>('/clients?hash=' + hash);
		return this.request<ClientList>('/clients');
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

	public async addAccount(
		phoneNumber: string,
		email: string | null,
		comment: string | null
	): Promise<Result<{ message: string }>> {
		return this.request<{ message: string }>('/addtgaccount', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				phone_number: phoneNumber,
				email,
				comment
			}),
		});
	}
}