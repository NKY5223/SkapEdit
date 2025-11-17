import { clamp } from "./number.ts";
import { Vector } from "./vector.ts";

export type ColorData = (
	| {
		type: "rgba";
		/** Red ∈ [0, 1] */
		r: number;
		/** Green ∈ [0, 1] */
		g: number;
		/** Blue ∈ [0, 1] */
		b: number;
		/** Alpha ∈ [0, 1] */
		a: number;
	}
	| {
		type: "hsva";
		/** Hue ∈ [0, 360) */
		h: number;
		/** Saturation ∈ [0, 1] */
		s: number;
		/** Value ∈ [0, 1] */
		v: number;
		/** Alpha ∈ [0, 1] */
		a: number;
	}
);

const clampUnit = clamp(0, 1);
export class Color {
	protected constructor(protected readonly data: ColorData) {
	}

	// #region Constructors
	/**
	 * Construct a Color from rgb hex format 
	 * (`0xrrggbb`)
	 * @example
	 * Color.hex(0x2080ff, 0.8);
	 */
	static hex(rgb: number, a: number = 1) {
		const r = (rgb >> 16 & 0xff) / 0xff;
		const g = (rgb >> +8 & 0xff) / 0xff;
		const b = (rgb >> +0 & 0xff) / 0xff;
		return new this({
			type: "rgba",
			r, g, b,
			a
		});
	}
	/**
	 * Construct a Color from rgb 0-1 format
	 * (`r, g, b`)
	 * @example
	 * Color.rgb(0.25, 0.5, 1, 0.8);
	 */
	static rgb(r: number, g: number, b: number, a: number = 1) {
		return new this({
			type: "rgba",
			r: clampUnit(r),
			g: clampUnit(g),
			b: clampUnit(b),
			a
		});
	}
	/**
	 * Construct a Color from rgb 0-255 format
	 * (`r, g, b`)
	 * @example
	 * Color.rgb255(32, 128, 255, 0.8);
	 */
	static rgb255(r: number, g: number, b: number, a: number = 1) {
		return new this({
			type: "rgba",
			r: clampUnit(r / 0xff),
			g: clampUnit(g / 0xff),
			b: clampUnit(b / 0xff),
			a
		});
	}

	/**
	 * Construct a Color from hsv degrees format
	 * (`h, s, v`)
	 * @example
	 * Color.hsv(214.17, 0.8745, 1, 0.8);
	 */
	static hsv(h: number, s: number, v: number, a: number = 1) {
		return new this({
			type: "hsva",
			h: (h % 360 + 360) % 360,
			s: clampUnit(s),
			v: clampUnit(v),
			a: clampUnit(a),
		});
	}
	// #endregion

	// #region Output
	/**
	 * @returns A Vec4 with components `∈ [0, 1]`.
	 * @example
	 * Color.hex(0x2080ff).rgba() === ⟨0.12549..., 0.50196..., 1, 1⟩
	 */
	rgba(): Vector<4> {
		const data = this.data;
		switch (data.type) {
			case "rgba": {
				const { r, g, b, a } = data;
				return new Vector(r, g, b, a);
			}
			case "hsva": {
				const { r, g, b, a } = hsvToRgb(data);
				return new Vector(r, g, b, a);
			}
		}
	}
	/**
	 * @returns A Vec4 with first three components `∈ [0, 255]`, last component `∈ [0, 1]`.
	 * @example
	 * Color.hex(0x2080ff).rgba255() === ⟨32, 128, 255, 1⟩
	 */
	rgba255(): Vector<4> {
		const data = this.data;
		switch (data.type) {
			case "rgba": {
				const { r, g, b, a } = data;
				return new Vector(r * 255, g * 255, b * 255, a);
			}
			case "hsva": {
				const { r, g, b, a } = hsvToRgb(data);
				return new Vector(r * 255, g * 255, b * 255, a);
			}
		}
	}
	/**
	 * @returns A Vec3 with components `∈ [0, 1]`.
	 * @example
	 * Color.hex(0x2080ff).rgba() === ⟨0.12549..., 0.50196..., 1⟩
	 */
	rgb(): Vector<3> {
		const data = this.data;
		switch (data.type) {
			case "rgba": {
				const { r, g, b } = data;
				return new Vector(r, g, b);
			}
			case "hsva": {
				const { r, g, b } = hsvToRgb(data);
				return new Vector(r, g, b);
			}
		}
	}
	hsva(): Vector<4> {
		const data = this.data;
		switch (data.type) {
			case "rgba": {
				const { h, s, v, a } = rgbToHsv(data);
				return new Vector(h, s, v, a);
			}
			case "hsva": {
				const { h, s, v, a } = data;
				return new Vector(h, s, v, a);
			}
		}
	}

	/**
	 * @returns A number `∈ [0, 1]`.
	 * @example
	 * Color.hex(0x2080ff, 0.25).alpha() === 0.25
	 */
	alpha(): number {
		const data = this.data;
		switch (data.type) {
			case "rgba":
			case "hsva":
				{
					return data.a;
				}
		}
	}

