"use client";
import React from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import { DeleteIcon, EditIcon, EyeIcon } from "@nextui-org/shared-icons";
import { CheckIcon } from "@nextui-org/shared-icons";
import { TelegramAccount } from "@/components/tg/account-table-types";

const columns = [
	{name: "NAME", uid: "name"},
	// {name: "ROLE", uid: "role"},
	{name: "STATUS", uid: "status"},
	{name: "ACTIONS", uid: "actions"},
];

export function AccountTable(props: {users: TelegramAccount[]}) {
	const renderCell = React.useCallback((user: TelegramAccount, columnKey: string) => {
		let status = "warning"
		if(user.status.stage === "AuthorizationSuccess") {
			status = "success";
		} else if(user.status.stage === "AuthorizationFailed" || user.status.inputRequired === true) {
			status = "danger"
		}

		switch (columnKey) {
			case "name":
				return (
					<div className="flex">
						{/*<Chip*/}
						{/*	radius="full"*/}
						{/*	size="lg"*/}
						{/*	color={status as any}*/}
						{/*>*/}
						{/*	<CheckIcon className={"px-0"} />*/}
						{/*</Chip>*/}
						<div className="flex flex-col">
							<p className="text-bold text-sm capitalize">{user.username ?? "<no username>"}</p>
							<p className="text-bold text-sm capitalize text-default-400">{user.phone}</p>
						</div>
					</div>
				)
			// case "role":
			// 	return (
			// 		<div className="flex flex-col">
			// 			<p className="text-bold text-sm capitalize">{cellValue}</p>
			// 			<p className="text-bold text-sm capitalize text-default-400">{user.team}</p>
			// 		</div>
			// 	);
			case "status":
				return (
					<Chip className="capitalize" color={status as any} size="sm" variant="flat">
						{user.status.stage}
					</Chip>
				);
			case "actions":
				return (
					<div className="relative flex items-center gap-2">
						<Tooltip content="Details">
							<span className="text-lg text-default-400 cursor-pointer active:opacity-50">
								<EyeIcon />
							</span>
						</Tooltip>
						<Tooltip content="Edit user">
							<span className="text-lg text-default-400 cursor-pointer active:opacity-50">
								<EditIcon />
							</span>
						</Tooltip>
						<Tooltip color="danger" content="Delete user">
							<span className="text-lg text-danger cursor-pointer active:opacity-50">
								<DeleteIcon />
							</span>
						</Tooltip>
					</div>
				);
		}
	}, []);

	return (
		<Table aria-label="Example table with custom cells">
			<TableHeader columns={columns}>
				{(column) => (
					<TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
						{column.name}
					</TableColumn>
				)}
			</TableHeader>
			<TableBody items={props.users}>
				{(item) => (
					<TableRow key={item.phone}>
						<TableCell>{renderCell(item, "name")}</TableCell>
						<TableCell>{renderCell(item, "status")}</TableCell>
						<TableCell>{renderCell(item, "actions")}</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
