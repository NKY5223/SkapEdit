import { Vector } from "./vector.ts";

export type ColorData = (
	| {
		type: "rgba";
		r: number;
		g: number;
		b: number;
		a: number;
	}
)
export class Color {
	protected constructor(protected readonly data: ColorData) {
	}

	// #region Constructors
	/**
	 * Construct a Color from rgb hex format
	 * @example
	 * Color.hex(0x2080ff, 0.8);
	 */
	static hex(rgb: number, a: number = 1) {
		const r = (rgb >> 16 & 0xff) / 0xff;
		const g = (rgb >> 8. & 0xff) / 0xff;
		const b = (rgb >> 0. & 0xff) / 0xff;
		return new this({
			type: "rgba",
			r, g, b,
			a
		});
	}
	/**
	 * Construct a Color from rgb 0-255 format
	 * @example
	 * Color.rgb255(32, 128, 255, 0.8);
	 */
	static rgb255(r: number, g: number, b: number, a: number = 1) {
		return new this({
			type: "rgba",
			r: r / 0xff,
			g: g / 0xff,
			b: b / 0xff,
			a
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
				return new Vector(
					data.r, data.g, data.b,
					data.a
				);
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
				return new Vector(
					data.r, data.g, data.b,
				);
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
			case "rgba": {
				return data.a;
			}
		}
	}
	// #endregion

	// #region Colors
	static readonly DEFAULT_OBSTACLE = Color.hex(0x000a57, 0.8);
	static readonly DEFAULT_BACKGROUND = Color.hex(0xe6e6e6);

	static readonly LAVA = Color.hex(0xb74038);
	static readonly SLIME = Color.hex(0x00ca00);
	static readonly ICE = Color.hex(0x7cabd2);
	// #endregion
}