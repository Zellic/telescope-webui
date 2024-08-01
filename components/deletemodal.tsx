import React, { useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure, user
} from "@nextui-org/react";
import { TelegramAccount } from "@/components/tg/account-table-types";
import UserCard from "@/components/usercard";
import { Input } from "@nextui-org/input";

export interface DeleteModalProps {
	isOpen: boolean;
	user: TelegramAccount,
	onConfirmed: (user: TelegramAccount) => void,
	onClose: () => void,
}

export default function DeleteModal(props: DeleteModalProps) {
	const { isOpen, onOpenChange } = useDisclosure({ isOpen: props.isOpen });
	const [value, setValue] = useState("")

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={props.onClose}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Remove account</ModalHeader>
						<ModalBody>
							<p>Really remove this account from Telescope and delete all associated data?</p>
							<div className="flex items-center ml-6">
								<UserCard user={props.user} />
							</div>
						</ModalBody>
						<ModalFooter>
							<div className="w-full flex flex-col gap-3">
								<div>
									<Input
										isRequired={true}
										type="text"
										label="Confirm"
										placeholder="Type DELETE to confirm..."
										labelPlacement="outside"
										maxLength={6}
										value={value}
										onValueChange={(value) => {setValue(value.toUpperCase())}}
									/>
								</div>
								<div className="flex flex-row gap-2">
									<Button color="danger" isDisabled={value.toUpperCase() != "DELETE"} onPress={() => {
										setValue("")
										props.onConfirmed(props.user)
									}}>
										Delete User
									</Button>
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