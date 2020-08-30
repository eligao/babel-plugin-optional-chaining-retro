import pluginTester from "babel-plugin-tester";
import babelPluginOptionalChainingRetro from "../src";

pluginTester({
  plugin: babelPluginOptionalChainingRetro,
  tests: {
    "does not change code with no identifiers": '"hello";',
    "shallow get": {
      code: "a?.b;",
      output: 'get(a, "b");',
    },
    "deep get": {
      code: "a?.b?.c?.d;",
      output: 'get(a, ["b", "c", "d"]);',
    },
    "mixed get": {
      code: "a?.b.c?.d;",
      output: 'get(get(a, "b").c, "d");',
    },
    "complicated get": {
      code: "a?.b.c?.d.e?.f;",
      output: 'get(get(get(a, "b").c, "d").e, "f");',
    },
    "usage with assignments": {
      code: "const x = a?.b?.c;",
      output: 'const x = get(a, ["b", "c"]);',
    },
    "usage with delete": {
      code: "delete a?.b?.c;",
    },
  },
});
