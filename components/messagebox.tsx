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

interface MessageModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	message: string;
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
							<Button color="primary" onPress={onClose}>
								Close
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}