"use client";

import { flow, Instance, onSnapshot, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { ApiService } from "@/components/api";
import { defaultEnvironment, Environment } from "@/components/models/environment";

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
		"ErrorOccurred"
	]),
	inputRequired: types.boolean,
	error: types.maybeNull(types.string)
});

export type IAuthenticationStatus = Instance<typeof AuthenticationStatus>;
export type IAuthStage = IAuthenticationStatus["stage"];

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
	status: AuthenticationStatus
})
	.actions((self) => ({
		updateStatus(status: IAuthenticationStatus) {
			self.status = AuthenticationStatus.create(status);
		}
	}));

export type ITelegramAccount = Instance<typeof TelegramAccount>;

const ModalButtonActionType = types.enumeration("ActionType", ["default", "disconnect"]);
export type IModalButtonActionType = Instance<typeof ModalButtonActionType>;

const MessageModalButton = types.model({
	key: types.string,
	label: types.string,
	color: types.maybeNull(types.enumeration("Color", [
		"default", "primary", "secondary", "success", "warning", "danger"
	])),
	actionType: ModalButtonActionType
});

export type IMessageModalButton = Instance<typeof MessageModalButton>;

const MessageModal = types.model({
	title: types.string,
	message: types.string,
	buttons: types.array(MessageModalButton)
});

export type IMessageModal = Instance<typeof MessageModal>;

const TelegramModel = types
	.model({
		clients: types.array(TelegramAccount),
		state: types.enumeration("State", ["pending", "done", "error"]),
		environment: Environment,
		//
		message: types.maybeNull(MessageModal),
		messageClient: types.maybeNull(types.reference(TelegramAccount, {
			get(identifier: string, parent: any /* RootStore */) {
				return parent.clients.find((u: any) => u.phone === identifier);
			},
			set(value) {
				return value.phone;
			}
		})),
		//
		userApiHash: types.maybeNull(types.string),
		authenticatingClient: types.maybeNull(types.reference(TelegramAccount, {
			get(identifier: string, parent: any /* RootStore */) {
				return parent.clients.find((u: any) => u.phone === identifier);
			},
			set(value) {
				return value.phone;
			}
		}))
	})
	.actions(self => {
		const fetchClients = flow(function* () {
			// note: we don't reset the state to 'pending' as our default state is pending
			//       and we don't want to show a spinner on every client fetch (this should happen
			//       in the background)
			// self.state = 'pending'

			try {
				const apiService = ApiService.getInstance();
				const clients = yield apiService.getClients(self.userApiHash);

				if (clients.success) {
					if (clients.data.hash !== self.userApiHash) {
						self.clients = clients.data.items || [];
					}

					self.userApiHash = clients.data.hash;
					self.state = "done";
				} else {
					console.error(`Error fetching from server: ${clients.error}`);
					self.state = "error";
				}
			} catch (error) {
				console.error(`Failed to fetch clients: ${error}`);
				self.state = "error";
			}
		});

		const fetchEnvironment = flow(function* () {
			try {
				const apiService = ApiService.getInstance();
				const environment = yield apiService.environment();
				if (environment.success) {
					self.environment = environment.data;
				}
			} catch (error) {
				console.error(`Failed to fetch environment: ${error}`);
			}
		});

		function setAuthenticatingClient(client: ITelegramAccount | null) {
			self.authenticatingClient = client;
		}

		function setMessage(title: string, message: string, buttons: Array<IMessageModalButton>, client?: ITelegramAccount) {
			self.message = MessageModal.create({
				title,
				message,
				buttons
			});
			self.messageClient = client || null;
		}

		function setMessageBasic(title: string, message: string, client?: ITelegramAccount) {
			self.message = MessageModal.create({
				title,
				message,
				buttons: [{
					key: "okay",
					label: "Okay",
					color: "primary",
					actionType: "default"
				}]
			});
			self.messageClient = client || null;
		}

		function clearMessage() {
			self.message = null;
			self.messageClient = null;
		}

		return {
			fetchClients,
			fetchEnvironment,
			setAuthenticatingClient,
			setMessage,
			setMessageBasic,
			clearMessage
		};
	});

/* TODO: maybe we should look into having one root store, to contain more models... */
/*       also maybe create a UI store. its said on the mobx website this is good practice */
/*       like root data store and then root ui store and store states in those */
/*       performance wise one big store or multiple small stores is irrelevant just a design choice */
export const telegramStore = TelegramModel.create({
	clients: [],
	state: "pending",
	environment: defaultEnvironment
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
	console.log("snapshot", snapshot);
});
