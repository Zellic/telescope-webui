"use client";
import React, { useCallback, useEffect, useState } from "react";
import { AccountTable, } from "@/components/tg/account-table";
import { ApiService } from "@/components/api";
import { TelegramAccount } from "@/components/tg/account-table-types";

export default function AccountTableWithData() {
	const [users, setUsers] = useState<Array<TelegramAccount> | null>(null)
	useEffect(() => {
		const apiService = ApiService.getInstance();

		async function fetchy() {
			try {
				const clients = await apiService.getClients();
				setUsers(clients);
			} catch (error) {
				console.error('Error fetching clients:', error);
			}
		}

		// noinspection JSIgnoredPromiseFromCall
		fetchy()
	}, []);

	if(users === null)
		return (
			<div>Fetching accounts...</div>
		)

	return (
		<AccountTable users={users} />
	);
}
