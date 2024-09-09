"use client";
import React, { useState, useCallback, useRef, useContext } from "react";
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
import { getElapsedTime } from "@/components/time";
import { VscDebugDisconnect } from "react-icons/vsc";
import { MdDeleteForever, MdModeEdit, MdOutlineLogin } from "react-icons/md";
import { EyeIcon } from "@nextui-org/shared-icons";
import { TiMessageTyping } from "react-icons/ti";
import { IconContext } from "react-icons";
import DeleteModal from "@/components/deletemodal";
import EditPasswordModal from "@/components/passwordmodal";
import { EnvironmentContext } from "@/components/providers/environment";

enum AddAccountModalState {
	CLOSED,
	OPEN,
	SUBMITTING,
}

// TODO: This file is a feature creep mess with a bunch of modals that share similar functionality, and a god component with a ton of stuff in it.
//       If we add more stuff to Telescope this really deserves to be refactored
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
	const [deleteModalUser, setDeleteModalUser] = useState<TelegramAccount | null>(null)
	const [editPasswordModalUser, setEditPasswordModalUser] = useState<TelegramAccount | null>(null)
	const { environment, setEnvironment } = useContext(EnvironmentContext);

	const fetchUsers = useCallback(async () => {
		if (failedToReachServer) return;

		setIsLoading(true);
		try {
			const apiService = ApiService.getInstance();

			const environment = await apiService.environment();
			if (environment.success) {
				setEnvironment(environment.data)
			} else {
				console.error(`Error fetching environment status from server: ${environment.error}`)
			}

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
				<DeleteModal
					isOpen={deleteModalUser != null}
					user={deleteModalUser!}
					onClose={() => {setDeleteModalUser(null)}}
					onConfirmed={(user) => {
						setDeleteModalUser(null);

						(async function() {
							const result = await ApiService.getInstance().deleteaccount(user.phone);

							// TODO: this doesn't actually happen, it's async serverside. should probably change this?
							// problem is client shutdown can take a bit...
							if(!result.success) {
								setMessageBasic(
									"Error",
									`Failed to delete account: ${result.error}`,
								)
							}
						})()
					}}
				/>
				<EditPasswordModal
					isOpen={editPasswordModalUser != null}
					user={editPasswordModalUser!}
					onClose={() => {setEditPasswordModalUser(null)}}
					onSubmit={(user, password) => {
						setEditPasswordModalUser(null);

						(async function() {
							const result = await ApiService.getInstance().setpassword(user.phone, password);

							if(!result.success) {
								setMessageBasic(
									"Error",
									`Failed to edit account password for ${user.phone}: ${result.error}`,
								)
							}
						})()
					}}
				/>
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
						<div className="flex ml-auto gap-4 justify-between">
							<Button size="sm" onClick={() => {setAddAccountModalState(AddAccountModalState.OPEN)}}>Add Account</Button>
							{environment.staging && <Button size="sm" 													onClick={() => {
								setMessage({
									title: "Add Test Account",
									message: `Really add test acccount?`,
									onClose: () => {setMessage(null)},
									buttons: [
										{
											key: "yes",
											label: "Yes",
											color: "success",
											onPress: () => {
												setMessage(null)

												ApiService.getInstance().addTestAccount().then((result) => {
													if (result.success) {
														setMessageBasic("Success", `Created test account.`)
													} else {
														setMessageBasic("Error", `Couldn't create test account: ${result.error}`)
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
							}}>Add Test Account</Button>}
						</div>
						<AccountTable
							users={users}
							onProvideClicked={onProvide}
							renderActionButtons={(user) => {
								return <IconContext.Provider value={{size: '19px'}}>
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
											<TiMessageTyping />
										</Button>
									</Tooltip>
									{user.status.stage === "ClientNotStarted" ?
										(
											<Tooltip content="Connect Telegram session for this account">
												<Button
													isIconOnly
													color="default"
													aria-label="Connect Telegram session for this account"
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
													<MdOutlineLogin />
												</Button>
											</Tooltip>
										)
										:
										(
											<Tooltip content="Disconnect currently active Telegram session">
												<Button
													isIconOnly
													color="default"
													aria-label="Disconnect currently active Telegram session"
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
													<VscDebugDisconnect className="font-bold" />
												</Button>
											</Tooltip>
										)
									}
									<Tooltip content="Edit account's 2FA password">
										<Button
											isIconOnly
											aria-label="Edit account's 2FA password"
											onClick={() => {
												setEditPasswordModalUser(user)
											}}
										>
											<MdModeEdit />
										</Button>
									</Tooltip>
									<Tooltip content="Remove account from Telescope">
										<Button
											isIconOnly
											color="danger"
											aria-label="Remove account from Telescope"
											onClick={() => {
												setDeleteModalUser(user)
											}}
										>
											<MdDeleteForever />
										</Button>
									</Tooltip>
								</IconContext.Provider>
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