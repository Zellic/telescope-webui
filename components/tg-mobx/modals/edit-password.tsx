import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useState } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { ApiService } from "@/components/api";
import { NameCell } from "@/components/tg-mobx/account-table";

export const WHITESPACE = /\s/g;

export const EditPasswordInput = observer((props: {
	value: string,
	onValueChange: (value: any) => void,
	valueConfirm: string,
	onValueChangeConfirm: (value: any) => void
}) => {
	return <>
		<Input
			isRequired={true}
			type="password"
			label="2FA Password"
			placeholder="Please enter the password..."
			labelPlacement="outside"
			value={props.value}
			onValueChange={props.onValueChange}
		/>
		<Input
			isRequired={true}
			type="password"
			label="Confirm"
			placeholder="Please confirm the password..."
			labelPlacement="outside"
			value={props.valueConfirm}
			onValueChange={props.onValueChangeConfirm}
		/>
	</>;
});

export const EditPasswordModal = observer(() => {
	const telegramStore = useTelegramStore();
	const [value, setValue] = useState("");
	const [confirm, setConfirm] = useState("");

	let error: string | null = null;
	if (value.length == 0) {
		error = "Must enter a 2FA password.";
	} else if (value != confirm) {
		error = "Password and confirm field must match.";
	}

	const isOpen = telegramStore.modals.editPassword !== null;

	const onClose = () => {
		telegramStore.modals.setEditPasswordClient(null);
		setValue("");
		setConfirm("");
	};

	return (
		<BasicModal
			isOpen={isOpen}
			onClose={onClose}
			header={"Edit 2FA password"}
			body={
				<>
					<p>You are submitting a new 2FA password for the following account:</p>
					<div className="flex items-center ml-6">
						<NameCell account={telegramStore.modals.editPassword!} />
					</div>
				</>
			}
			footer={
				<>
					<div className="w-full flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<EditPasswordInput value={value} onValueChange={(value) => {
								setValue(value.replaceAll(WHITESPACE, ""));
							}} valueConfirm={confirm} onValueChangeConfirm={(value) => {
								setConfirm(value.replaceAll(WHITESPACE, ""));
							}} />
						</div>
						<div className="flex flex-row gap-2">
							<Tooltip content={error ?? ""} isDisabled={error === null}>
										<span>
											<Button color="danger" isDisabled={value.length == 0 || value != confirm}
											        onPress={() => {
												        const password = value;
												        setValue("");
												        setConfirm("");

												        telegramStore.socket.setPassword(telegramStore.modals.editPassword.phone, password);

												        telegramStore.modals.setEditPasswordClient(null);
											        }}>
												Change Password
											</Button>
										</span>
							</Tooltip>
							<Button color="default" onPress={onClose}>
								Cancel
							</Button>
						</div>
					</div>
				</>
			}
		/>
	);
});