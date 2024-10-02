import { IEnvironment, ITelegramAccount } from "@/components/models/telegram";
import { getRoot, types } from "mobx-state-tree";

export enum MessageType {
	CLIENT_START = "CLIENT_START",
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

export const WebSocketStore = types
	.model({
		socketState: types.enumeration(["connecting", "open", "closed", "error"])
	})
	.volatile((self) => ({
		socket: null as WebSocket | null
	}))
	.actions((self) => ({
		setState(state: "connecting" | "open" | "closed" | "error")  {
			self.socketState = state;
		},

		connect(url: string) {
			if (self.socket) {
				self.socket.close();
			}

			this.setState("connecting")
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
				if (message.hasOwnProperty('type')) {
					// @ts-ignore: dont want to include the type (circular)
					getRoot(self).updateFromSocket(message);
				} else {
					console.error("WebSocket data must contain an `id` field")
				}
			};
		},

		sendMessage(data: any) {
			if (self.socket && self.socket.readyState === WebSocket.OPEN) {
				self.socket.send(JSON.stringify(data));
			} else {
				console.error(`Failed to send message: WebSocket is closed`);
			}
		},

		disconnect() {
			if (self.socket) {
				self.socket.close();
				self.socket = null;
				self.socketState = "closed";
			}
		}
	}));