import { createContext } from 'react';

export interface Environment {
	staging: boolean,
}

// TODO: subject to idea changes on whether or not we should assume default environment context
//       maybe not in the future..? but its fine to do right now
export const DefaultEnvironment = {
	staging: false,
}

interface EnvironmentContextType {
	environment: Environment;
	setEnvironment: (environment: Environment) => void;
}

export const EnvironmentContext = createContext<EnvironmentContextType>({
	environment: DefaultEnvironment,
	setEnvironment: (environment: Environment) => {}
});
