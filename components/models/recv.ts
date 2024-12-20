import { IEnvironment, ITelegramAccount } from "@/components/models/telegram";

export enum MessageRecvType {
	SSO_START = "SSO_START",
	CLIENT_START = "CLIENT_START",
	ADD_ACCOUNT_RESPONSE = "ADD_ACCOUNT_RESPONSE",
	ADD_TEST_ACCOUNT_RESPONSE = "ADD_TEST_ACCOUNT_RESPONSE",
	SUBMIT_VALUE_RESPONSE = "SUBMIT_VALUE_RESPONSE",
	DELETE_ACCOUNT_RESPONSE = "DELETE_ACCOUNT_RESPONSE",
	CONNECT_CLIENT_RESPONSE = "CONNECT_CLIENT_RESPONSE",
	DISCONNECT_CLIENT_RESPONSE = "DISCONNECT_CLIENT_RESPONSE",
	SET_PASSWORD_RESPONSE = "SET_PASSWORD_RESPONSE",
	GET_PASSWORD_RESPONSE = "GET_PASSWORD_RESPONSE",
	TERMINATE_OTHER_SESSIONS_RESPONSE = "TERMINATE_OTHER_SESSIONS_RESPONSE",
}

interface GenericResponseData {
	status: "OK" | "ERROR";
	error: null | string;
}

interface MessageDataMap {
	[MessageRecvType.SSO_START]: {
		email: string;
	};
	[MessageRecvType.CLIENT_START]: {
		hash: string;
		environment: IEnvironment;
		items: ITelegramAccount[] | undefined;
	};
	[MessageRecvType.ADD_ACCOUNT_RESPONSE]: GenericResponseData;
	[MessageRecvType.ADD_TEST_ACCOUNT_RESPONSE]: GenericResponseData;
	[MessageRecvType.SUBMIT_VALUE_RESPONSE]: GenericResponseData;
	[MessageRecvType.DELETE_ACCOUNT_RESPONSE]: GenericResponseData;
	[MessageRecvType.CONNECT_CLIENT_RESPONSE]: GenericResponseData;
	[MessageRecvType.DISCONNECT_CLIENT_RESPONSE]: GenericResponseData;
	[MessageRecvType.SET_PASSWORD_RESPONSE]: GenericResponseData;
	[MessageRecvType.GET_PASSWORD_RESPONSE]: GenericResponseData & {value: string};
	[MessageRecvType.TERMINATE_OTHER_SESSIONS_RESPONSE]: GenericResponseData;
}

// SocketRecvMessage converts map above into
/*
	{
		type: MessageSendType.???
		data: {
			...
		}
	}
 */
export type SocketRecvMessage = {
	[K in MessageRecvType]: {
	type: K;
} & (MessageDataMap[K] extends undefined ? {} : { data: MessageDataMap[K] });
}[MessageRecvType];
