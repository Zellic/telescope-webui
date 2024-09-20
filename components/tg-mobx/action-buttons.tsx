import { IconContext, type IconType } from "react-icons";
import { Tooltip } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { getElapsedTime } from "@/components/time";
import { TiMessageTyping } from "react-icons/ti";
import { ApiService } from "@/components/api";
import { MdDeleteForever, MdModeEdit, MdOutlineLogin } from "react-icons/md";
import { VscDebugDisconnect } from "react-icons/vsc";
import React from "react";
import { ITelegramAccount, useTelegramStore } from "@/components/models/telegram";
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

export const StageButtons = observer(({ account, onboarding }: { account: ITelegramAccount, onboarding?: boolean }) => {
	const telegramStore = useTelegramStore();

	if (account.status.stage === "ClientNotStarted") {
		return (
			<TooltipButton content={"Connect Telegram session for this account"}
			               icon={MdOutlineLogin}
			               disabled={onboarding}
			               onClick={() => {
				               ApiService.getInstance().connectClient(account.phone).then((result) => {
					               if (result.success) {
						               telegramStore.modals.setMessageBasic("Success", `Connected account ${account.phone}.`);
					               } else {
						               telegramStore.modals.setMessageBasic("Error", `Couldn't connect account ${account.phone}: ${result.error}`);
					               }
				               });
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

	return (
		<IconContext.Provider value={{ size: "19px" }}>
			<TooltipButton content={"Retrieve auth code"}
			               icon={TiMessageTyping}
			               disabled={!account.lastCode || onboarding}
			               onClick={() => {
				               telegramStore.modals.setMessageBasic(
					               "Auth code",
					               `As of ${getElapsedTime(account.lastCode!.date)} ago the login code is: ${account.lastCode!.value}`
				               );
			               }} />

			<StageButtons onboarding={onboarding} account={account} />

			<TooltipButton content={"Edit account's 2FA password"}
			               icon={MdModeEdit}
			               disabled={onboarding}
			               onClick={() => {
				               telegramStore.modals.setEditPasswordClient(account);
			               }} />

			<TooltipButton content={"Remove account from Telescope"}
			               icon={MdDeleteForever} color={"danger"}
			               disabled={onboarding}
			               onClick={() => {
				               telegramStore.modals.setDeleteClient(account);
			               }} />

		</IconContext.Provider>
	);
});