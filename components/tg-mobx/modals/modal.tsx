import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import React from "react";

interface BasicModalProps {
	isOpen: boolean;
	onClose: () => void;

	header: React.ReactNode | string;
	body: React.ReactNode;
	footer: React.ReactNode;
}

export default function BasicModal(props: BasicModalProps) {
	const { isOpen, onOpenChange } = useDisclosure({ isOpen: props.isOpen });

	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={props.onClose}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					{props.header}
				</ModalHeader>
				<ModalBody>
					{props.body}
				</ModalBody>
				<ModalFooter>
					{props.footer}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}