export type AuthState =
	| "WaitingOnServer"
	| "PasswordRequired"
	| "AuthCodeRequired"
	| "EmailRequired"
	| "EmailCodeRequired"
	| "AuthorizationSuccess"
	| "AuthorizationFailed";

export interface AccountStatus {
	key: AuthState;
	requiresInput: boolean;
}

export interface TelegramAccount {
	phoneNumber: string;
	username?: string;
	status: AccountStatus;
}