import { terser } from "rollup-plugin-terser";

export default {
	input: "./src/index.js",
	output: {
		file: "./dist/index.js",
		format: "cjs",
		name: "pre-frame",
		exports: "named"
	},
  external: ['preact'],
	plugins: [
		terser()
	]
};
