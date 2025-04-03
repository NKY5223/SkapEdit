export function analyseStack(error: Error): string {
	const { stack } = error;
	if (!stack) return "No stack in error";

	

	return stack;
}
