export function GetCFEmail(): string | null {
	const cookieString = document.cookie;
	const cookies = cookieString.split('; ');
	const CF_Authorization = cookies.find(cookie => cookie.startsWith('CF_Authorization='))?.split('=')[1];

	if (CF_Authorization) {
		const split = CF_Authorization.split('.');
		if (split.length > 0) {
			const decode = atob(split[1]);
			return JSON.parse(decode)['email'];
		}
	}

	return null;
}