import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"


/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.{js,mjs,cjs,ts}"] },
	{ languageOptions: { globals: globals.browser } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{ ignores: ["api"] },
	{
		rules: {
			semi: ["error", "never"],
			quotes: ["error", "double"],
			indent: ["error", "tab"],
		}
	}
]