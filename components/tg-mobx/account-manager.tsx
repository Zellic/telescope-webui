"use client";

import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import TelegramAccountTable from "@/components/tg-mobx/account-table";
import { useEffect } from "react";
import { Spinner } from "@nextui-org/react";

const TelegramAccountManager = observer(() => {
	const telegramStore = useTelegramStore();

	useAsyncIntervalForeground(
		5000,
		async () => {
			await telegramStore.fetchClients();
		},
		[telegramStore]
	);

	return (
		<>
			<TelegramAccountTable />
			{telegramStore.state === "pending" && <Spinner />}
		</>
	);
});

export default TelegramAccountManager;