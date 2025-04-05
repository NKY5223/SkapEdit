import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";
import css from "./ErrorBoundary.module.css";
import { t } from "../../common/string.ts";

type ErrorBoundaryProps = PropsWithChildren<{
	fallback?: (error: Error) => ReactNode;
	location?: ReactNode;
}>;
type ErrorBoundaryState = {
	error: Error | null;
};
// have to use class component because fcs dont support it?? why??
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
				? <>error in {this.props.location}:</>
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