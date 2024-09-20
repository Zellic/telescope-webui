'use server';

import { cookies } from "next/headers";

export async function GetCFEmail(): Promise<string | null> {
	const cookieStore = cookies()
	const CF_Authorization = cookieStore.get('CF_Authorization')?.value

	if (CF_Authorization) {
		const split = CF_Authorization.split('.');
		if (split.length > 0) {
			const decode = atob(split[1]);
			return JSON.parse(decode)['email'];
		}
	}

	return null;
}