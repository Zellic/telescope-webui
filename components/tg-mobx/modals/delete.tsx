import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { ApiService } from "@/components/api";
import { NameCell } from "@/components/tg-mobx/account-table";

export const DeleteAccountModal = observer(() => {
	const telegramStore = useTelegramStore();
	const [value, setValue] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const isOpen = telegramStore.modals.deleteClient !== null;

	const onClose = () => {
		telegramStore.modals.setDeleteClient(null);
		setValue("");
	};

	return (
		<BasicModal
			isOpen={isOpen}
			onClose={onClose}
			header={"Remove account"}
			body={
				submitting ?
					<>
						<p>Deleting...</p>
					</>
					:
					<>
						<p>Really remove this account from Telescope and delete all associated data?</p>
						<div className="flex items-center ml-6">
							<NameCell account={telegramStore.modals.deleteClient!} />
						</div>
					</>
			}
			footer={
				submitting ?
					<>
						<Spinner/>
					</>
					:
					<>
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
									onValueChange={(value) => {
										setValue(value.toUpperCase());
									}}
								/>
							</div>
							<div className="flex flex-row gap-2">
								<Button color="danger" isDisabled={value.toUpperCase() != "DELETE"} onPress={() => {
									setValue("");
									setSubmitting(true);

									const phone = telegramStore.modals.deleteClient!.phone;
									ApiService.getInstance().deleteaccount(phone).then(res => {
										setSubmitting(false);
										telegramStore.modals.setDeleteClient(null);
										if (!res.success) {
											telegramStore.modals.setMessageBasic(
												"Error",
												`Failed to delete account: ${res.error}`
											);
										}
									}).catch(res => {
										setSubmitting(false);
										telegramStore.modals.setDeleteClient(null);
										telegramStore.modals.setMessageBasic(
											"Error", "Failed to reach server"
										);
									});

								}}>
									Delete User
								</Button>
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