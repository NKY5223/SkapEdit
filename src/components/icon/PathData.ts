// wow that's a lot of types
type Chars<T> = T extends `${infer First}${infer Rest}` ? First | Chars<Rest> : never;
type Command = Chars<"MLHVCSQTAZ">;
type NormalizedCommand = Chars<"MLCQAZ">;
type CommandArgsMap = {
	M: [number, number];
	L: [number, number];
	C: [number, number, number, number, number, number];
	Q: [number, number, number, number];
	A: [number, number, number, 0 | 1, 0 | 1, number, number];
	Z: [];
};
type PathDataFor<T extends NormalizedCommand> = T extends T ? {
	command: T;
	args: CommandArgsMap[T];
} : never;
export type PathData = PathDataFor<NormalizedCommand>;

// magic regex
// \, comma
// \s+ any amount of whitespace
// (?<=[a-zA-Z])(?=[\d\-\.]) command followed by number
// (?<=\d\.)(?=[a-zA-Z\-]) number followed by command
const pathSplitter = /\,|\s+|(?<=[a-zA-Z])(?=[\d\-\.])|(?<=\d\.?)(?=[a-zA-Z\-])|(?<=\.\d*)(?=\.)/g;
const svgCommands = [..."MLHVCSQTAZ"];
const isCommand = (s: string): s is Command => svgCommands.includes(s);
function arrayInterval<T>(arr: T[], interval: number, initial: number = interval): { initial: T[]; rest: T[][]; } {
	const rest = [];
	for (let i = initial; i < arr.length; i += interval) {
		rest.push(arr.slice(i, i + interval));
	}

	return {
		initial: arr.slice(0, initial),
		rest
	};
}

