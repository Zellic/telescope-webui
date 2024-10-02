import { IEnvironment, ITelegramAccount } from "@/components/models/telegram";

export enum MessageType {
	CLIENT_START = 'CLIENT_START',
}

export interface ClientStartMessage {
	type: MessageType.CLIENT_START;
	data: {
		hash: string;
		environment: IEnvironment;
		items: Array<ITelegramAccount> | undefined
	};
}

export type SocketMessage = ClientStartMessage /* | MORE TYPES>.. */;
