export type AuthState =
	| "WaitingOnServer"
	| "PasswordRequired"
	| "AuthCodeRequired"
	| "EmailRequired"
	| "EmailCodeRequired"
	| "AuthorizationSuccess"
	| "AuthorizationFailed";

export interface AuthenticationStatus {
	stage: AuthState;
	inputRequired: boolean;
}

export interface TelegramAccount {
	name: string | null,
	username: string | null,
	phone: string;
	status: AuthenticationStatus;
}