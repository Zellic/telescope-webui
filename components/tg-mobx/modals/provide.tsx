import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { ApiService } from "@/components/api";

interface InputType {
	name: string;
	inputType: string;
	label: string;
	placeholder: string;

	maxLength?: number;

	/**
	 * Matches any characters that should not be in this field.
	 */
	filter_regex?: RegExp;

	/**
	 * return error message, or null if input okay
	 */
	validate: (str: string) => string | null;
}

export const ProvideValidators: { [key: string]: InputType } = {
	"PasswordRequired": {
		name: "PasswordRequired",
		inputType: "text",
		label: "Password",
		placeholder: "Enter the account password",
		filter_regex: /\s/g,
		validate: (value) => {
			return value.length > 0 ? null : "Cannot be empty.";
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
			return /^[0-9]{5}$/.test(value) ? null : "Auth code is exactly 5 digits.";
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
		filter_regex: /\s/g,
		validate: (value) => {
			return value.length > 0 ? null : "Must enter an email code.";
		}
	}
};

export function ProvideInput(props: {
	type: InputType | null,
	errorMsg: string | null,
	value: string,
	onValueChange: (newvalue: any) => void
}) {
	return <Input
		isRequired={true}
		type={props.type?.inputType}
		label={props.type?.label}
		placeholder={props.type?.placeholder}
		maxLength={props.type?.maxLength}

		isInvalid={props.errorMsg !== null}
		color={props.errorMsg !== null ? "danger" : "success"}
		errorMessage={props.errorMsg ?? ""}

		value={props.value}
		onValueChange={props.onValueChange}
	/>;
}

export const ProvideModal = observer(() => {
	const telegramStore = useTelegramStore();
	const [submitting, setSubmitting] = useState(false);
	const [value, setValue] = useState("");

	const isOpen = telegramStore.modals.provide !== null;
	const type = isOpen ? ProvideValidators[telegramStore.modals.provide!.status.stage] : null;

	let errorMsg: string | null = null;
	if (type !== null && type?.validate !== null) {
		errorMsg = type.validate(value);
	}

	const onClose = () => {
		telegramStore.modals.setProvideClient(null);
		setValue("");
	};

	return (
		<BasicModal
			isOpen={isOpen}
			onClose={onClose}
			header={telegramStore.modals.provide?.status.stage}
			body={submitting ? <>Submitting...</> : <>
				<p>
					Please enter the thingy.
				</p>
				<div>
					<ProvideInput type={type} errorMsg={errorMsg} value={value} onValueChange={(newvalue) => {
						if (type?.filter_regex) {
							setValue(newvalue.replaceAll(type.filter_regex, ""));
						} else {
							setValue(newvalue);
						}
					}} />
				</div>
			</>}
			footer={submitting ? <Spinner /> : <>
				<Button color="danger" variant="light" onPress={onClose}>
					Close
				</Button>
				<Button color="primary" onPress={async () => {
					setSubmitting(true);
					const authClient = telegramStore.modals.provide;
					telegramStore.socket.submitValue(authClient?.phone!, authClient?.status.stage!, value);
					setSubmitting(false);

					telegramStore.modals.setProvideClient(null);
					setValue("");
				}}>
					Submit
				</Button>
			</>}
		/>
	);
});