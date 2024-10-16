"use client";

import { flow, Instance, ISimpleType, onSnapshot, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { ApiService } from "@/components/api";
import { ClientReference, Modals } from "@/components/models/modal";
import { WebSocketStore } from "@/components/models/socket";
import { MessageRecvType, SocketRecvMessage } from "@/components/models/recv";

export const AuthenticationStatus = types.model({
	stage: types.enumeration("AuthState", [
		"ClientNotStarted",
		"WaitingOnServer",
		"PasswordRequired",
		"AuthCodeRequired",
		"EmailRequired",
		"EmailCodeRequired",
		"AuthorizationSuccess",
		"ConnectionClosed",
		"ErrorOccurred",
		"PhoneNumberRequired",
		"RegistrationRequired"
	]),
	inputRequired: types.boolean,
	error: types.maybeNull(types.string)
});

export type IAuthenticationStatus = Instance<typeof AuthenticationStatus>;
export type IAuthStage = IAuthenticationStatus["stage"];
export const Privilege = types.enumeration("Privileges", ["view", "edit_two_factor_password", "login", "manage_connection_state", "remove_account"]);
export type PrivilegeUnion = typeof Privilege extends ISimpleType<infer U> ? U : never;

export const TelegramAccount = types.model({
	name: types.maybeNull(types.string),
	username: types.maybeNull(types.string),
	email: types.maybeNull(types.string),
	comment: types.maybeNull(types.string),
	phone: types.string,
	lastCode: types.maybeNull(types.model({
		value: types.number,
		date: types.number
	})),
	status: AuthenticationStatus,
	privileges: types.array(Privilege)
})
	.actions((self) => ({
		updateStatus(status: IAuthenticationStatus) {
			self.status = AuthenticationStatus.create(status);
		}
	}));

export type ITelegramAccount = Instance<typeof TelegramAccount>;

export const Environment = types.enumeration("Environment", ["Development", "Production"]);
export type IEnvironment = Instance<typeof Environment>

const TelegramModel = types
	.model({
		// userApiHash: types.maybeNull(types.string),
		clients: types.array(TelegramAccount),
		ssoClient: ClientReference,
		ssoEmail: types.maybeNull(types.string),
		clientsState: types.enumeration("State", ["pending", "done"]),
		environment: Environment,
		modals: Modals,
		socket: WebSocketStore
	})
	.actions(self => {
		function updateFromSocket(message: SocketRecvMessage) {
			if (process.env.NEXT_PUBLIC_DEBUG_LOG)
				console.log(message);

			switch (message.type) {
				case MessageRecvType.CLIENT_START: {
					// @ts-ignore the typing below is correct
					self.clients = message.data.items || [];
					self.environment = message.data.environment;
					self.clientsState = "done";
					if (self.ssoEmail)
						self.ssoClient = self.clients.find(u => u.email === self.ssoEmail);
					break;
				}
				case MessageRecvType.SSO_START: {
					self.ssoEmail = message.data.email;
					self.ssoClient = self.clients.find(u => u.email === self.ssoEmail);
					break;
				}
				case MessageRecvType.ADD_ACCOUNT_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic(
							"Error",
							`Failed to add account: ${message.data.error}`
						);
					}
					break;
				}
				case MessageRecvType.ADD_TEST_ACCOUNT_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic("Error", `Couldn't create test account: ${message.data.error}`);
					} else {
						self.modals.setMessageBasic("Success", `Created test account.`);
					}
					break;
				}
				case MessageRecvType.SUBMIT_VALUE_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						console.error(`SUBMIT_VALUE_RESPONSE: ${message.data.error}`);
					}
					break;
				}
				case MessageRecvType.DELETE_ACCOUNT_RESPONSE: {
					self.modals.setDeleteClient(null);
					self.socket.responseStatus = "received";

					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic(
							"Error",
							`Failed to delete account: ${message.data.error}`
						);
					}

					break;
				}
				case MessageRecvType.CONNECT_CLIENT_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic("Error", `Couldn't connect account: ${message.data.error}`);
					} else {
						self.modals.setMessageBasic("Success", `Connected account.`);
					}
					break;
				}
				case MessageRecvType.DISCONNECT_CLIENT_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic("Error", `Couldn't disconnect account: ${message.data.error}`);
					} else {
						self.modals.setMessageBasic("Success", `Disconnected account.`);
					}
					break;
				}
				case MessageRecvType.SET_PASSWORD_RESPONSE: {
					self.socket.responseStatus = "received";
					if (message.data.status === "ERROR") {
						self.modals.setMessageBasic(
							"Error",
							`Failed to edit account password for: ${message.data.error}`
						);
					}
					break;
				}
			}
		}

		// NOTE: DO NOT USE THIS. This is used to test the view under different client states.
		function setMockStage(s: IAuthStage) {
			if (self.ssoClient) {
				self.ssoClient.status.stage = s;
			}
		}

		return {
			updateFromSocket,
			setMockStage
		};
	});

/* TODO: maybe we should look into having one root store, to contain more models... */
/*       also maybe create a UI store. its said on the mobx website this is good practice */
/*       like root data store and then root ui store and store states in those */
/*       performance wise one big store or multiple small stores is irrelevant just a design choice */
export const telegramStore = TelegramModel.create({
	clients: [],
	clientsState: "pending",
	environment: "Production",
	modals: {},
	socket: {
		socketState: "connecting",
		responseStatus: "received"
	}
});

export type TelegramInstance = Instance<typeof TelegramModel>;
const TelegramStoreContext = createContext<null | TelegramInstance>(null);

export const TelegramStoreProvider = TelegramStoreContext.Provider;

export function useTelegramStore() {
	const store = useContext(TelegramStoreContext);
	if (store === null) {
		throw new Error("Store cannot be null, please add a context provider");
	}
	return store;
}

onSnapshot(telegramStore, (snapshot) => {
	if (process.env.NEXT_PUBLIC_DEBUG_LOG)
		console.log("snapshot", snapshot);
});
