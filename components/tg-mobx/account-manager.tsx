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


const TelegramAccountManager = observer(() => {
	const telegramStore = useTelegramStore();

	// useAsyncIntervalForeground(
	// 	5000,
	// 	async () => {
	// 		if (telegramStore.state !== 'error') {
	// 			await telegramStore.fetchClients();
	// 		}
	// 	},
	// 	[telegramStore]
	// );

	useEffect(() => {
		const socket = new WebSocket('ws://localhost:8888/socket');

		socket.onopen = () => {};
		socket.onclose = () => {};

		socket.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				if (message.hasOwnProperty('type')) {
					telegramStore.updateFromSocket(message);
				} else {
					console.error("WebSocket data must contain an `id` field")
				}
			} catch (e) {
				console.error(`WebSocket received invalid JSON: ${e}`)
			}
		};

		return () => {
			socket.close();
		};
	}, [])

	if (telegramStore.state === 'error') {
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
				{telegramStore.state === "pending" && <Spinner />}
			</div>
		</>
	);
});

export default TelegramAccountManager;