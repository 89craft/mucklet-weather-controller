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
			name: "weather controller",
			path: "scripts/nora-main-room.ts",
			room: "cptsaou9gbricr4i1t7g",
			active: true,
		},
		{
			name: "weather listener",
			path: "scripts/nora-tree-house.ts",
			room: "cppn8ie9gbricr4essug",
			active: true,
		},
	],
};

export default config;
