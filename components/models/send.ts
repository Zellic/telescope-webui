export enum MessageSendType {
	ADD_ACCOUNT = "ADD_ACCOUNT",
	ADD_TEST_ACCOUNT = "ADD_TEST_ACCOUNT",
	SUBMIT_VALUE = "SUBMIT_VALUE",
	DELETE_ACCOUNT = "DELETE_ACCOUNT",
	CONNECT_CLIENT = "CONNECT_CLIENT",
	DISCONNECT_CLIENT = "DISCONNECT_CLIENT",
	SET_PASSWORD = "SET_PASSWORD",
	GET_PASSWORD = "GET_PASSWORD",
	TERMINATE_OTHER_SESSIONS = "TERMINATE_OTHER_SESSIONS"
}

interface MessageDataMap {
	[MessageSendType.ADD_ACCOUNT]: {
		phone: string;
		email: string | null;
		comment: string | null;
	};
	[MessageSendType.ADD_TEST_ACCOUNT]: undefined;
	[MessageSendType.SUBMIT_VALUE]: {
		phone: string;
		stage: string;
		value: string;
	};
	[MessageSendType.DELETE_ACCOUNT]: {
		phone: string;
	};
	[MessageSendType.CONNECT_CLIENT]: {
		phone: string;
	};
	[MessageSendType.DISCONNECT_CLIENT]: {
		phone: string;
	};
	[MessageSendType.SET_PASSWORD]: {
		phone: string;
		password: string;
	};
	[MessageSendType.GET_PASSWORD]: {
		phone: string;
	}
	[MessageSendType.TERMINATE_OTHER_SESSIONS]: {
		phone: string;
	}
}

// SocketSendMessage converts map above into
/*
	{
		type: MessageSendType.???
		data: {
			...
		}
	}
 */
export type SocketSendMessage = {
	[K in MessageSendType]: {
	type: K;
} & (MessageDataMap[K] extends undefined ? {} : { data: MessageDataMap[K] });
}[MessageSendType];
