import React from "react";
import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
} from "@nextui-org/react";

export interface MessageModalButton {
	key: string
	label: string,
	color: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined,
	onPress: (key: string) => void,
}

export interface MessageModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	buttons: Array<MessageModalButton>,
	onClose: () => void,
}

export default function MessageModal(props: MessageModalProps) {
	const { isOpen, onOpenChange } = useDisclosure({ isOpen: props.isOpen });

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={props.onClose}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">{props.title}</ModalHeader>
						<ModalBody>
							<p>{props.message}</p>
						</ModalBody>
						<ModalFooter>
							{props.buttons.map(it => {
								return (
									<Button color={it.color} onPress={() => {it.onPress(it.key)}}>
										{it.label}
									</Button>
								)
							})}
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}