"use client";

import React, { Suspense, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { AddAccountModal } from "@/components/tg-mobx/modals/add-account";
import { Button } from "@nextui-org/button";
import {
	ITelegramAccount,
	TelegramInstance,
	useTelegramStore
} from "@/components/models/telegram";
import { MessageModal } from "@/components/tg-mobx/modals/message";
import { ProvideInput, ProvideModal, ProvideValidators } from "@/components/tg-mobx/modals/provide";
import { redirect, useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { ApiService } from "@/components/api";
import { Divider } from "@nextui-org/divider";
import { Input } from "@nextui-org/input";
import { FaArrowRight } from "react-icons/fa6";
import { Chip, Spinner } from "@nextui-org/react";
import { formatPhoneNumber, stageToStatus } from "@/components/tg-mobx/utils";
import { EditPasswordInput, WHITESPACE } from "@/components/tg-mobx/modals/edit-password";

function getValidator(store: TelegramInstance, account: ITelegramAccount) {
	const stage = account.status.stage;
	if (stage === "PasswordRequired" || stage === "AuthCodeRequired" || stage === "EmailCodeRequired")
		return ProvideValidators[store.ssoClient.status.stage];
	else
		return null;
}

const OnboardingCard = observer(((props: { header: string, subtitle: string, children: any }) => {
	return (
		<div className="flex flex-col items-center mt-8">
			<Card className={"max-w-[400px] min-w-[300px] p-2"}>
				<CardHeader className={"block text-left"}>
					<p className={"font-bold text-large"}>{props.header}</p>
					<p className={"text-gray-400"}>{props.subtitle}</p>
				</CardHeader>
				<Divider />
				<CardBody className={"mt-2"}>
					{props.children}
				</CardBody>
			</Card>
		</div>
	);
}));

const EditPassword = observer(() => {
	const [value, setValue] = useState("");
	const [confirm, setConfirm] = useState("");
	const telegramStore = useTelegramStore();
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		setSubmitting(false);
	}, [telegramStore.ssoClient]);

	let error: string | null = null;
	if (value != confirm) {
		error = "Password and confirm field must match.";
	}

	return (
		<div className="flex flex-col gap-4">
			<EditPasswordInput value={value} onValueChange={(value) => {
				setValue(value.replaceAll(WHITESPACE, ""));
			}} valueConfirm={confirm} onValueChangeConfirm={(value) => {
				setConfirm(value.replaceAll(WHITESPACE, ""));
			}} />
			{error && <p className={"text-danger text-small"}>{error}</p>}
			{submitting ? <Spinner className={"ml-auto"} /> :
				<Button
					size="md"
					disabled={error != null || value.length === 0}
					color={error == null && value.length > 0 ? "primary" : "default"}
					fullWidth={false}
					isIconOnly
					className={"ml-auto"}
					onClick={() => {
						setSubmitting(true);
						if (telegramStore.ssoClient)
							telegramStore.socket.setPassword(telegramStore.ssoClient.phone, value);
						setValue("");
						setConfirm("");
					}}
				>
					<FaArrowRight />
				</Button>
			}
		</div>
	);
});


