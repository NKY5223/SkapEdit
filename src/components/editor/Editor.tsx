import { toMap } from "@common/toMap.tsx";
import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { LayoutProvider, ViewInfoStatesProvider, ViewProvidersProvider } from "@components/layout/layout.ts";
import { LayoutRoot } from "@components/layout/Layout.tsx";
import { Topbar } from "@components/editor/topbar/Topbar.tsx";
import { translator_en_US } from "@components/translate/translation/en_US.ts";
import { translator_zh_Hans } from "@components/translate/translation/zh_Hans.ts";
import { TranslationProvider } from "@components/translate/TranslationProvider.tsx";
import { SkapMapProvider } from "@editor/reducer.ts";
import { FC, useState } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { views } from "../layout/views.tsx";
import { defaultLayoutTree, defaultMap } from "./default.tsx";
import css from "./Editor.module.css";
import { SelectionProvider } from "./selection.ts";
import { Changelog } from "./changelog/Changelog.tsx";
import { changelog } from "./changelog/changelog.ts";
import { ToastProvider } from "@components/toast/ToastProvider.tsx";

const chinese = import.meta.env.DEV;
// use chinese on dev (for testing!!)
// if anything shows up in english it is probably untranslated.
// except inspector i couldn't find a translation for that
const translator = chinese
	? translator_zh_Hans
	: translator_en_US;
if (chinese) document.documentElement.lang = "zh-Hans";

type EditorProps = {

};
export const Editor: FC<EditorProps> = ({

}) => {
	const [openChangelog, setOpenChangelog] = useState(() => () => console.error("Did not set open changelog"));

	return (
		// App
		<ErrorBoundary location="Editor">
			<ThemeProvider>
				<TranslationProvider value={translator}>
					<ContextMenuProvider>
						<ToastProvider>
							{/* Editor */}
							<SkapMapProvider initialValue={defaultMap}>
								<SelectionProvider initialValue={[]}>
									{/* Layout */}
									<ViewInfoStatesProvider value={new Map()}>
										<ViewProvidersProvider value={toMap(views)}>
											<LayoutProvider initialValue={defaultLayoutTree}>
												<title>{import.meta.env.DEV ? `🛠 SkapEdit (DEV)` : `SkapEdit`}</title>
												<div className={css["editor"]}>
													<Topbar openChangelog={openChangelog} />
													<LayoutRoot />
													<Changelog changelog={changelog} setOpen={setOpenChangelog} />
												</div>
											</LayoutProvider>
										</ViewProvidersProvider>
									</ViewInfoStatesProvider>

								</SelectionProvider>
							</SkapMapProvider>

						</ToastProvider>
					</ContextMenuProvider>
				</TranslationProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}