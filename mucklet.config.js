/**
 * Mucklet script configuration file.
 *
 * The exported default value should be one of the following types:
 * - MuckletConfig
 * - (version: string) => MuckletConfig
 * - (version: string) => Promise.<MuckletConfig>
 */

const config = {
	output: {
		/**
		 * Directory to put build artifacts relative to the config file.
		 * Defaults to ./ if not set.
		 */
		dir: "build",

		/**
		 * Name of wasm build files. Available placeholders:
		 * - [name] is replaced with the script name.
		 * - [room] is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wasm" if not set.
		 */
		outFile: "[name].wasm",

		/**
		 * Name of wat build files. [name] is replaced with the script name.
		 * - [name] is replaced with the script name.
		 * - [room] is replaced with the script room ID or "noroom" if unset.
		 * Defaults to "[name].wat" if not set.
		 */
		textFile: "[name].wat",
	},
	realm: {
		/** URL to the realm API WebSocket endpoint. */
		apiUrl: "wss://api.mucklet.com",

		/**
		 * For security reason, it is not possible to store the token in the config file.
		 *
		 * Instead consider using:
		 * - MUCKLET_TOKEN_FILE environment variable with the path to a file containing the token
		 * - MUCKLET_TOKEN environment variable containing the token
		 * - --tokenfile flag with a path to a file containing the token
		 * - --token flag with the token.
		 */
	},
	scripts: [
		{
			name: "Weather",
			path: "scripts/community-pavilion.ts",
			room: "cstv9ve9gbrs0or9k2pg",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/vacant-bungalow.ts",
			room: "csu8erm9gbrs0or9q360",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/bungalows.ts",
			room: "csu10o69gbrs0or9l9mg",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/dock.ts",
			room: "cstj64m9gbrs0or9aa40",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/beach.ts",
			room: "cstvjj69gbrs0or9kbf0",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/tidepools.ts",
			room: "cstvlnu9gbrs0or9kd4g",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/cove.ts",
			room: "cstvo469gbrs0or9ket0",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/reef.ts",
			room: "cstvrfu9gbrs0or9kha0",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/pier.ts",
			room: "cstik2e9gbrs0or99ur0",
			active: true,
		},
		{
			name: "Listener",
			path: "scripts/mini-mall.ts",
			room: "csu5ipe9gbrs0or9osag",
			active: true,
		},
	],
};

export default config;
