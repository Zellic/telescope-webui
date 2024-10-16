import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useEffect, useState } from "react";
import { Input } from "@nextui-org/input";
import { Button, Spinner } from "@nextui-org/react";
import { ApiService } from "@/components/api";

function valueOrNull(s: string | undefined | null): string | null {
	if (s && s.length > 0)
		return s;
	return null;
}

export const AddAccountModal = observer(() => {
	const telegramStore = useTelegramStore();
	const [submitting, setSubmitting] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [comment, setComment] = useState("");

	const onClose = () => {
		telegramStore.modals.setAddAccount(null);
	};

	return (
		<BasicModal
			isOpen={telegramStore.modals.addAccount !== null}
			onClose={onClose}
			header={"Add Telegram Account"}
			body={submitting ? <>Submitting...</> :
				<div className="flex flex-col gap-6">
					<Input
						isRequired={true}
						type="text"
						label="Phone number"
						placeholder="Enter phone number..."
						labelPlacement="outside"
						maxLength={11}
						pattern={"\d{11}"}
						value={phoneNumber}
						onValueChange={(value) => {
							setPhoneNumber(value);
						}}
					/>
					<Input
						isRequired={false}
						type="email"
						label="E-mail"
						placeholder="Enter email..."
						labelPlacement="outside"
						maxLength={255}
						value={email}
						onValueChange={(value) => {
							setEmail(value);
						}}
					/>
					<Input
						isRequired={false}
						type="text"
						label="Comment"
						placeholder="Account belongs to..."
						labelPlacement="outside"
						maxLength={300}
						value={comment}
						onValueChange={(value) => {
							setComment(value);
						}}
					/>
				</div>}
			footer={submitting ? <Spinner /> : <>
				<Button color="danger" variant="light" onPress={onClose}>
					Close
				</Button>
				<Button color="primary" onPress={async () => {
					setSubmitting(true);

					telegramStore.socket.addAccount(phoneNumber, valueOrNull(email), valueOrNull(comment));
					telegramStore.modals.setAddAccount(null);
					setSubmitting(false);
				}}>
					Submit
				</Button></>
			}
		/>
	);
});