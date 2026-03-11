export const unreachable = (value: never): never => {
	throw new Error(`unreachable: ${value}`);
};
