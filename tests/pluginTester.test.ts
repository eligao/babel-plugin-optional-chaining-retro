import pluginTester from "babel-plugin-tester";
import babelPluginOptionalChainingRetro from "../src";

pluginTester({
  plugin: babelPluginOptionalChainingRetro,
  tests: {
    "does not change code with no identifiers": '"hello";',
    "shallow get": {
      code: "a?.b;",
      output: 'get(a, "b");'
    },
    "deep get": {
      code: "a?.b?.c?.d;",
      output: 'get(a, ["b", "c", "d"]);'
    },
    "mixed get": {
      code: "a?.b.c?.d;",
      output: 'get(get(a, "b").c, "d"]);',
      skip: true
    }
  }
});
