"use client";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { AddAccountModal } from "@/components/tg-mobx/modals/add-account";
import { Button } from "@nextui-org/button";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import { MessageModal } from "@/components/tg-mobx/modals/message";
import TelegramAccountTable from "@/components/tg-mobx/account-table";
import { ProvideModal } from "@/components/tg-mobx/modals/provide";
import { redirect, useSearchParams } from "next/navigation";

const Onboarding = observer(() => {
	const telegramStore = useTelegramStore();
	const searchParams = useSearchParams()

	useAsyncIntervalForeground(
		2500, // update a bit faster for one person
		async () => {
			if (telegramStore.modals.addAccountPhone) {
				await telegramStore.fetchClient(telegramStore.modals.addAccountPhone);
			}
		},
		[telegramStore]
	);

	if (telegramStore.clients.length > 0 && telegramStore.clients[0].status.stage === 'AuthorizationSuccess') {
		const url = searchParams.get("redirect")
		if (url) {
			redirect(url);
		}
	}

	return (
		<div className="flex flex-col items-center justify-center">
			<AddAccountModal />
			<MessageModal />
			<ProvideModal />

			<div className="text-center mb-4">
				<h1 className="text-4xl font-bold mb-4">Telescope Onboarding</h1>
				{telegramStore.clients.length === 0 &&
                  <Button
                    size="lg"
                    color={"primary"}
                    className={"max-w-xl w-max"}
                    onClick={() => {
						telegramStore.modals.setAddAccount("onboarding");
					}}
                  >
                    Begin
                  </Button>
				}
			</div>
			{telegramStore.clients.length > 0 &&
              <TelegramAccountTable onboarding={true} />
			}
		</div>
	);
});

export default Onboarding;