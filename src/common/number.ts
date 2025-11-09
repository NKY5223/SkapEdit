/**
 * Similar to Math.sign, but `sign(0) === 1` and `sign(-0) === -1`.
 */
export const sign = (x: number) => Math.sign(x === 0 ? 1 / x : x);

export const clamp = (min: number, max: number) => {
	if (!(min <= max)) throw new RangeError(`clamp min must be less than or equal to max.`);
	return (x: number) => Math.min(Math.max(min, x), max);
};

export const round = (step: number, val: number) => {
	if (step === 0) return val;
	return step * Math.round(val / step);
}

export const mod = (value: number, modulo: number) => (value % modulo + modulo) % modulo;