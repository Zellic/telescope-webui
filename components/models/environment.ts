import { Instance, types } from "mobx-state-tree";

export const Environment = types.model({
	staging: types.boolean,
})

export type IEnvironment = Instance<typeof Environment>;

export const defaultEnvironment: IEnvironment = {
	staging: false,
}