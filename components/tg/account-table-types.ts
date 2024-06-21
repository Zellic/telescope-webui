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
	phone: string;
	username?: string;
	status: AuthenticationStatus;
}