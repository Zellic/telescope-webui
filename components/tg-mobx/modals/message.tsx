import { observer } from "mobx-react-lite";
import BasicModal from "@/components/tg-mobx/modals/modal";
import {
	TelegramInstance,
	useTelegramStore
} from "@/components/models/telegram";
import { Button } from "@nextui-org/react";
import React from "react";
import { ApiService } from "@/components/api";
import { IModalButtonActionType } from "@/components/models/modal";

const MessageActions: Record<IModalButtonActionType, (telegramStore: TelegramInstance) => void> = {
	'default': (telegramStore: TelegramInstance) => {
		telegramStore.modals.clearMessage()
	},
	'disconnect': (telegramStore: TelegramInstance) => {
		// TODO: maybe make this update status
		const client = telegramStore.modals.message?.client;

		// clear message after getting object or else we will be searching for nothing ... lol
		telegramStore.modals.clearMessage();

		if (client) {
			ApiService.getInstance().disconnectClient(client.phone).then((result) => {
				if (result.success) {
					telegramStore.modals.setMessageBasic("Success", `Disconnected account ${client.phone}.`);
				} else {
					telegramStore.modals.setMessageBasic("Error", `Couldn't disconnect account ${client.phone}: ${result.error}`);
				}
			});
		}
	},
	'add_test_account': (telegramStore: TelegramInstance) => {
		telegramStore.modals.clearMessage();
		telegramStore.socket.addTestAccount();
	}
}

export const MessageModal = observer(() => {
	const telegramStore = useTelegramStore();
	const modals = telegramStore.modals;

	return (
		<BasicModal
			isOpen={modals.message !== null}
			onClose={() => {
				modals.clearMessage();
			}}
			header={modals.message?.title}
			body={<p>{modals.message?.message}</p>}
			footer={modals.message?.buttons.map(it => {
				return (
					<Button key={it.key} color={(it.color as any) || undefined} onPress={() => {
						MessageActions[it.actionType](telegramStore);
					}}>
						{it.label}
					</Button>
				);
			})}
		/>
	);
});