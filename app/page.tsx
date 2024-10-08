'use client';

import React, { Suspense } from "react";
import TelegramAccountManager from "@/components/tg-mobx/account-manager";
import { observer } from "mobx-react-lite";

const App = observer(() => {
	return (
		<TelegramAccountManager />
	)
})

export default App;
