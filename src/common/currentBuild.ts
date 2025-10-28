import { currentVersion } from "../changelog.ts";

const check = (v: unknown): string | undefined => {
	if (typeof v === "string") return v;
	if (v === undefined) return v;
	console.error("currentBuild check failed:", v);
	return undefined;
}

const commitSha = check(import.meta.env.VITE_GIT_COMMIT_SHA);
const repoOwner = check(import.meta.env.VITE_GITHUB_REPO_OWNER);
const repoName = check(import.meta.env.VITE_GITHUB_REPO_NAME);

const github = commitSha !== undefined && repoName !== undefined && repoOwner !== undefined;

export const currentBuild = {
	mode: import.meta.env.DEV ? "DEV" :
		import.meta.env.PROD ? "PROD" : `MODE(${import.meta.env.MODE})`,
	version: currentVersion,
	github: github ? {
		repoName,
		repoUrl: `https://github.com/${repoOwner}/${repoName}/`,
		commitSha,
		commitUrl: `https://github.com/${repoOwner}/${repoName}/commit/${commitSha}`,
	} : null,
} as const;