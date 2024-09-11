export function formatPhoneNumber(phoneNumber: string): string {
	if (phoneNumber.length === 11) {
		return `+${phoneNumber[0]}-${phoneNumber.slice(1, 4)}-${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7)}`;
	} else if (phoneNumber.length === 10) {
		return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
	} else if (phoneNumber.length === 7) {
		return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
	} else {
		return phoneNumber;
	}
}
