import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import { DeleteIcon, EditIcon, EyeIcon } from "@nextui-org/shared-icons";
import { AccountTable, } from "@/components/tg/account-table";
import { TelegramAccount } from "@/components/tg/account-table-types";

const users: TelegramAccount[] = [
	{
		phoneNumber: "18435374362",
		status: {
			key: "PasswordRequired",
			requiresInput: true
		}
	},
]

export default function App() {
	return (
		<AccountTable users={users} />
	);
}
