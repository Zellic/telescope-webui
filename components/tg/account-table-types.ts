export type AuthState =
	| "ClientNotStarted"
	| "WaitingOnServer"
	| "PasswordRequired"
	| "AuthCodeRequired"
	| "EmailRequired"
	| "EmailCodeRequired"
	| "AuthorizationSuccess"
	| "ConnectionClosed"
	| "ErrorOccurred";

export interface AuthenticationStatus {
	stage: AuthState;
	inputRequired: boolean;
	// only used for ErrorOccurred right now
	error: string | null,
}

export interface TelegramAccount {
	name: string | null,
	username: string | null,
	email: string | null,
	comment: string | null,
	phone: string,
	lastCode: null | {value: number, date: number},
	status: AuthenticationStatus,
}