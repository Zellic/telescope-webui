import { IconContext, type IconType } from "react-icons";
import { Tooltip } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { getElapsedTime } from "@/components/time";
import { TiMessageTyping } from "react-icons/ti";
import { ApiService } from "@/components/api";
import { MdDeleteForever, MdModeEdit, MdOutlineLogin } from "react-icons/md";
import { VscDebugDisconnect } from "react-icons/vsc";
import React, { Fragment } from "react";
import { ITelegramAccount, PrivilegeUnion, useTelegramStore } from "@/components/models/telegram";
import { observer } from "mobx-react-lite";

interface TooltipButtonProps {
	content: string,
	arialabel?: string,
	icon: IconType,
	iconClass?: string,
	color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger",
	disabled?: boolean,
	onClick?: () => void,
}

function TooltipButton(props: TooltipButtonProps) {
	return (
		<Tooltip content={props.content}>
			<Button
				isIconOnly
				color={props.color || "default"}
				aria-label={props.arialabel || props.content}
				onClick={props.onClick}
				isDisabled={props.disabled}
			>
				<props.icon className={props.iconClass} />
			</Button>
		</Tooltip>
	);
}

export const ConnectionButtons = observer(({ account, onboarding }: { account: ITelegramAccount, onboarding?: boolean }) => {
	const telegramStore = useTelegramStore();

	if (account.status.stage === "ClientNotStarted") {
		return (
			<TooltipButton content={"Connect Telegram session for this account"}
			               icon={MdOutlineLogin}
			               disabled={onboarding}
			               onClick={() => {
							   telegramStore.socket.connectClient(account.phone);
			               }} />
		);
	} else {
		return (
			<TooltipButton content={"Disconnect currently active Telegram session"}
			               icon={VscDebugDisconnect} iconClass={"font-bold"}
			               disabled={onboarding}
			               onClick={() => {
				               telegramStore.modals.setMessage("Disconnect", `Really disconnect ${account.phone}?`, [
					               {
						               key: "disconnect",
						               label: "Disconnect",
						               color: "danger",
						               actionType: "disconnect"
					               },
					               {
						               key: "cancel",
						               label: "Cancel",
						               color: "default",
						               actionType: "default"
					               }
				               ], account);
			               }} />
		);
	}
});

export const ActionButtons = observer(({ account, onboarding }: { account: ITelegramAccount, onboarding?: boolean }) => {
	const telegramStore = useTelegramStore();

	const has = (priv: PrivilegeUnion) => account.privileges.indexOf(priv) >= 0

	return (
		<IconContext.Provider value={{ size: "19px" }}>
			{!has("login") ? null :
				<TooltipButton content={"Retrieve auth code"}
		               icon={TiMessageTyping}
		               disabled={!account.lastCode || onboarding}
		               onClick={() => {
			               telegramStore.modals.setMessageBasic(
				               "Auth code",
				               `As of ${getElapsedTime(account.lastCode!.date)} ago the login code is: ${account.lastCode!.value}`
			               );
		               }} />
			}

			{!has("manage_connection_state") ? null :
				<ConnectionButtons onboarding={onboarding} account={account} />
			}

			{!has("edit_two_factor_password") ? null :
				<TooltipButton content={"Edit account's 2FA password"}
				               icon={MdModeEdit}
				               disabled={onboarding}
				               onClick={() => {
					               telegramStore.modals.setEditPasswordClient(account);
				               }} />
			}

			{!has("remove_account") ? null :
				<TooltipButton content={"Remove account from Telescope"}
				               icon={MdDeleteForever} color={"danger"}
				               disabled={onboarding}
				               onClick={() => {
					               telegramStore.modals.setDeleteClient(account);
				               }} />
			}

		</IconContext.Provider>
	);
});