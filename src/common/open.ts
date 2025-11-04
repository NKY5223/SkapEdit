import { FilePickerOptions } from "./save.ts";

export type OpenMethod = "openFilePicker" | "inputFile";

declare global {
	interface Window {
		showOpenFilePicker?: (options?: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
	}
}

export const openFile = async (confirm?: (method: OpenMethod) => boolean, options?: FilePickerOptions): Promise<[OpenMethod, File]> => {
	if (window.showOpenFilePicker) {
		const handles = await window.showOpenFilePicker(options);
		if (handles.length <= 0) throw new Error("select at least one file", { cause: "open_no_files" });

		if (confirm && !confirm("openFilePicker")) throw new Error("canceled open file", { cause: "cancel" });
		
		const file = await handles[0].getFile();
		return ["openFilePicker", file];
	}
	throw new Error("could not use showOpenFilePicker");
}