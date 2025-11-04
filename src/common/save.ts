export type SaveMethod = "saveFilePicker" | "linkDownload";

declare global {
	interface Window {
		/** experimental file system access api */
		showSaveFilePicker?: (options?: {
			/** 
			 * A boolean value that defaults to false. 
			 * By default, the picker should include an option to not apply any file type filters 
			 * (instigated with the type option below). Setting this option to true means
			 * that option is not available.
			 */
			excludeAcceptAllOption?: boolean;
			/** 
			 * By specifying an ID, the browser can remember different directories for different IDs. 
			 * If the same ID is used for another picker, the picker opens in the same directory.
			 */
			id?: string;
			/** 
			 * A FileSystemHandle or a well known directory 
			 * ("desktop", "documents", "downloads", "music", "pictures", or "videos") 
			 * to open the dialog in. */
			startIn?: (
				| FileSystemHandle
				| "desktop"
				| "documents"
				| "downloads"
				| "music"
				| "pictures"
				| "videos"
			);
			/** The suggested file name. */
			suggestedName?: string;
			/** An array of allowed file types to save. */
			types?: {
				/** An optional description of the category of files types allowed. Default to be an empty string. */
				description?: string;
				/** An Object with the keys set to the MIME type and the values an Array of file extensions. */
				accept: Record<string, string[]>;
			}[];
		}) => Promise<FileSystemFileHandle>;
	}
}
export const save = async (
	fileName: string,
	contents: (saveMethod: SaveMethod) => Blob,
	options?: {
		/** id for saveFilePicker */
		id?: string;
		/** mime types for saveFilePicker */
		types?: {
			description?: string;
			accept: Record<string, string[]>;
		}[];
	}
): Promise<SaveMethod> => {
	if (window.showSaveFilePicker) {
		const handle = await window.showSaveFilePicker({
			id: options?.id,
			types: options?.types,
		});
		const writable = await handle.createWritable();
		await writable.write(contents("saveFilePicker"));
		await writable.close();

		return "saveFilePicker";
	} else {
		// Fallback to <a download> clicking
		const url = URL.createObjectURL(contents("linkDownload"));

		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = fileName;
		anchor.style = `display: none;`;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();

		URL.revokeObjectURL(url);

		return "linkDownload";
	}
}