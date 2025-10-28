import { Editor } from "@components/editor/Editor.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import css from "./App.module.css";
export function App() {
	return (
		<div className={css["app"]}>
			<ErrorBoundary location="Test">
				<Editor />
			</ErrorBoundary>
		</div>
	);
}