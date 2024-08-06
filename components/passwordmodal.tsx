import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure, user, Tooltip
} from "@nextui-org/react";
import { TelegramAccount } from "@/components/tg/account-table-types";
import UserCard from "@/components/usercard";
import { Input } from "@nextui-org/input";

export interface EditPasswordModalProps {
	isOpen: boolean;
	user: TelegramAccount,
	onSubmit: (user: TelegramAccount, password: string) => void,
	onClose: () => void,
}

const WHITESPACE = /\s/g

export default function EditPasswordModal(props: EditPasswordModalProps) {
	const { isOpen, onOpenChange } = useDisclosure({ isOpen: props.isOpen });
	const [value, setValue] = useState("")
	const [confirm, setConfirm] = useState("")

	let error: string | null = null;

	if(value.length == 0) {
		error = "Must enter a 2FA password."
	} else if(value != confirm) {
		error = "Password and confirm field must match."
	}

	// let wrap_tooltip = function(children: any) {
	// 	if(error == null)
	// 		return <>{children}</>
	//
	// 	return (
	// 		<Tooltip content={error}>
	// 			{children}
	// 		</Tooltip>
	// 	)
	// }

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={props.onClose}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Edit 2FA password</ModalHeader>
						<ModalBody>
							<p>You are submitting a new 2FA password for the following account:</p>
							<div className="flex items-center ml-6">
								<UserCard user={props.user} />
							</div>
						</ModalBody>
						<ModalFooter>
							<div className="w-full flex flex-col gap-6">
								<div className="flex flex-col gap-2">
									<Input
										isRequired={true}
										type="password"
										label="2FA Password"
										placeholder="Please enter the password..."
										labelPlacement="outside"
										value={value}
										onValueChange={(value) => {setValue(value.replaceAll(WHITESPACE, ""))}}
									/>
									<Input
										isRequired={true}
										type="password"
										label="Confirm"
										placeholder="Please confirm the password..."
										labelPlacement="outside"
										value={confirm}
										onValueChange={(value) => {setConfirm(value.replaceAll(WHITESPACE, ""))}}
									/>
								</div>
								<div className="flex flex-row gap-2">
									<Tooltip content={error ?? ""} isDisabled={error === null}>
										<span>
											<Button color="danger" isDisabled={value.length == 0 || value != confirm} onPress={() => {
												setValue("")
												setConfirm("")
												props.onSubmit(props.user, value)
											}}>
												Change Password
											</Button>
										</span>
									</Tooltip>
									<Button color="default" onPress={() => {
										props.onClose()
									}}>
										Cancel
									</Button>
								</div>
							</div>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}