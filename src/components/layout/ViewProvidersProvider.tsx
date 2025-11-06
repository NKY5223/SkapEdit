import { FC, PropsWithChildren, ReactNode } from "react";
import { Layout, ViewProvidersProviderInternal } from "./layout.ts";
import { toMap } from "@common/toMap.tsx";

// any, the root of all evil
// Unfortunately, it is very difficult to have type parameters for bivariant types :(
export const ViewProvidersProvider = <T extends Record<string, any>>({
	children, providers
}: PropsWithChildren<{ providers: T }>): ReactNode => {
	return (
		<ViewProvidersProviderInternal value={toMap(providers)}>{children}</ViewProvidersProviderInternal>
    );
};
