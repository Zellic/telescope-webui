"use client";

import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import TelegramAccountTable from "@/components/tg-mobx/account-table";
import { Spinner } from "@nextui-org/react";
import { Modals } from "@/components/tg-mobx/modals/modals";
import { Button } from "@nextui-org/button";
import React, { useEffect } from "react";
import { Card, CardBody } from "@nextui-org/card";
import { ApiService } from "@/components/api";


const TelegramAccountManager = observer(() => {
	const telegramStore = useTelegramStore();

	useEffect(() => {
		const socket_url = ApiService.getInstance().wsURL + "/socket";
		telegramStore.socket.connect(socket_url);

		return () => {
			telegramStore.socket.disconnect();
		};
	}, [])

	if (telegramStore.socket.socketState === 'error') {
		return (
			<Card>
				<CardBody>Failed to reach server. Please try again later.</CardBody>
			</Card>
		)
	}

	return (
		<>
			<div className="flex flex-col gap-4">
				<Modals />

				<div className="flex ml-auto gap-4 justify-between">
					<Button size="sm" onClick={() => {
						telegramStore.modals.setAddAccount("normal");
					}}>Add Account</Button>

					{telegramStore.environment == "Staging" &&
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
				{telegramStore.clientsState === "pending" && <Spinner />}
			</div>
		</>
	);
});

export default TelegramAccountManager;