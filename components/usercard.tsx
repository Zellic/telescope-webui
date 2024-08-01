import { TelegramAccount } from "@/components/tg/account-table-types";
import React from "react";

function formatPhoneNumber(phoneNumber: string): string {
	if (phoneNumber.length === 11) {
		return `+${phoneNumber[0]}-${phoneNumber.slice(1, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
	} else if (phoneNumber.length === 10) {
		return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
	} else if (phoneNumber.length === 7) {
		return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
	} else {
		return phoneNumber;
	}
}

export default function UserCard(props: {user: TelegramAccount}) {
	const user = props.user
	return (
		<div className="flex flex-col">
			<p className="text-bold text-sm">{user.username ?? user.name ?? "<no username>"}</p>
			<p className="text-bold text-sm text-default-400">{formatPhoneNumber(user.phone)}</p>
			<p className="text-bold text-sm text-default-400">{user.email}</p>
			<p className="text-bold text-sm text-default-400">{user.comment}</p>
		</div>
	)
}