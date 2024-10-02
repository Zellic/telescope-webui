"use client";

import React, { Suspense, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AddAccountModal } from "@/components/tg-mobx/modals/add-account";
import { Button } from "@nextui-org/button";
import { useTelegramStore } from "@/components/models/telegram";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import { MessageModal } from "@/components/tg-mobx/modals/message";
import TelegramAccountTable, { AuthenticationCell, NameCell, StatusCell } from "@/components/tg-mobx/account-table";
import { ProvideModal } from "@/components/tg-mobx/modals/provide";
import { redirect, useSearchParams } from "next/navigation";
import { Card, CardBody } from "@nextui-org/card";
import { GetCFEmail } from "@/app/onboarding/actions";

const Onboarding = observer(() => {
	const telegramStore = useTelegramStore();
	const searchParams = useSearchParams();

	useAsyncIntervalForeground(
		2500, // update a bit faster for one person
		async () => {
			// this should only display the client we have view permissions upon (CF SSO)
			await telegramStore.fetchClients();
			telegramStore.updateCfClient();
		},
		[telegramStore]
	);

	if (telegramStore.cfClient?.status.stage === "AuthorizationSuccess") {
		const url = searchParams.get("redirect");
		if (url) {
			redirect(url);
		}
	}

	if (telegramStore.clientsState === "error") {
		return (
			<Card>
				<CardBody>Failed to reach server. Please try again later.</CardBody>
			</Card>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center">
			<AddAccountModal />
			<MessageModal />
			<ProvideModal />

			<div className="text-center mb-4">
				<h1 className="text-4xl font-bold mb-4">Telescope Onboarding</h1>
				{!telegramStore.cfClient &&
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
			{telegramStore.cfClient && telegramStore.cfClient.status.stage !== "AuthorizationSuccess" &&
              <div className="flex flex-col items-center">
                <p className={"text-large mb-8 text-center"}>Click provide to begin authorization of your Telegram
                  account.</p>
                <Card className={"max-w-[400px] min-w-[300px] p-2"}>
                  <CardBody className={"flex flex-row items-start justify-center"}>
                    <div className={"flex flex-col"}>
                      <NameCell account={telegramStore.cfClient} />
                      <div className={"mt-2"}>
                        <StatusCell account={telegramStore.cfClient} />
                      </div>
                    </div>
                    <div className={"flex items-center mt-4"}>
                      <AuthenticationCell account={telegramStore.cfClient} />
                    </div>
                  </CardBody>
                </Card>
              </div>
			}
			{telegramStore.cfClient && telegramStore.cfClient.status.stage === "AuthorizationSuccess" &&
              <Card className={"max-w-[500px]"} fullWidth={true}>
                <CardBody>
                  <h1>You have already been onboarded :)</h1>
                </CardBody>
              </Card>
			}
		</div>
	);
});

const OnboardingSuspense = observer(() => {
	return (
		<Suspense>
			<Onboarding />
		</Suspense>
	);
});

export default OnboardingSuspense;
