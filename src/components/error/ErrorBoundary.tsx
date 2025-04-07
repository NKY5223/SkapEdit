import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";
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
};
// have to use class component because fcs dont support it?? why??
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
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
			const heading = (this.props.location
				? <>error in {this.props.location}:</>
				: `uh oh`
			);
			const orig = (
				<div className={css.error}>
					<h1>:( {heading}</h1>
					<pre>{t`${this.state.error}`}</pre>
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