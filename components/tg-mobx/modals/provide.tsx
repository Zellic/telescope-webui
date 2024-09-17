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

const validators: { [key: string]: InputType } = {
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

export const ProvideModal = observer(() => {
	const telegramStore = useTelegramStore();
	const [submitting, setSubmitting] = useState(false);
	const [value, setValue] = useState("");

	const isOpen = telegramStore.authenticatingClient !== null;
	const type = isOpen ? validators[telegramStore.authenticatingClient!.status.stage] : null;

	let errorMsg: string | null = null;
	if (type !== null && type?.validate !== null) {
		errorMsg = type.validate(value);
	}

	const onClose = () => {
		telegramStore.setAuthenticatingClient(null);
		setValue("");
	};

	return (
		<BasicModal
			isOpen={isOpen}
			onClose={onClose}
			header={telegramStore.authenticatingClient?.status.stage}
			body={submitting ? <>Submitting...</> : <>
				<p>
					Please enter the thingy.
				</p>
				<div>
					<Input
						isRequired={true}
						type={type?.inputType}
						label={type?.label}
						placeholder={type?.placeholder}
						maxLength={type?.maxLength}

						isInvalid={errorMsg !== null}
						color={errorMsg !== null ? "danger" : "success"}
						errorMessage={errorMsg ?? ""}

						value={value}
						onValueChange={(newvalue) => {
							if (type?.filter_regex) {
								setValue(newvalue.replaceAll(type.filter_regex, ""));
							} else {
								setValue(newvalue);
							}
						}}
					/>
				</div>
			</>}
			footer={submitting ? <Spinner /> : <>
				<Button color="danger" variant="light" onPress={onClose}>
					Close
				</Button>
				<Button color="primary" onPress={async () => {
					try {
						setSubmitting(true);
						const apiService = ApiService.getInstance();
						const authClient = telegramStore.authenticatingClient;
						const submit = await apiService.submitValue(authClient?.phone!, authClient?.status.stage!, value);
						await new Promise(r => setTimeout(r, 2000));
						setSubmitting(false);

						if (submit.success) {
							const client = telegramStore.clients.find(client => client.phone === authClient?.phone);
							if (client) {
								client.updateStatus({
									...client.status,
									inputRequired: false
								});
							}
						} else {
							console.error(`Error submitting code to server: ${submit.error}`);
							// TODO: represent this error state
						}
					} catch (error) {
						console.error("Error submitting code to server: ", error);
						// TODO: represent this error state
					}

					telegramStore.setAuthenticatingClient(null);
					setValue("");
				}}>
					Submit
				</Button>
			</>}
		/>
	);
});