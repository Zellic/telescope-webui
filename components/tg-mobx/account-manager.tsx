"use client";

import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import TelegramAccountTable from "@/components/tg-mobx/account-table";
import { Spinner } from "@nextui-org/react";
import { Modals } from "@/components/tg-mobx/modals/modals";
import { Button } from "@nextui-org/button";
import React from "react";


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
			<div className="flex flex-col gap-4">
				<Modals />

				<div className="flex ml-auto gap-4 justify-between">
					<Button size="sm" onClick={() => {
						telegramStore.modals.setAddAccount(true);
					}}>Add Account</Button>

					{telegramStore.environment.staging &&
                      <Button size="sm" onClick={() => {
						  telegramStore.modals.setMessage("Add Test Account", "Really add test acccount?", [
							  {
								  key: "yes",
								  label: "Yes",
								  color: "success",
								  actionType: "add_test_account"
							  },
							  {
								  key: "cancel",
								  label: "Cancel",
								  color: "default",
								  actionType: "default"
							  }
						  ]);
					  }}>Add Test Account</Button>
					}
				</div>

				<TelegramAccountTable />
				{telegramStore.state === "pending" && <Spinner />}
			</div>
		</>
	);
});

export default TelegramAccountManager;