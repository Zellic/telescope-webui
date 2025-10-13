import { getRoot, types } from "mobx-state-tree";
import { MessageSendType, SocketSendMessage } from "@/components/models/send";
import { ApiService } from "@/components/api";

export const WebSocketStore = types
	.model({
		socketState: types.enumeration(["connecting", "open", "closed", "error"]),
		responseStatus: types.enumeration(["waiting", "received"])
	})
	.volatile((self) => ({
		socket: null as WebSocket | null
	}))
	.actions((self) => ({
		setState(state: "connecting" | "open" | "closed" | "error") {
			self.socketState = state;
		},

		// NOTE: WHEN RUNNING IN DEV REACTSTRICTMODE IS DEFAULT ON AND
		//       WILL CAUSE THE ERROR STATE TO ALWAYS FLICKER ON LOAD
		//       ONERROR->ONCLOSED->ONOPEN
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

		addAccount(phone: string,
		           email: string | null,
		           comment: string | null) {
			this.sendMessage({
				type: MessageSendType.ADD_ACCOUNT,
				data: {
					phone,
					email,
					comment,
				}
			});
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

		deleteAccount(phone: string) {
			this.sendMessage({
				type: MessageSendType.DELETE_ACCOUNT,
				data: {
					phone
				}
			});
		},

		disconnectClient(phone: string) {
			this.sendMessage({
				type: MessageSendType.DISCONNECT_CLIENT,
				data: {
					phone
				}
			});
		},

		terminateOtherSessions(phone: string) {
			this.sendMessage({
				type: MessageSendType.TERMINATE_OTHER_SESSIONS,
				data: {
					phone
				}
			});
		},

		connectClient(phone: string) {
			this.sendMessage({
				type: MessageSendType.CONNECT_CLIENT,
				data: {
					phone
				}
			});
		},

		setPassword(phone: string, password: string) {
			this.sendMessage({
				type: MessageSendType.SET_PASSWORD,
				data: {
					phone,
					password
				}
			})
		},

		getPassword(phone: string) {
			// @ts-ignore: dont want to include the type (circular)
			getRoot(self).modals.setViewPasswordState('waiting');
			this.sendMessage({
				type: MessageSendType.GET_PASSWORD,
				data: {
					phone
				}
			})
		},

		approveExportRequest(phone: string) {
			this.sendMessage({
				type: MessageSendType.APPROVE_EXPORT_REQUEST,
				data: {
					phone
				}
			})
		},

		// note: we dont set this always within here, because we dont always need to 'wait' on a response
		// this should be done per use within the component if you want a waiting state.
		setWaiting() {
			self.responseStatus = "waiting";
		},

		// note: on the flipside of this we always want to know if we received a response
		// this should not be called by ANY components. only the socket callback should update this
		setReceived() {
			self.responseStatus = "received";
		},

		disconnect() {
			if (self.socket) {
				self.socket.close();
				self.socket = null;
				self.socketState = "closed";
			}
		}
	}));