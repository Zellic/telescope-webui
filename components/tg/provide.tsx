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
	onSubmit: (value: any) => void;

	value: string,
	setValue: (s: string) => void,

	user: TelegramAccount
}

interface InputType {
	name: string
	inputType: string
	label: string
	placeholder: string

	maxLength?: number

	/**
	 * Matches any characters that should not be in this field.
	 */
	filter_regex?: RegExp

	/**
	 * return error message, or null if input okay
	 */
	validate: (str: string) => string | null
}

const validators: { [key: string]: InputType } = {
	"PasswordRequired": {
		name: "PasswordRequired",
		inputType: "text",
		label: "Password",
		placeholder: "Enter the account password",
		filter_regex: /\S/g,
		validate: (value) => {
			return value.length > 0 ? null : "Cannot be empty."
		}
	},
	"AuthCodeRequired": {
		name: "AuthCodeRequired",
		inputType: "text",
		label: "Auth Code",
		placeholder: "Enter the Telegram auth code",
		maxLength: 5,
		filter_regex: /\D/g,
		validate: (value) => {
			return /^[0-9]{5}$/.test(value) ? null : "Auth code is exactly 5 digits."
		}
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
		placeholder: "Enter code from email",
		// idk what email codes are like...
		filter_regex: /\S/g,
		validate: (value) => {
			return value.length > 0 ? null : "Must enter an email code."
		}
	},
}

export default function ProvideModal(props: ProvideModalParams) {
	const {isOpen, onOpenChange} = useDisclosure({isOpen: props.isOpen});
	const type = props.isOpen ? validators[props.user.status.stage] : null;

	function onSubmit(value: any) {
		props.onSubmit(value);
	}

	let errorMsg: string | null = null;
	if(type !== null && type?.validate !== null) {
		errorMsg = type.validate(props.value);
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
												type={type!.inputType}
												label={type!.label}
												placeholder={type!.placeholder}

												maxLength={type?.maxLength}

												isInvalid={errorMsg !== null}
												color={errorMsg !== null ? "danger" : "success"}
												errorMessage={errorMsg ?? ""}

												value={props.value}
												onValueChange={(newvalue) => {
													if(type?.filter_regex) {
														props.setValue(newvalue.replaceAll(type.filter_regex, ""))
													} else {
														props.setValue(newvalue)
													}
												}}
											/>
										</div>
									</ModalBody>
									<ModalFooter>
										<Button color="danger" variant="light" onPress={onClose}>
											Close
										</Button>
										<Button color="primary" onPress={() => {onSubmit(props.value)}}>
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
