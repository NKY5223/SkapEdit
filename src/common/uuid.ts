export const createId = (prefix = ""): string => {
	const p = prefix ? `${prefix}_` : "";
	if (window.crypto)
		return `${p}${window.crypto.randomUUID()}`;

	const hex = Math.trunc(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
	return `nocrypto_${p}${hex}`;
}