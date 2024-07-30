"use client";
import React, { Fragment, ReactElement } from "react";
import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, User, Chip, Tooltip, getKeyValue} from "@nextui-org/react";
import { DeleteIcon, EditIcon, EyeIcon } from "@nextui-org/shared-icons";
import { CheckIcon } from "@nextui-org/shared-icons";
import { TelegramAccount } from "@/components/tg/account-table-types";
import { Button } from "@nextui-org/button";

const columns = [
	{name: "NAME", uid: "name"},
	// {name: "ROLE", uid: "role"},
	{name: "STATUS", uid: "status"},
	{name: "AUTHENTICATION", uid: "authentication"},
	{name: "ACTIONS", uid: "actions"},
];

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

interface AccountTableParams {
	users: TelegramAccount[];
	onProvideClicked: (user: TelegramAccount) => void;
	renderActionButtons: (user: TelegramAccount) => React.ReactNode;
}

export function AccountTable(props: AccountTableParams) {
	const renderCell = React.useCallback((user: TelegramAccount, columnKey: string) => {
		let status = "warning"
		if(user.status.stage === "AuthorizationSuccess") {
			status = "success";
		} else if(user.status.stage === "ClientNotStarted") {
			status = "default"
		} else if(user.status.stage === "ConnectionClosed" || user.status.stage === "ErrorOccurred" || user.status.inputRequired === true) {
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
							<p className="text-bold text-sm capitalize">{user.username ?? user.name ?? "<no username>"}</p>
							<p className="text-bold text-sm capitalize text-default-400">{formatPhoneNumber(user.phone)}</p>
							<p className="text-bold text-sm text-default-400">{user.email}</p>
							<p className="text-bold text-sm text-default-400">{user.comment}</p>
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
				)
			case "authentication":
				if(user.status.error !== null) {
					return <p>{user.status.error}</p>
				}
				if(status === "success" || !user.status.inputRequired)
					return null;
				return (
					<Button isLoading={status === "warning"} onClick={() => {props.onProvideClicked(user)}}>
						Provide
					</Button>
				)
			case "actions":
				return (
					<div className="relative flex items-center gap-2">
						{props.renderActionButtons(user)}
						{/*<Tooltip content="Edit user">*/}
						{/*	<span className="text-lg text-default-400 cursor-pointer active:opacity-50">*/}
						{/*		<EditIcon />*/}
						{/*	</span>*/}
						{/*</Tooltip>*/}
						{/*<Tooltip color="danger" content="Delete user">*/}
						{/*	<span className="text-lg text-danger cursor-pointer active:opacity-50">*/}
						{/*		<DeleteIcon />*/}
						{/*	</span>*/}
						{/*</Tooltip>*/}
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
						<TableCell>{renderCell(item, "authentication")}</TableCell>
						<TableCell>{renderCell(item, "actions")}</TableCell>
					</TableRow>
				)}
			</TableBody>
		</Table>
	);
}
