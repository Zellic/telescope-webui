import { IEnvironment, ITelegramAccount } from "@/components/models/telegram";
import { getRoot, types } from "mobx-state-tree";

export enum MessageRecvType {
	CLIENT_START = "CLIENT_START",
	ADD_TEST_ACCOUNT_RESPONSE = "ADD_TEST_ACCOUNT_RESPONSE",
	SUBMIT_VALUE_RESPONSE = "SUBMIT_VALUE_RESPONSE"
}

export interface ClientStart {
	type: MessageRecvType.CLIENT_START;
	data: {
		hash: string;
		environment: IEnvironment;
		items: Array<ITelegramAccount> | undefined
	};
}

export interface GenericResponse {
	data: {
		status: "OK" | "ERROR",
		error: null | string;
	};
}

export type AddTestAccountResponse = {
	type: MessageRecvType.ADD_TEST_ACCOUNT_RESPONSE;
} & GenericResponse;

export type SubmitValueResponse = {
	type: MessageRecvType.SUBMIT_VALUE_RESPONSE;
} & GenericResponse;

export type SocketRecvMessage = ClientStart | AddTestAccountResponse | SubmitValueResponse;

export enum MessageSendType {
	ADD_TEST_ACCOUNT = "ADD_TEST_ACCOUNT",
	SUBMIT_VALUE = "SUBMIT_VALUE",
}

export interface AddTestAccount {
	type: MessageSendType.ADD_TEST_ACCOUNT;
}

export interface SubmitValue {
	type: MessageSendType.SUBMIT_VALUE;
	data: {
		phone: string;
		stage: string;
		value: string;
	};
}

export type SocketSendMessage = AddTestAccount | SubmitValue;

export const WebSocketStore = types
	.model({
		socketState: types.enumeration(["connecting", "open", "closed", "error"])
	})
	.volatile((self) => ({
		socket: null as WebSocket | null
	}))
	.actions((self) => ({
		setState(state: "connecting" | "open" | "closed" | "error") {
			self.socketState = state;
		},

		connect(url: string) {
			if (self.socket) {
				self.socket.close();
			}

			this.setState("connecting");
			self.socket = new WebSocket(url);

			self.socket.onopen = () => {
				this.setState("open");
			};

			self.socket.onclose = () => {
				this.setState("closed");
			};

			self.socket.onerror = (error) => {
				this.setState("error");
			};

			self.socket.onmessage = (event) => {
				const message = JSON.parse(event.data);
				if (message.hasOwnProperty("type")) {
					// @ts-ignore: dont want to include the type (circular)
					getRoot(self).updateFromSocket(message);
				} else {
					console.error("WebSocket data must contain an `id` field");
				}
			};
		},

		sendMessage(data: SocketSendMessage) {
			if (self.socket && self.socket.readyState === WebSocket.OPEN) {
				self.socket.send(JSON.stringify(data));
			} else {
				console.error(`Failed to send message: WebSocket is closed`);
			}
		},

		addTestAccount() {
			this.sendMessage({
				type: MessageSendType.ADD_TEST_ACCOUNT
			});
		},

		submitValue(phone: string, stage: string, value: string) {
			this.sendMessage({
				type: MessageSendType.SUBMIT_VALUE,
				data: {
					phone,
					stage,
					value
				}
			});
		},

		disconnect() {
			if (self.socket) {
				self.socket.close();
				self.socket = null;
				self.socketState = "closed";
			}
		}
	}));