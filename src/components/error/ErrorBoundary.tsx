import { Component, ErrorInfo, PropsWithChildren, ReactNode, useMemo } from "react";
import css from "./ErrorBoundary.module.css";
import { t } from "../../common/string.ts";

type ErrorBoundaryProps = PropsWithChildren<{
	fallback?: (error: Error,
		/** Default error screen */
		orig: ReactNode
	) => ReactNode;
	location?: ReactNode;
}>;
type ErrorBoundaryState = {
	error: Error | null;
	face: string | null;
	copyText: string;
};

const sadFaces: string[] = [
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	":(",
	"（；´д｀）ゞ",
];

// have to use class component because fcs dont support it?? why??
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			error: null,
			face: null,
			copyText: "Copy error info",
		};
	}
	static getDerivedStateFromError(error: unknown): Partial<ErrorBoundaryState> | null {
		// Update state so the next render will show the fallback UI.
		if (error instanceof Error) return {
			error,
			face: sadFaces[Math.floor(Math.random() * sadFaces.length)],
		};
		return null;
	}

	componentDidCatch(_err: Error, _info: ErrorInfo) {
	}

	render() {
		if (this.state.error) {
			const heading = (this.props.location
				? <>Something went wrong in {this.props.location}:</>
				: <>Something went wrong <em>somewhere</em>:</>
			);
			const errorStr = t`${this.state.error}`;
			const copy: React.MouseEventHandler<HTMLButtonElement> = () => {
				const clipboard = window.navigator?.clipboard;
				if (!clipboard) {
					this.setState(s => ({ ...s, copyText: "Could not access clipboard" }))
					return;
				}
				clipboard.writeText(errorStr)
					.then(() => this.setState(s => ({ ...s, copyText: "Copied!" })))
					.catch(() => this.setState(s => ({ ...s, copyText: "Could not copy text" })))
			}
			const orig = (
				<div className={css.error}>
					<h1><span className={css.face}>{this.state.face}</span> {heading}</h1>
					<h2>You can copy error info below and send it to NKY <em>WITH CONTEXT</em>:</h2>
					<button onClick={copy}>{this.state.copyText}</button>
					<pre>{errorStr}</pre>
				</div>
			);
			if (this.props.fallback) {
				return this.props.fallback(this.state.error, orig);
			}
			return orig;
		}

		return this.props.children;
	}
}