	/**
	 * @returns A CSS `'<color>'` string.
	 * @example
	 * Color.hex(0x2080ff, 0.25).toCssString() === "rgb(32 128 255 / 0.25)"
	 */
	toCssString(): string {
		const data = this.data;
		switch (data.type) {
			case "rgba": {
				const { r, g, b, a } = data;
				return `rgb(${r * 255} ${g * 255} ${b * 255} / ${a})`;
			}
			case "hsva": {
				const { h, s: sv, v, a } = data;
				const l = v * (1 - sv / 2);
				const s = l === 0 || l === 1 ? 0 :
					(v - l) / Math.min(l, 1 - l);
				return `hsl(${h}deg ${s * 100}% ${l * 100}% / ${a})`;
			}
		}
	}
	/**
	 * @returns A CSS `#rrggbbaa` `'<color>'` string.
	 * @example
	 * Color.hex(0x2080ff, 0.25).toHexString() === "#2080ff40"
	 */
	toHexString(): string {
		const [r, g, b, a] = this.rgba();
		return "#" + [r, g, b, a].map(n =>
			clamp(0, 0xff)(Math.trunc(n * 0xff))
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()
		).join("");
	}
	/**
	 * @returns A CSS `#rrggbbaa` `'<color>'` string.
	 * @example
	 * Color.hex(0x2080ff, 0.25).toHexString() === "#2080ff40"
	 */
	toHexStringNoAlpha(): string {
		const [r, g, b] = this.rgba();
		return "#" + [r, g, b].map(n =>
			clamp(0, 0xff)(Math.trunc(n * 0xff))
				.toString(16)
				.padStart(2, "0")
				.toUpperCase()
		).join("");
	}
	// #endregion

	// #region Misc
	static hsvCssString(h: number, s: number, v: number, a: number = 1): string {
		const l = v * (1 - s / 2);
		const sl = l === 0 || l === 1 ? 0 :
			(v - l) / Math.min(l, 1 - l);
		return `hsl(${h}deg ${sl * 100}% ${l * 100}% / ${a})`;
	}
	// #endregion

	// #region Transforms
	withAlpha(alpha: number): Color {
		const data = this.data;
		switch (data.type) {
			case "rgba":
			case "hsva":
				{
					return new Color({
						...data,
						a: alpha,
					});
				}
		}
	}
	// #endregion

	// #region Colors
	static readonly DEFAULT_OBSTACLE = Color.hex(0x000a57, 0.8);
	static readonly DEFAULT_BACKGROUND = Color.hex(0xe6e6e6);

	static readonly LAVA = Color.hex(0xb74038);
	// b74038
	// bf4942
	// c6514b
	static readonly SLIME = Color.hex(0x00ca00);
	static readonly ICE = Color.hex(0x7cabd2);

	static readonly GRAVITYZONE_FG_FREE = Color.hex(0x000000);
	static readonly GRAVITYZONE_FG_UP = Color.hex(0x0000e0);
	static readonly GRAVITYZONE_FG_RIGHT = Color.hex(0x00d000);
	static readonly GRAVITYZONE_FG_LEFT = Color.hex(0xff0000);
	static readonly GRAVITYZONE_FG_DOWN = Color.hex(0xd0c000);

	static readonly GRAVITYZONE_BG_FREE = Color.hex(0x404040, .25);
	static readonly GRAVITYZONE_BG_UP = Color.hex(0x000088, .25);
	static readonly GRAVITYZONE_BG_RIGHT = Color.hex(0x008400, .25);
	static readonly GRAVITYZONE_BG_LEFT = Color.hex(0xaa0000, .25);
	static readonly GRAVITYZONE_BG_DOWN = Color.hex(0x848000, .25);

	static readonly SPAWNER_BACKGROUND = Color.hex(0x2080ff, .25);

	static readonly TURRET = Color.hex(0x626262);

	static readonly DOOR_BACKGROUND = Color.hex(0x9d9d9d);
	static readonly BUTTON = Color.hex(0x494949);
	static readonly DOORLINK = Color.hex(0x606250);
	static readonly DOORLINK_ACTIVE = Color.hex(0x938e17);
	static readonly DOORLINK_HIDDEN = Color.DOORLINK.withAlpha(.5);
	static readonly DOORLINK_ACTIVE_HIDDEN = Color.DOORLINK_ACTIVE.withAlpha(.5);
	// #endregion
}

type C<T extends ColorData["type"]> = ColorData & { type: T };

const hsvToRgb = (hsv: C<"hsva">): C<"rgba"> => {
	// https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB
	const { h, s, v, a } = hsv;

	const h2 = h / 60;
	const hr = Math.floor(h2);
	const chroma = v * s;
	const x = chroma * (1 - Math.abs(h2 % 2 - 1));
	const [r, g, b] = hsvUtil(hr, chroma, x).add(v - chroma);
	return {
		type: "rgba",
		r, g, b, a,
	};
}
const hsvUtil = (hr: number, c: number, x: number): Vector<3> => {
	switch (hr) {
		case 0: return new Vector(c, x, 0);
		case 1: return new Vector(x, c, 0);
		case 2: return new Vector(0, c, x);
		case 3: return new Vector(0, x, c);
		case 4: return new Vector(x, 0, c);
		case 5: return new Vector(c, 0, x);
		default: return new Vector(0, 0, 0);
	}
}
const rgbToHsv = (rgb: C<"rgba">): C<"hsva"> => {
	const { r, g, b, a } = rgb;
	const max = Math.max(r, g, b);
	const v = max;
	const min = Math.min(r, g, b);
	const c = v - min;
	const h = 60 * ((
		c === 0 ? 0 :
			v === r ? (g - b) / c :
				v === g ? (b - r) / c + 2 :
					v === b ? (r - g) / c + 4 :
						0
	) % 6);
	const s = v === 0 ? 0 : c / v;

	return {
		type: "hsva",
		h, s, v, a,
	};
}