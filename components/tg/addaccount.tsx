import React, { useState } from "react";
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
import { Input } from "@nextui-org/input";
import { Result } from "@/components/api";

export interface AddAccountDialogProps {
	onClose: () => void;
	onSubmit: (value: AddAcountResult) => void;
}

export interface AddAcountResult {
	phone: string
	email: string | null
	comment: string | null
}

function valueOrNull(s: string | undefined | null): string | null {
	if(s && s.length > 0)
		return s
	return null
}

export default function AddAccountDialog(props: AddAccountDialogProps) {
	const {isOpen, onOpenChange} = useDisclosure({isOpen: true});
	const [submitting, setSubmitting] = useState(false)
	const [phoneNumber, setPhoneNumber] = useState("")
	const [email, setEmail] = useState("")
	const [comment, setComment] = useState("")

	return (
		<Modal isOpen={isOpen} isDismissable={!submitting} onOpenChange={onOpenChange} onClose={() => {props.onClose()}}>
			<ModalContent>
				{(onClose) => (
					<>
						<ModalHeader className="flex flex-col gap-1">Add Telegram Account</ModalHeader>
						{submitting ?
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
										<div className="flex flex-col gap-6">
											<Input
												isRequired={true}
												type="text"
												label="Phone number"
												placeholder="Enter  phone number..."
												labelPlacement="outside"
												maxLength={11}
												pattern={"\d{11}"}
												value={phoneNumber}
												onValueChange={(value) => {setPhoneNumber(value)}}
											/>
											<Input
												isRequired={false}
												type="email"
												label="E-mail"
												placeholder="Enter email..."
												labelPlacement="outside"
												maxLength={255}
												value={email}
												onValueChange={(value) => {setEmail(value)}}
											/>
											<Input
												isRequired={false}
												type="text"
												label="Comment"
												placeholder="Account belongs to..."
												labelPlacement="outside"
												maxLength={300}
												value={comment}
												onValueChange={(value) => {setComment(value)}}
											/>
										</div>
									</ModalBody>
									<ModalFooter>
										<Button color="danger" variant="light" onPress={onClose}>
											Close
										</Button>
										<Button color="primary" onPress={() => {
											setSubmitting(true)
											props.onSubmit({ phone: phoneNumber, email: valueOrNull(email), comment: valueOrNull(comment) })
										}}>
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
