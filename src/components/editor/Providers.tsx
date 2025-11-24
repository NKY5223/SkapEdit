import { ContextMenuProvider } from "@components/contextmenu/ContextMenuProvider.tsx";
import { ErrorBoundary } from "@components/error/ErrorBoundary.tsx";
import { LayoutProvider } from "@components/layout/layout.ts";
import { ViewProvidersProvider } from "@components/layout/ViewProvidersProvider.tsx";
import { viewProviders } from "@components/layout/views.tsx";
import { SettingsProvider } from "@components/settings/SettingsProvider.tsx";
import { ToastProvider } from "@components/toast/ToastProvider.tsx";
import { TranslationProvider } from "@components/translate/TranslationProvider.tsx";
import { SkapMapProvider } from "@editor/reducer.ts";
import { OpenFileProvider } from "@hooks/useOpenFile.tsx";
import { FC, PropsWithChildren } from "react";
import { ThemeProvider } from "../../theme/theme.tsx";
import { defaultLayoutTree, defaultMap } from "./default.tsx";
import { SelectionProvider } from "./selection.ts";

type ProvidersProps = {

};
export const Providers: FC<PropsWithChildren<ProvidersProps>> = ({
	children
}) => {
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
													{children}
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