"use client";

import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import TelegramAccountTable from "@/components/tg-mobx/account-table";
import { Spinner } from "@nextui-org/react";
import { ProvideModal } from "@/components/tg-mobx/modals/provide";
import { MessageModal } from "@/components/tg-mobx/modals/message";

const TelegramAccountManager = observer(() => {
	const telegramStore = useTelegramStore();

	useAsyncIntervalForeground(
		5000,
		async () => {
			await telegramStore.fetchClients();
			await telegramStore.fetchEnvironment();
		},
		[telegramStore]
	);

	return (
		<>
			<MessageModal />
			<ProvideModal />
			<TelegramAccountTable />
			{telegramStore.state === "pending" && <Spinner />}
		</>
	);
});

export default TelegramAccountManager;