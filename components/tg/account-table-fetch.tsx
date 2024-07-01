"use client";
import React, { useState, useCallback } from "react";
import { AccountTable } from "@/components/tg/account-table";
import { ApiService } from "@/components/api";
import { TelegramAccount } from "@/components/tg/account-table-types";
import { Spinner, Card } from "@nextui-org/react";
import { CardBody } from "@nextui-org/card";
import { useRepeatEveryForeground } from "@/components/hooks/useRepeat";
import ProvideModal from "@/components/tg/provide";

export default function AccountTableWithData() {
	const [users, setUsers] = useState<Array<TelegramAccount> | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [failedToReachServer, setFailedToReachServer] = useState(false);
	const [authenticatingUser, setAuthenticatingUser] = useState<TelegramAccount | null>(null)

	const fetchUsers = useCallback(async () => {
		if (failedToReachServer) return;

		setIsLoading(true);
		try {
			const apiService = ApiService.getInstance();
			const clients = await apiService.getClients();
			if(clients.success) {
				setUsers(clients.data);
			} else {
				console.error(`Error fetching from server: ${clients.error}`)
			}
			setFailedToReachServer(!clients.success);
		} catch (error) {
			console.error('Error fetching clients: ', error);
			setFailedToReachServer(true);
		} finally {
			setIsLoading(false);
		}
	}, [failedToReachServer]);

	useRepeatEveryForeground(
		{ interval: 1500, idle_interval: 60000, onMount: true },
		fetchUsers,
		[fetchUsers]
	);

	if (failedToReachServer) {
		return (
			<Card>
				<CardBody>Failed to reach server. Please try again later.</CardBody>
			</Card>
		);
	}

	function onProvide(user: TelegramAccount) {
		setAuthenticatingUser(user)
	}

	function onClose() {
		setAuthenticatingUser(null)
	}

	function onValueProvided(value: any) {
		// TODO: instantly update state to waiting for server and set spinner
		(async () => {
			try {
				const apiService = ApiService.getInstance();
				const submit = await apiService.submitValue(authenticatingUser?.phone!, authenticatingUser?.status.stage!, value);
				if(submit.success) {
					// should probably tell them... and maybe reopen modal?
				} else {
					console.error(`Error submitting code to server: ${submit.error}`)
					setFailedToReachServer(true);
				}
			} catch (error) {
				console.error('Error submitting code to server: ', error);
				setFailedToReachServer(true);
			}

			setAuthenticatingUser(null)
		})()
	}

	return (
		<>
			<div>
				<ProvideModal
					isOpen={authenticatingUser !== null}
					onClose={() => {onClose()}}
					onValue={(value) => {onValueProvided(value)}}
					user={authenticatingUser!}
				/>
				{users === null ? (
					<Card>
						<CardBody>Waiting for data...</CardBody>
					</Card>
				) : (
					<AccountTable users={users} onProvideClicked={onProvide} />
				)}
			</div>
			<div>
				{isLoading && <Spinner />}
			</div>
		</>
	);
}