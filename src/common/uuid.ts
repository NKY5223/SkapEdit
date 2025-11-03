declare const __ID_BRAND_NOT_REAL: unique symbol;
export type ID = string & { 
	/** Does not actually exist. */
	[__ID_BRAND_NOT_REAL]: typeof __ID_BRAND_NOT_REAL 
};

export const createId = (prefix = ""): ID => {
	const p = prefix ? `${prefix}_` : "";
	if (window.crypto)
		return `${p}${window.crypto.randomUUID()}` as ID;

	const hex = Math.trunc(Math.random() * 2 ** 32).toString(16).padStart(8, "0");
	return `nocrypto_${p}${hex}` as ID;
}

