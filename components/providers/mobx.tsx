'use client';

import { telegramStore, TelegramStoreProvider } from "@/components/models/telegram";
import { ReactNode } from "react";

/* add more store providers here, if we need more */
export const MobxStoreProvider = ({children}: {children: ReactNode}) => {
	return (
		<TelegramStoreProvider value={telegramStore}>
			{children}
		</TelegramStoreProvider>
	)
}
