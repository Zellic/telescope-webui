import React, { useRef, useState } from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Spinner
} from "@nextui-org/react";
import { TelegramAccount } from "@/components/tg/account-table-types";
import { Input } from "@nextui-org/input";

interface ProvideModalParams {
	submitting: boolean,
	isOpen: boolean;
	onClose: () => void;
	onValue: (value: any) => void;
	user: TelegramAccount
}

interface InputType {
	name: string
	inputType: string
	label: string
	placeholder: string

	// todo: regex? validate code, etc?
}

const validators: { [key: string]: InputType } = {
	"PasswordRequired": {
		name: "PasswordRequired",
		inputType: "text",
		label: "Password",
		placeholder: "Enter the account password"
	},
	"AuthCodeRequired": {
		name: "AuthCodeRequired",
		inputType: "text",
		label: "Auth Code",
		placeholder: "Enter the Telegram auth code"
	},
	// "EmailRequired": {
	// 	name: "EmailRequired",
	// 	inputType: "text",
	// 	label: "Password",
	// 	placeholder: "Enter the account password"
	// },
	"EmailCodeRequired": {
		name: "EmailCodeRequired",
		inputType: "text",
		label: "E-mail code",
		placeholder: "Enter code from email"
	},
}

export default function ProvideModal(props: ProvideModalParams) {
	const {isOpen, onOpenChange} = useDisclosure({isOpen: props.isOpen});
	const item = props.isOpen ? validators[props.user.status.stage] : null;
	const [value, setValue] = useState("")

	function onValue(value: any) {
		props.onValue(value);
	}

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={() => {props.onClose()}}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">{props.user.status.stage}</ModalHeader>
						{props.submitting ?
							(
								<>
									<ModalBody>
										Submitting...
									</ModalBody>
									<ModalFooter>
										<Spinner />
									</ModalFooter>
								</>
							)
								:
							(
								<>
									<ModalBody>
										<p>
											Please enter the thingy.
										</p>
										<div>
											<Input
												isRequired={true}
												type={item!.inputType}
												label={item!.label}
												placeholder={item!.placeholder}
												value={value}
												onValueChange={(newvalue) => {setValue(newvalue)}}
											/>
										</div>
									</ModalBody>
									<ModalFooter>
										<Button color="danger" variant="light" onPress={onClose}>
											Close
										</Button>
										<Button color="primary" onPress={() => {onValue(value)}}>
											Submit
										</Button>
									</ModalFooter>
								</>
							)
						}
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
