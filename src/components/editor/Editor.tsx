import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { Topbar } from "@components/editor/topbar/Topbar.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { LayoutProvider } from "@components/layout/layout.ts";
import { LayoutRoot } from "@components/layout/Layout.tsx";
import { ViewProvidersProvider } from "@components/layout/ViewProvidersProvider.tsx";
import { ToastProvider } from "@components/toast/ToastProvider.tsx";
import { translator_en_US } from "@components/translate/translation/en_US.ts";
import { translator_zh_Hans } from "@components/translate/translation/zh_Hans.ts";
import { TranslationProvider } from "@components/translate/TranslationProvider.tsx";
import { SkapMapProvider } from "@editor/reducer.ts";
import { FC, useState } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { viewProviders } from "../layout/views.tsx";
import { changelog } from "./changelog/changelog.ts";
import { Changelog } from "./changelog/Changelog.tsx";
import { defaultLayoutTree, defaultMap } from "./default.tsx";
import css from "./Editor.module.css";
import { SelectionProvider } from "./selection.ts";
import { SettingsProvider } from "@components/settings/SettingsProvider.tsx";
import { SettingsMenu } from "@components/settings/Settings.tsx";
import { OpenFileProvider } from "@hooks/useOpenFile.tsx";

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	const [openChangelog, setOpenChangelog] = useState(() => () => console.error("Did not set open changelog"));
	const [openSettings, setOpenSettings] = useState(() => () => console.error("Did not set open settings"));

	return (
		// App
		<ErrorBoundary location="Editor">
			{/* DO NOT EDIT THIS KEY EVER */}
			<SettingsProvider localStorageKey="skapedit_settings">
				<TranslationProvider>
					<OpenFileProvider>
						<ToastProvider>
							<ThemeProvider>
								<ContextMenuProvider>
									{/* Editor */}
									<SkapMapProvider initialValue={defaultMap}>
										<SelectionProvider initialValue={[]}>
											{/* Layout */}
											<ViewProvidersProvider providers={viewProviders}>
												<LayoutProvider initialValue={defaultLayoutTree}>
													<title>{import.meta.env.DEV ? `🛠 SkapEdit (DEV)` : `SkapEdit`}</title>
													<div className={css["editor"]}>
														<Topbar openChangelog={openChangelog} openSettings={openSettings} />
														<LayoutRoot />
														<Changelog changelog={changelog} setOpen={setOpenChangelog} />
														<SettingsMenu setOpen={setOpenSettings} />
													</div>
												</LayoutProvider>
											</ViewProvidersProvider>

										</SelectionProvider>
									</SkapMapProvider>

								</ContextMenuProvider>
							</ThemeProvider>
						</ToastProvider>
					</OpenFileProvider>
				</TranslationProvider>
			</SettingsProvider>
		</ErrorBoundary>
	);
}