import { createContext, FC, PropsWithChildren, useContext, useId, useRef } from "react";
import { FilePickerOptions } from "../common/save.ts";
import css from "./useOpenFile.module.css";
import { Translate } from "@components/translate/Translate.tsx";

export type OpenMethod = "openFilePicker" | "inputFile";

declare global {
	interface Window {
		showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
	}
}

const openFileContext = createContext<(() => Promise<HTMLInputElement>) | null>(null);

export const OpenFileProvider: FC<PropsWithChildren> = ({ children }) => {
	const ref = useRef<HTMLDivElement>(null);
	const listenerRef = useRef<(input: HTMLInputElement) => void>(null);
	return (
		<openFileContext.Provider value={() => {
			const { promise, resolve, reject } = Promise.withResolvers<HTMLInputElement>();
			const popover = ref.current;
			if (!popover) throw new Error("No popover for openfileprovider");
			popover.showPopover();
			listenerRef.current = input => {
				resolve(input);
				popover.hidePopover();
			}
			return promise;
		}}>
			{children}
			<div ref={ref} popover="auto" className={css["popover"]}>
				<label>
					<Translate k="generic.input_file" />
					<input type="file" onInput={e => {
						const listener = listenerRef.current;
						if (!listener) return;
						listener(e.currentTarget);
					}} />
				</label>
			</div>
		</openFileContext.Provider>
	)
}

export const useOpenFile = () => {
	const openPopover = useContext(openFileContext);
	if (!openPopover) throw new Error("Used useOpenFile outside of its provider");

	return async (confirm?: (method: OpenMethod) => Promise<boolean>, options?: FilePickerOptions): Promise<[OpenMethod, File]> => {
		if (window.showOpenFilePicker) {
			const handles = await window.showOpenFilePicker(options);
			if (handles.length <= 0) throw new Error("select at least one file", { cause: "open_no_files" });

			if (confirm) {
				const answer = await confirm("openFilePicker");
				if (!answer) throw new Error("canceled open file", { cause: "cancel" });
			}

			const file = await handles[0].getFile();
			return ["openFilePicker", file];
		} else {
			const input = await openPopover();
			const files = input.files;
			if (confirm) {
				const answer = await confirm("inputFile");
				if (!answer) throw new Error("canceled open file", { cause: "cancel" });
			}
			if (!files || files.length <= 0) throw new Error("select at least one file", { cause: "open_no_files" });
			const file = files.item(0);
			if (!file) throw new Error("select at least one file", { cause: "open_no_files" });
			return ["inputFile", file];
		}
	}
}