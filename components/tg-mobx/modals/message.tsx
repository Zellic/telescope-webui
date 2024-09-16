import { observer } from "mobx-react-lite";
import BasicModal from "@/components/modal";
import {
	IModalButtonActionType,
	TelegramInstance,
	telegramStore,
	useTelegramStore
} from "@/components/models/telegram";
import { Button } from "@nextui-org/react";
import React from "react";
import { ApiService } from "@/components/api";

const MessageActions: Record<IModalButtonActionType, (telegramStore: TelegramInstance) => void> = {
	'default': (telegramStore: TelegramInstance) => {
		telegramStore.clearMessage()
	},
	'disconnect': (telegramStore: TelegramInstance) => {
		const client = telegramStore.messageClient;

		// clear message after getting object or else we will be searching for nothing ... lol
		telegramStore.clearMessage();

		if (client) {
			ApiService.getInstance().disconnectClient(client.phone).then((result) => {
				if (result.success) {
					telegramStore.setMessageBasic("Success", `Disconnected account ${client.phone}.`);
				} else {
					telegramStore.setMessageBasic("Error", `Couldn't disconnect account ${client.phone}: ${result.error}`);
				}
			});
		}
	},
}

export const MessageModal = observer(() => {
	const telegramStore = useTelegramStore();

	return (
		<BasicModal
			isOpen={telegramStore.message !== null}
			onClose={() => {
				telegramStore.clearMessage()
			}}
			header={telegramStore.message?.title}
			body={<p>{telegramStore.message?.message}</p>}
			footer={telegramStore.message?.buttons.map(it => {
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