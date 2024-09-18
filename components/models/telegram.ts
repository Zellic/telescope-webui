"use client";

import { flow, Instance, onSnapshot, types } from "mobx-state-tree";
import { createContext, useContext } from "react";
import { ApiService } from "@/components/api";
import { defaultEnvironment, Environment } from "@/components/models/environment";
import { Modals } from "@/components/models/modal";

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

const TelegramModel = types
	.model({
		userApiHash: types.maybeNull(types.string),
		clients: types.array(TelegramAccount),
		state: types.enumeration("State", ["pending", "done", "error"]),
		environment: Environment,
		modals: Modals,
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

		return {
			fetchClients,
			fetchEnvironment,
		};
	});

/* TODO: maybe we should look into having one root store, to contain more models... */
/*       also maybe create a UI store. its said on the mobx website this is good practice */
/*       like root data store and then root ui store and store states in those */
/*       performance wise one big store or multiple small stores is irrelevant just a design choice */
export const telegramStore = TelegramModel.create({
	clients: [],
	state: "pending",
	environment: defaultEnvironment,
	modals: {
		addAccount: false,
	},
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
