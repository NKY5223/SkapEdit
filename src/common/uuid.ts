export const createId = (): string => {
	if (window.crypto) return window.crypto.randomUUID();
	const hex = Math.trunc(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
	return `nocrypto-${hex}`;
}