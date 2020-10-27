import { terser } from "rollup-plugin-terser";

export default {
	input: "./src/index.js",
	output: [{
  		file: "./dist/pre-frame.js",
  		format: "cjs",
  		name: "preframe",
  		exports: "named"
  	},
    {
      file: "./dist/pre-frame.min.js",
      format: "iife",
      name: "preframe",
      exports: "named"
    }
  ],
  external: ['preact'],
	plugins: [
		terser()
	]
};
