import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";
import css from "./ErrorBoundary.module.css";
import { indent, t } from "../../common/string.ts";

type ErrorBoundaryProps = PropsWithChildren<{
	fallback?: (error: Error) => ReactNode;
	location?: string;
}>;
type ErrorBoundaryState = {
	error: Error | null;
};
// have to use class component
export class ErrorBoundary<T extends ErrorBoundaryProps> extends Component<T, ErrorBoundaryState> {
	constructor(props: T) {
		super(props);
		this.state = {
			error: null
		};
	}
	static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> | null {
		// Update state so the next render will show the fallback UI.
		if (error instanceof Error) return {
			error
		};
		return null;
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
	}

	render() {
		if (this.state.error) {
			if (this.props.fallback) {
				// You can render any custom fallback UI
				return this.props.fallback(this.state.error);
			}
			const heading = (this.props.location
				? `error in ${this.props.location}:`
				: `uh oh`
			);
			return (
				<div className={css.error}>
					<h1>:( {heading}</h1>
					<pre>{t`${this.state.error}`}</pre>
				</div>
			);
		}

		return this.props.children;
	}
}
const stringify = (obj: unknown): string => {
	const seperator = `\n ${"-".repeat(46)} \n`;
	const causeSeperator = `\n${"-".repeat(20)} Cause: ${"-".repeat(20)}\n`;
	const causesSeperator = `\n${"-".repeat(20)} Causes: ${"-".repeat(19)}\n`;
	if (obj instanceof Error) {
		const { cause } = obj;
		const msg = `Uncaught ${obj.name}: \n${indent(obj.message)}`;
		if (!cause) {
			return msg;
		}
		const stackMsg = obj.stack ? `\n${indent(obj.stack)}` : "";
		const causeMsg = (
			Array.isArray(cause)
				? causesSeperator +
				cause.map(c => indent(stringify(c))).join(seperator)
				: causeSeperator +
				stringify(cause)
		);

		return [
			msg,
			stackMsg,
			causeMsg,
		].join("");
	}
	if (Array.isArray(obj)) {
		const msgs = obj.map(stringify);
		return msgs.join(seperator);
	}
	return JSON.stringify(obj, null, "\t");
}