type Point = [number, number];
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Point, b: Point): Point => [a[0] * b[0], a[1] * b[1]];
const offset = (curr: Point, pos: Point, relative: boolean): Point => relative ? add(curr, pos) : pos;
type Chunk = {
	command: Command;
	relative: boolean;
	args: number[];
};
type State = {
	position: Point;
	control: Point | null;
	pathData: PathData[];
};
const normalisers: Record<Command, (state: State, chunk: Chunk) => State> = {
	Z: state => {
		state.pathData.push({
			command: "Z",
			args: [],
		});
		return state;
	},
	M: (state, chunk) => {
		const { initial: [x, y], rest } = arrayInterval(chunk.args, 2);
		const pos = offset(state.position, [x, y], chunk.relative);
		state.pathData.push({
			command: "M",
			args: pos,
		});
		state.position = pos;
		state = rest.reduce<State>((state, [x, y]) => {
			const pos = offset(state.position, [x, y], chunk.relative);
			state.pathData.push({
				command: "L",
				args: pos,
			});
			state.position = pos;
			return state;
		}, state);
		state.control = null;
		return state;
	},
	L: (state, chunk) => {
		const { initial: [x, y], rest } = arrayInterval(chunk.args, 2);
		addLine(state, chunk, x, y);
		state = rest.reduce<State>((state, [x, y]) => (
			addLine(state, chunk, x, y)
		), state);
		state.control = null;
		return state;
	},
	H: (state, chunk) => {
		const { initial: [x], rest } = arrayInterval(chunk.args, 1);
		addLine(state, chunk, x, 0);
		state = rest.reduce<State>((state, [x]) => (
			addLine(state, chunk, x, 0)
		), state);
		state.control = null;
		return state;
	},
	V: (state, chunk) => {
		const { initial: [y], rest } = arrayInterval(chunk.args, 1);
		addLine(state, chunk, 0, y);
		state = rest.reduce<State>((state, [y]) => (
			addLine(state, chunk, 0, y)
		), state);
		state.control = null;
		return state;
	},
	C: (state, chunk) => {
		const { initial: [c0x, c0y, c1x, c1y, x, y], rest } = arrayInterval(chunk.args, 6);
		console.log(chunk);
		addCubic(state, chunk, c0x, c0y, c1x, c1y, x, y);
		state = rest.reduce<State>((state, [c0x, c0y, c1x, c1y, x, y]) => (
			addCubic(state, chunk, c0x, c0y, c1x, c1y, x, y)
		), state);
		return state;
	},
	S: (state, chunk) => {
		const { initial: [c1x, c1y, x, y], rest } = arrayInterval(chunk.args, 4);
		// Reflect state.control over state.position (p + (p - c))
		const [c0x, c0y] = sub(mul(state.position, [2, 2]), state.control ?? state.position);
		addCubic(state, chunk, c0x, c0y, c1x, c1y, x, y);
		state = rest.reduce<State>((state, [c1x, c1y, x, y]) => (
			addCubic(state, chunk,
				...sub(mul(state.position, [2, 2]), state.control ?? state.position
				), c1x, c1y, x, y)
		), state);
		return state;
	},
	Q: (state, chunk) => {
		const { initial: [c0x, c0y, x, y], rest } = arrayInterval(chunk.args, 4);
		addQuadratic(state, chunk, c0x, c0y, x, y);
		state = rest.reduce<State>((state, [c0x, c0y, x, y]) => (
			addQuadratic(state, chunk, c0x, c0y, x, y)
		), state);
		return state;
	},
	T: (state, chunk) => {
		const { initial: [x, y], rest } = arrayInterval(chunk.args, 4);
		// Reflect state.control over state.position (p + (p - c))
		const [c0x, c0y] = sub(mul(state.position, [2, 2]), state.control ?? state.position);
		addQuadratic(state, chunk, c0x, c0y, x, y);
		state = rest.reduce<State>((state, [x, y]) => (
			addQuadratic(state, chunk,
				...sub(mul(state.position, [2, 2]), state.control ?? state.position
				), x, y)
		), state);
		return state;
	},
	A: (state, chunk) => {
		const { initial: [rx, ry, rotation, largeArc, clockwise, x, y], rest } = arrayInterval(chunk.args, 7);
		addArc(state, chunk, rx, ry, rotation, largeArc, clockwise, x, y);
		state = rest.reduce<State>((state, [rx, ry, rotation, largeArc, clockwise, x, y]) => (
			addArc(state, chunk, rx, ry, rotation, largeArc, clockwise, x, y)
		), state);
		return state;
	},
};
function addLine(state: State, chunk: Chunk, x: number, y: number) {
	const pos = offset(state.position, [x, y], chunk.relative);
	state.pathData.push({
		command: "L",
		args: pos,
	});
	state.control = null;
	state.position = pos;

	return state;
}
function addCubic(state: State, chunk: Chunk, c0x: number, c0y: number, c1x: number, c1y: number, x: number, y: number) {
	const c0 = offset(state.position, [c0x, c0y], chunk.relative);
	const c1 = offset(state.position, [c1x, c1y], chunk.relative);
	const pos = offset(state.position, [x, y], chunk.relative);
	state.pathData.push({
		command: "C",
		args: [...c0, ...c1, ...pos],
	});
	state.control = c1;
	state.position = pos;

	return state;
}
function addQuadratic(state: State, chunk: Chunk, c0x: number, c0y: number, x: number, y: number) {
	const c0 = offset(state.position, [c0x, c0y], chunk.relative);
	const pos = offset(state.position, [x, y], chunk.relative);
	state.pathData.push({
		command: "Q",
		args: [...c0, ...pos],
	});
	state.control = c0;
	state.position = pos;

	return state;
}
function addArc(state: State, chunk: Chunk, rx: number, ry: number, rotation: number, largeArc: number, clockwise: number, x: number, y: number) {
	const pos = offset(state.position, [x, y], chunk.relative);
	state.pathData.push({
		command: "A",
		args: [rx, ry, rotation, boolNum(largeArc), boolNum(clockwise), ...pos],
	});
	state.control = null;
	state.position = pos;

	return state;
}
const boolNum = (x: number): 0 | 1 => x ? 1 : 0;

export function parsePath(d: string) {
	const data = d
		.split(pathSplitter)
		.filter(s => s.trim())
		.reduce<Chunk[]>((chunks, str) => {
			const command = str.toUpperCase();
			if (isCommand(command)) {
				chunks.push({
					command,
					// If str > "Z", it is lowercase and therefore a relative command
					relative: str > "Z",
					args: [],
				});
			} else {
				chunks.at(-1)?.args?.push?.(Number(str));
			}
			return chunks;
		}, [])
		.reduce<State>((state, chunk) => normalisers[chunk.command](state, chunk), {
			position: [0, 0],
			control: null,
			pathData: [],
		}).pathData;

	return data;
}

export function pathToString(path: PathData[]) {
	return path.map(command => `${command.command} ${command.args.join(" ")}`).join(" ");
}