export const indent = (str: string, char = "\t") => str.split("\n").map(s => char + s).join("\n");

type TypesetOptions = {
	align: "top" | "middle" | "bottom";
};
export const typeset = (options: Partial<TypesetOptions>) => (template: readonly string[], ...substs: unknown[]) => {
	const result: string[] = [];
	const parts: string[] = [];
	const subst = substs.map(x => String(x));

	for (const [i, str] of template.entries()) {
		const lines = str.split("\n");
		if (lines.length === 1) {
			if (i in subst) {
				// Keep going until \n found
				parts.push(str, subst[i]);
			} else {
				// End
				parts.push(str);
			}
		} else {
			// \n Found
			const last = lines.pop();
			if (last === undefined) {
				throw new Error("?????? lines is somehow empty despite it being a result of String.split");
			}

			// Push the simple (maybe empty) strings in
			parts.push(...lines);

			// New line
			result.push(align(options, [...parts]));
			parts.length = 0;

			if (i in subst) {
				// Next line
				parts.push(last, subst[i]);
			} else {
				// End
				parts.push(last);
			}
		}
	}
	if (parts.length) {
		result.push(align(options, [...parts]));
	}
	return result.join("\n");
}
const align = (options: Partial<TypesetOptions>, strs: readonly string[]) => {
	const { align = "middle" } = options;
	const totalHeight = Math.max(...strs.map(s => measure(s).height));
	const lines: string[][] = Array.from({ length: totalHeight }, () => []);
	for (const str of strs) {
		const { height, widthStr } = measure(str);
		const [top, bottom] = distribute(align, totalHeight, height);
		[
			...new Array(top).fill(widthStr),
			...str.split("\n"),
			...new Array(bottom).fill(widthStr),
		].forEach((s, i) => lines[i].push(s));
	}
	return lines.map(l => l.join("")).join("\n");
}
const distribute = (align: TypesetOptions["align"], space: number, size: number): [start: number, end: number] => {
	const diff = space - size;
	switch (align) {
		case "top": {
			return [0, diff];
		}
		case "middle": {
			const ceil = Math.ceil(diff / 2);
			const floor = Math.floor(diff / 2);
			return [floor, ceil];
		}
		case "bottom": {
			return [diff, 0];
		}
	}
}
const measure = (str: string) => {
	const lines = str.split("\n");
	// width is at least 0
	const width = Math.max(0, ...lines.map(s => s.length));
	const height = lines.length;
	// just use first line, assume multiline strings have no \ts anyway
	const widthStr = lines[0].replaceAll(/[^\t]/g, " ");
	return {
		width,
		height,
		/** A string with the same width as the string */
		widthStr,
	};
}