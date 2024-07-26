"use client";
import React, { useState, useCallback, useRef } from "react";
import { AccountTable } from "@/components/tg/account-table";
import { ApiService } from "@/components/api";
import { TelegramAccount } from "@/components/tg/account-table-types";
import { Spinner, Card, Tooltip } from "@nextui-org/react";
import { CardBody } from "@nextui-org/card";
import { useAsyncIntervalForeground } from "@/components/hooks/useRepeat";
import ProvideModal from "@/components/tg/provide";
import { Button } from "@nextui-org/button";
import AddAccountDialog, { AddAcountResult } from "@/components/tg/addaccount";
import MessageModal, { MessageModalButton, MessageModalProps } from "@/components/messagebox";
import { DeleteIcon, EllipsisIcon, EyeIcon } from "@nextui-org/shared-icons";
import { getElapsedTime } from "@/components/time";

enum AddAccountModalState {
	CLOSED,
	OPEN,
	SUBMITTING,
}

export default function AccountTableWithData() {
	const [users, setUsers] = useState<Array<TelegramAccount> | null>(null);
	const userApiHash = useRef<string | null>(null)

	const [isLoading, setIsLoading] = useState(false);
	const [failedToReachServer, setFailedToReachServer] = useState(false);

	const [authenticatingUser, setAuthenticatingUser] = useState<TelegramAccount | null>(null)
	const [submitting, setSubmitting] = useState<boolean>(false)
	const [provideValue, setProvideValue] = useState("")

	const [addAccountModalState, setAddAccountModalState] = useState(AddAccountModalState.CLOSED)

	const [message, setMessage] = useState<Omit<MessageModalProps, 'isOpen'> | null>(null)

	const fetchUsers = useCallback(async () => {
		if (failedToReachServer) return;

		setIsLoading(true);
		try {
			const apiService = ApiService.getInstance();
			const clients = await apiService.getClients(userApiHash.current);
			if(clients.success) {
				if(clients.data.hash !== userApiHash.current)
					setUsers(clients.data.items!);
				userApiHash.current = clients.data.hash
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

	useAsyncIntervalForeground(
		5000,
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
		(async () => {
			try {
				const apiService = ApiService.getInstance();
				setSubmitting(true)
				const stage = authenticatingUser?.status.stage!
				const submit = await apiService.submitValue(authenticatingUser?.phone!, authenticatingUser?.status.stage!, value);
				await new Promise(r => setTimeout(r, 2000));
				setSubmitting(false)

				if(submit.success) {
					if(users === null || authenticatingUser === null) // shouldn't be possible...
						return

					const updatedUsers = users.map(user => {
						if (user.phone === authenticatingUser.phone && user.status.stage === stage) {
							return {
								...user,
								status: {
									...user.status,
									inputRequired: false,
								}
							};
						}
						return user;
					});
					setUsers(updatedUsers);
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

	async function onAddAccountSubmit(value: AddAcountResult) {
		setAddAccountModalState(AddAccountModalState.SUBMITTING)
		const result = await ApiService.getInstance().addAccount(value.phone, value.email, value.comment);

		if(!result.success) {
			setMessageBasic(
				"Error",
				`Failed to add account: ${result.error}`,
			)
		}

		setAddAccountModalState(AddAccountModalState.CLOSED)
	}

	function setMessageBasic(title: string, message: string) {
		setMessage({
			title: title,
			message: message,
			onClose: () => {setMessage(null)},
			buttons: [
				{
					key: "okay",
					label: "Okay",
					color: "primary",
					onPress: () => {setMessage(null)}
				}
			],
		})
	}

	return (
		<>
			{addAccountModalState === AddAccountModalState.CLOSED ? null : (
				<AddAccountDialog
					onClose={() => {setAddAccountModalState(AddAccountModalState.CLOSED)}}
					onSubmit={(value) => {
						onAddAccountSubmit(value)
					}}
				/>
			)}
			<div className="flex flex-col gap-4">
				<MessageModal
					isOpen={message != null}
					{...(message !== null ? message : {
						title: "",
						message: "",
						buttons: [],
						onClose: () => {},
					})}
				/>
				<ProvideModal
					submitting={submitting}
					isOpen={authenticatingUser !== null}
					onClose={() => {onClose()}}
					onSubmit={(value) => {
						setProvideValue("")
						onValueProvided(value)
					}}
					value={provideValue}
					setValue={setProvideValue}
					user={authenticatingUser!}
				/>
				{users === null ? (
					<Card>
						<CardBody>Waiting for data...</CardBody>
					</Card>
				) : (
					<>
						<div className="flex gap-4 justify-between">
							<span></span>
							<Button size="sm" onClick={() => {setAddAccountModalState(AddAccountModalState.OPEN)}}>Add Account</Button>
						</div>
						<AccountTable
							users={users}
							onProvideClicked={onProvide}
							renderActionButtons={(user) => {
								return <>
									<Tooltip content="Retrieve auth code">
										<Button
											isIconOnly
											color="default"
											aria-label="Retrieve auth code"
											isDisabled={!user.lastCode}
											onClick={() => {
												setMessageBasic(
													"Auth code",
													`As of ${getElapsedTime(user.lastCode!.date)} ago the login code is: ${user.lastCode!.value}`,
												)
											}}
										>
											<EyeIcon />
										</Button>
									</Tooltip>
									{user.status.stage === "ClientNotStarted" ?
										(
											<Tooltip content="Connect">
												<Button
													isIconOnly
													color="default"
													aria-label="Connect"
													onClick={() => {
														ApiService.getInstance().connectClient(user.phone).then((result) => {
															if(result.success) {
																setMessageBasic("Success", `Connected account ${user.phone}.`)
															} else {
																setMessageBasic("Error", `Couldn't connect account ${user.phone}: ${result.error}`)
															}
														})
													}}
												>
													<EllipsisIcon />
												</Button>
											</Tooltip>
										)
										:
										(
											<Tooltip content="Disconnect">
												<Button
													isIconOnly
													color="default"
													aria-label="Disconnect"
													onClick={() => {
														setMessage({
															title: "Disconnect",
															message: `Really disconnect ${user.phone}?`,
															onClose: () => {setMessage(null)},
															buttons: [
																{
																	key: "disconnect",
																	label: "Disconnect",
																	color: "danger",
																	onPress: () => {
																		setMessage(null)

																		ApiService.getInstance().disconnectClient(user.phone).then((result) => {
																			if(result.success) {
																				setMessageBasic("Success", `Disconnected account ${user.phone}.`)
																			} else {
																				setMessageBasic("Error", `Couldn't disconnect account ${user.phone}: ${result.error}`)
																			}
																		})
																	}
																},
																{
																	key: "cancel",
																	label: "Cancel",
																	color: "default",
																	onPress: () => {
																		setMessage(null)
																	}
																}
															],
														})
													}}
												>
													<DeleteIcon />
												</Button>
											</Tooltip>
										)
									}
								</>
							}}
						/>
					</>
				)}
			</div>
			<div>
				{isLoading && <Spinner />}
			</div>
		</>
	);
}