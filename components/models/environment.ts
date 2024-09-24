import { Instance, types } from "mobx-state-tree";

export const Environment = types.model({
	environment: types.enumeration("EnvironmentState", ['Production', 'Staging']),
})

export type IEnvironment = Instance<typeof Environment>;

export const defaultEnvironment: IEnvironment = {
	environment: 'Production',
}