const Onboarding = observer(() => {
	const telegramStore = useTelegramStore();
	const searchParams = useSearchParams();
	const [phoneNumber, setPhoneNumber] = useState("");
	const [email, setEmail] = useState("");
	const [submittingInfo, setSubmittingInfo] = useState(false);
	const [provideValue, setProvideValue] = useState("");

	const provideType = telegramStore.ssoClient ? getValidator(telegramStore, telegramStore.ssoClient) : null;
	let errorMsg: string | null = null;
	if (provideType !== null && provideType?.validate !== null) {
		errorMsg = provideType.validate(provideValue);
	}

	useEffect(() => {
		const socket_url = ApiService.getInstance().wsURL + "/socket";
		telegramStore.socket.connect(socket_url);

		return () => {
			telegramStore.socket.disconnect();
		};
	}, []);

	useEffect(() => {
		if (telegramStore.ssoEmail)
			setEmail(telegramStore.ssoEmail);
	}, [telegramStore.ssoEmail]);

	useEffect(() => {
		setSubmittingInfo(false);
		setProvideValue("");
	}, [telegramStore.ssoClient?.status.stage]);

	if (telegramStore.ssoClient?.status.stage === "AuthorizationSuccess") {
		const url = searchParams.get("redirect");
		if (url) {
			redirect(url);
		}
	}

	if (telegramStore.socket.socketState === "error" || telegramStore.socket.socketState === "closed") {
		return (
			<Card>
				<CardBody>Failed to reach server. Please try again later.</CardBody>
			</Card>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center">
			<AddAccountModal />
			<MessageModal />
			<ProvideModal />

			<div className="text-center mb-4">
				<h1 className="text-4xl font-bold mb-4">Telescope Onboarding</h1>
				{!telegramStore.ssoClient &&
                  <OnboardingCard header={"Telegram Information"} subtitle={"Provide your Telegram phone number"}>
                    <Input
                      className={"mb-4"}
                      isRequired={true}
                      type="text"
                      label="Phone number"
                      placeholder="Enter phone number..."
                      labelPlacement="outside"
                      value={phoneNumber}
                      onValueChange={(value) => {
						  setPhoneNumber(value);
					  }}
                    />
                    <Input
                      className={"mb-4"}
                      isRequired={false}
                      type="email"
                      isReadOnly
                      label="E-mail"
                      placeholder="Enter email..."
                      labelPlacement="outside"
                      maxLength={255}
                      value={email}
                      onValueChange={(value) => {
						  setEmail(value);
					  }}
                    />
					  {submittingInfo ? <Spinner className={"ml-auto"} /> :
						  <Button
							  size="md"
							  color={phoneNumber.length >= 0 ? "primary" : "default"}
							  fullWidth={false}
							  isIconOnly
							  className={"ml-auto"}
							  onClick={() => {
								  setSubmittingInfo(true);
								  // telegramStore.socket.addTestAccount();
								  const formattedPhoneNumber = phoneNumber
								  	.replaceAll("-", "")
									.replaceAll(" ", "")
									.replaceAll("+", "");
								  telegramStore.socket.addAccount(formattedPhoneNumber, email, null);
							  }}
						  >
							  <FaArrowRight />
						  </Button>
					  }
                  </OnboardingCard>
				}
			</div>
			{telegramStore.ssoClient && telegramStore.ssoClient.status.stage !== "AuthorizationSuccess" &&
              <OnboardingCard header={"2FA & Password"} subtitle={"Authenticate your Telegram account"}>
                <div className={"flex justify-between"}>
                  <div>
                    <p
                      className={"font-bold text-medium"}>{telegramStore.ssoClient.username ?? telegramStore.ssoClient.name ?? "<no username>"}</p>
                    <p className={"text-small text-gray-400"}>
						{formatPhoneNumber(telegramStore.ssoClient.phone)}
                    </p>
                    <p className={"text-small text-gray-400"}>
						{telegramStore.ssoClient.email}
                    </p>
                  </div>
                  <Chip className="capitalize mt-5 ml-4" color={stageToStatus(telegramStore.ssoClient) as any}
                        size="md" variant="flat">
					  {telegramStore.ssoClient.status.stage}
                  </Chip>
                </div>
				  {provideType != null &&
                    <div className={"mt-4"}>

                      <ProvideInput type={ProvideValidators[telegramStore.ssoClient.status.stage]}
                                    errorMsg={errorMsg}
                                    value={provideValue} onValueChange={(value) => {
						  if (provideType?.filter_regex) {
							  setProvideValue(value.replaceAll(provideType.filter_regex, ""));
						  } else {
							  setProvideValue(value);
						  }
					  }} />
                    </div>
				  }
				  {submittingInfo ? <Spinner className={"mt-4 ml-auto"} /> :
					  <Button
						  size="md"
						  disabled={errorMsg != null || provideValue.length === 0}
						  color={errorMsg == null && provideValue.length > 0 ? "primary" : "default"}
						  fullWidth={false}
						  isIconOnly
						  className={"ml-auto mt-4"}
						  onClick={() => {
							  setSubmittingInfo(true);
							  // telegramStore.setMockStage("AuthorizationSuccess");
							  telegramStore.socket.submitValue(telegramStore.ssoClient!.phone, telegramStore.ssoClient!.status.stage, provideValue);
						  }}
					  >
						  <FaArrowRight />
					  </Button>
				  }
              </OnboardingCard>
			}
			{telegramStore.ssoClient && telegramStore.ssoClient.status.stage === "AuthorizationSuccess" &&
			  <OnboardingCard header={"Save your 2FA password"} subtitle={"This password is stored encrypted, not hashed"}>
                <EditPassword />
              </OnboardingCard>
			}
		</div>
	);
});

const OnboardingSuspense = observer(() => {
	return (
		<Suspense>
			<Onboarding />
		</Suspense>
	);
});

export default OnboardingSuspense;
