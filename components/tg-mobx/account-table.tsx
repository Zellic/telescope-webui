"use client";

import { observer } from "mobx-react-lite";
import { ITelegramAccount, useTelegramStore } from "@/components/models/telegram";
import { Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { formatPhoneNumber, stageToStatus } from "@/components/tg-mobx/utils";
import React from "react";
import { Button } from "@nextui-org/button";
import { ActionButtons } from "@/components/tg-mobx/action-buttons";

type AccountCell = { account: ITelegramAccount }

export const NameCell = observer(({ account }: AccountCell) => {
	return (
		<div className="flex flex-col">
			<p className="text-bold text-sm">{account.username ?? account.name ?? "<no username>"}</p>
			<p className="text-bold text-sm text-default-400">{formatPhoneNumber(account.phone)}</p>
			{/* Phone numbers are only 10 characters long on staging (we ignore country codes on staging) */}
			{account.phone.length === 10 &&
              <p className="text-bold text-sm text-default-400">Code: {account.phone[5].repeat(5)}</p>}
			<p className="text-bold text-sm text-default-400">{account.email}</p>
			<p className="text-bold text-sm text-default-400">{account.comment}</p>
		</div>
	);
});

const StatusCell = observer(({ account }: AccountCell) => {
	const status = stageToStatus(account);

	return (
		<Chip className="capitalize" color={status as any} size="sm" variant="flat">
			{account.status.stage}
		</Chip>
	);
});

const AuthenticationCell = observer(({ account }: AccountCell) => {
	const telegramStore = useTelegramStore();
	const status = stageToStatus(account);

	if (account.status.error !== null) {
		return <p>{account.status.error}</p>;
	}

	if (status === "success" || !account.status.inputRequired)
		return null;

	return (
		<Button isLoading={status === "warning"} onClick={() => {
			telegramStore.setAuthenticatingClient(account);
		}}>
			Provide
		</Button>
	);
});

const ActionsCell = observer(({ account }: AccountCell) => {
	return (
		<div className="relative flex items-center gap-2">
			<ActionButtons account={account} />
		</div>
	);
});

const columns = [
	{ name: "NAME", uid: "name" },
	// {name: "ROLE", uid: "role"},
	{ name: "STATUS", uid: "status" },
	{ name: "AUTHENTICATION", uid: "authentication" },
	{ name: "ACTIONS", uid: "actions" }
];

const TelegramAccountTable = observer(() => {
	const telegramStore = useTelegramStore();

	return (
		<Table aria-label="Telegram account table">
			<TableHeader columns={columns}>
				{(column) => (
					<TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
						{column.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody items={telegramStore.clients}>
				{telegramStore.clients.map((account) => (
					<TableRow key={account.phone}>
						<TableCell><NameCell account={account} /></TableCell>
						<TableCell><StatusCell account={account} /></TableCell>
						<TableCell><AuthenticationCell account={account} /></TableCell>
						<TableCell><ActionsCell account={account} /></TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
});

export default TelegramAccountTable;