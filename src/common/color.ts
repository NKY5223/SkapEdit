import { Vector } from "./vector.ts";

export type ColorData = (
	| { type: "rgba";
		r: number;
		g: number;
		b: number;
		a: number;
	}
)
export class Color {
	protected constructor(protected readonly data: ColorData) {
	}

	/**
	 * Construct a Color from hex format
	 * @example
	 * Color.hex(0x2080ff, 0.8);
	 */
	static hex(rgb: number, a: number = 1) {
		const r = (rgb >> 16 & 0xff) / 0xff;
		const g = (rgb >> 8. & 0xff) / 0xff;
		const b = (rgb >> 0. & 0xff) / 0xff;
		return new this({ type: "rgba",
			r, g, b, 
			a
		});
	}

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
}