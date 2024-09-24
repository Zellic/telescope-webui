import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import React from "react";
import { observer } from "mobx-react-lite";

interface BasicModalProps {
	isOpen: boolean;
	onClose: () => void;

	header: React.ReactNode | string;
	body: React.ReactNode;
	footer: React.ReactNode;
}

const BasicModal = observer((props: BasicModalProps) => {
	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose}>
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
})

export default BasicModal;