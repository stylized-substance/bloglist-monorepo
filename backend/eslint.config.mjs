import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "commonjs"}},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  {
    files: ["*helper*"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off"
    }
  }
];