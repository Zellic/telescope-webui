import { getRoot, Instance, types } from "mobx-state-tree";
import { ITelegramAccount } from "@/components/models/telegram";

export const ModalButtonActionType = types.enumeration("ActionType", ["default", "disconnect", "add_test_account"]);
export type IModalButtonActionType = Instance<typeof ModalButtonActionType>;

export const MessageModalButton = types.model({
	key: types.string,
	label: types.string,
	color: types.maybeNull(types.enumeration("Color", [
		"default", "primary", "secondary", "success", "warning", "danger"
	])),
	actionType: ModalButtonActionType
});

export type IMessageModalButton = Instance<typeof MessageModalButton>;

export const ClientReference = types.maybeNull(types.reference(types.late(() => require('@/components/models/telegram').TelegramAccount), {
	get(identifier: string, parent: any) {
		const root = getRoot(parent);
		// @ts-ignore
		return root.clients?.find((u: any) => u.phone === identifier) || null;
	},
	set(value) {
		return value.phone;
	}
}));

export const MessageModal = types.model({
	title: types.string,
	message: types.string,
	buttons: types.array(MessageModalButton),
	client: ClientReference
});

// types.boolean = open or close arbitrarily
// ClientReference = only opened when we have a client to act upon within the component
// MessageModal = for the generalized message modal, this is typically used for simple
//                actions / simple popups that dont need their own component
export const Modals = types.model({
	addAccount: types.maybeNull(types.enumeration("AddAccountMode", ["normal", "onboarding"])),
	addAccountPhone: types.maybeNull(types.string), // used phone number to add the account ( for /onboarding )
	provide: ClientReference,
	editPassword: ClientReference,
	deleteClient: ClientReference,
	message: types.maybeNull(MessageModal)
}).actions(self => {
	function setProvideClient(client: ITelegramAccount | null) {
		self.provide = client;
	}

	function setEditPasswordClient(client: ITelegramAccount | null) {
		self.editPassword = client;
	}

	function setDeleteClient(client: ITelegramAccount | null) {
		self.deleteClient = client;
	}

	function setAddAccount(state: "normal" | "onboarding" | null) {
		self.addAccount = state;
	}

	function setAddAccountPhone(phone: string) {
		self.addAccountPhone = phone;
	}

	function setMessage(title: string, message: string, buttons: Array<IMessageModalButton>, client?: ITelegramAccount) {
		self.message = MessageModal.create({
			title,
			message,
			buttons,
			// TODO:
			// @ts-ignore, for some reason this type reference / lookup is not recognized by TS
			client: client || null
		});
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
			}],
			// TODO:
			// @ts-ignore, for some reason this type reference / lookup is not recognized by TS
			client: client || null
		});
	}

	function clearMessage() {
		self.message = null;
	}

	return {
		setProvideClient,
		setEditPasswordClient,
		setDeleteClient,
		setAddAccount,
		setAddAccountPhone,
		setMessage,
		setMessageBasic,
		clearMessage
	};
});