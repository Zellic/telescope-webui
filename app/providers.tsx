"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { DefaultEnvironment, EnvironmentContext } from "@/components/providers/environment";
import { useState } from "react";
import { MobxStoreProvider } from "@/components/providers/mobx";

export interface ProvidersProps {
	children: React.ReactNode;
	themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
	const router = useRouter();
	const [environment, setEnvironment] = useState(DefaultEnvironment);

	return (
		<NextUIProvider navigate={router.push}>
			<NextThemesProvider {...themeProps}>
				<EnvironmentContext.Provider value={{ environment, setEnvironment }}>
					<MobxStoreProvider>
						{children}
					</MobxStoreProvider>
				</EnvironmentContext.Provider>
			</NextThemesProvider>
		</NextUIProvider>
	);
}
