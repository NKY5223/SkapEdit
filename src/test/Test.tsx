import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";

import { Editor } from "@components/editor/Editor.tsx";
import { FC } from "react";


export const Test: FC = () => {
	return (
		<ErrorBoundary location="Test">
			<Editor />
		</ErrorBoundary>
	);
}
