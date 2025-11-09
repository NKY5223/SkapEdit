type Log = {
	level: "warn" | "error";
	message: string;
	object?: string;
	room?: string;
}

type LoggerFunc = (message: string, object?: string, room?: string) => void;
export type Logger = {
	warn: LoggerFunc;
	error: LoggerFunc;
	logs: () => readonly Log[];
}

export const makeLogger = (): Logger => {
	const logs: Log[] = [];
	const log = (level: Log["level"]) => (message: string, object?: string, room?: string) => {
		logs.push({ level, message, object, room });
	}
	return {
		warn: log("warn"),
		error: log("error"),
		logs: () => logs,
	}
}