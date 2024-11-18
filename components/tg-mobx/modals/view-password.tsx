import { observer } from "mobx-react-lite";
import { useTelegramStore } from "@/components/models/telegram";
import BasicModal from "@/components/tg-mobx/modals/modal";
import React, { useEffect, useState } from "react";
import { Button, Spinner, Tooltip } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { ApiService } from "@/components/api";
import { NameCell } from "@/components/tg-mobx/account-table";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

export const ViewPasswordModal = observer(() => {
	const telegramStore = useTelegramStore();
	const isOpen = telegramStore.modals.viewPassword !== null;

	const [isVisible, setIsVisible] = useState(false);
	const toggleVisibility = () => setIsVisible(!isVisible);

	const onClose = () => {
		telegramStore.modals.setViewPasswordClient(null);
	};

	if (telegramStore.modals.viewPasswordState === 'failure') {
		return (
			<></>
		)
	}

	return (
		<BasicModal
			isOpen={isOpen}
			onClose={onClose}
			header={"View 2FA password"}
			body={
				<>
					{telegramStore.modals.viewPasswordState === 'waiting' && <Spinner/>}
					{telegramStore.modals.viewPasswordState === 'ok' &&
                      <Input
                        fullWidth
                        size={'lg'}
                        readOnly={true}
                        value={telegramStore.modals.viewPasswordPass}
                        endContent={
							<button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
								{isVisible ? (
									<FaEyeSlash className="text-2xl text-default-400 pointer-events-none" />
								) : (
									<FaEye className="text-2xl text-default-400 pointer-events-none" />
								)}
							</button>
						}
                        type={isVisible ? "text" : "password"}
                      />
					}
				</>
			}
			footer={
				<>
					<Button onClick={() => {
						onClose();
					}}>Cancel</Button>
				</>
			}
		/>
	);
});