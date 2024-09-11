import { IconContext } from "react-icons";
import { Tooltip } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { getElapsedTime } from "@/components/time";
import { TiMessageTyping } from "react-icons/ti";
import { ApiService } from "@/components/api";
import { MdDeleteForever, MdModeEdit, MdOutlineLogin } from "react-icons/md";
import { VscDebugDisconnect } from "react-icons/vsc";
import React from "react";
import { ITelegramAccount } from "@/components/models/telegram";

export function ActionButtons({ account }: { account: ITelegramAccount }) {
	return (
		<IconContext.Provider value={{ size: "19px" }}>
			<Tooltip content="Retrieve auth code">
				<Button
					isIconOnly
					color="default"
					aria-label="Retrieve auth code"
					isDisabled={!account.lastCode}
					onClick={() => {
						// setMessageBasic(
						// 	"Auth code",
						// 	`As of ${getElapsedTime(account.lastCode!.date)} ago the login code is: ${account.lastCode!.value}`
						// );
					}}
				>
					<TiMessageTyping />
				</Button>
			</Tooltip>
			{account.status.stage === "ClientNotStarted" ?
				(
					<Tooltip content="Connect Telegram session for this account">
						<Button
							isIconOnly
							color="default"
							aria-label="Connect Telegram session for this account"
							onClick={() => {
								ApiService.getInstance().connectClient(account.phone).then((result) => {
									// if (result.success) {
									// 	setMessageBasic("Success", `Connected account ${account.phone}.`);
									// } else {
									// 	setMessageBasic("Error", `Couldn't connect account ${account.phone}: ${result.error}`);
									// }
								});
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
								// setMessage({
								// 	title: "Disconnect",
								// 	message: `Really disconnect ${account.phone}?`,
								// 	onClose: () => {
								// 		setMessage(null);
								// 	},
								// 	buttons: [
								// 		{
								// 			key: "disconnect",
								// 			label: "Disconnect",
								// 			color: "danger",
								// 			onPress: () => {
								// 				setMessage(null);
								//
								// 				ApiService.getInstance().disconnectClient(account.phone).then((result) => {
								// 					if (result.success) {
								// 						setMessageBasic("Success", `Disconnected account ${account.phone}.`);
								// 					} else {
								// 						setMessageBasic("Error", `Couldn't disconnect account ${account.phone}: ${result.error}`);
								// 					}
								// 				});
								// 			}
								// 		},
								// 		{
								// 			key: "cancel",
								// 			label: "Cancel",
								// 			color: "default",
								// 			onPress: () => {
								// 				setMessage(null);
								// 			}
								// 		}
								// 	]
								// });
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
						// setEditPasswordModalUser(account);
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
						// setDeleteModalUser(account);
					}}
				>
					<MdDeleteForever />
				</Button>
			</Tooltip>
		</IconContext.Provider>
	);
}