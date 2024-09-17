import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useState } from "react";
import { Button, Tooltip } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { ApiService } from "@/components/api";
import { NameCell } from "@/components/tg-mobx/account-table";

const WHITESPACE = /\s/g;

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

	const isOpen = telegramStore.passwordEditingClient !== null;

	const onClose = () => {
		telegramStore.setPasswordEditingClient(null);
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
						<NameCell account={telegramStore.passwordEditingClient!} />
					</div>
				</>
			}
			footer={
				<>
					<div className="w-full flex flex-col gap-6">
						<div className="flex flex-col gap-2">
							<Input
								isRequired={true}
								type="password"
								label="2FA Password"
								placeholder="Please enter the password..."
								labelPlacement="outside"
								value={value}
								onValueChange={(value) => {
									setValue(value.replaceAll(WHITESPACE, ""));
								}}
							/>
							<Input
								isRequired={true}
								type="password"
								label="Confirm"
								placeholder="Please confirm the password..."
								labelPlacement="outside"
								value={confirm}
								onValueChange={(value) => {
									setConfirm(value.replaceAll(WHITESPACE, ""));
								}}
							/>
						</div>
						<div className="flex flex-row gap-2">
							<Tooltip content={error ?? ""} isDisabled={error === null}>
										<span>
											<Button color="danger" isDisabled={value.length == 0 || value != confirm}
											        onPress={() => {
												        const password = value;
												        setValue("");
												        setConfirm("");

												        // dont want phone object to get lost when client goes null
												        (async function(phone) {
													        const result = await ApiService.getInstance().setpassword(phone, password);

													        if (!result.success) {
														        telegramStore.setMessageBasic(
															        "Error",
															        `Failed to edit account password for ${phone}: ${result.error}`
														        );
													        }
												        })(telegramStore.passwordEditingClient!.phone);

												        telegramStore.setPasswordEditingClient(null);
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