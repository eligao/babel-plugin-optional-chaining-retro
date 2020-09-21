import { types as t, PluginObj } from "@babel/core";
import syntaxOptionalChaining from "@babel/plugin-syntax-optional-chaining";
import { Identifier, Expression } from "@babel/types";
import { addDefault } from "@babel/helper-module-imports";

type SupportedKeypathHelperName = "dlv" | "lodash.get";

type BabelPluginOptionalChainingRetroOptions = {
  autoImportKeypathHelper?: boolean;
  keypathHelperName?: SupportedKeypathHelperName;
};

function babelPluginOptionalChainingRetro(
  opts: BabelPluginOptionalChainingRetroOptions
): PluginObj {
  let optionalIdentifierStack: Identifier[] = [];
  let optionalObjectRoot: Expression | null = null;

  return {
    name: "optional-chaining-retro",
    inherits: syntaxOptionalChaining,
    visitor: {
      OptionalMemberExpression: {
        enter(path) {
          const { node, parent } = path;
          // skip delete unary
          if (parent.type === "UnaryExpression" && parent.operator === "delete")
            path.skip();
        },
        exit(path, state) {
          const { node, parent } = path;
          const {
            autoImportKeypathHelper = true,
            keypathHelperName = "dlv",
          } = state.opts as BabelPluginOptionalChainingRetroOptions;
          if (node.optional === true && node.property.type === "Identifier") {
            // the node is an optional identifier
            if (!optionalObjectRoot) optionalObjectRoot = node.object;
            optionalIdentifierStack.push(node.property);
            if (autoImportKeypathHelper) {
              this.getter =
                this.getter ||
                addDefault(path, keypathHelperName, { nameHint: "get" });
            }

            if (
              parent.type !== "OptionalMemberExpression" ||
              parent.optional === false
            ) {
              // The parent is not an optional key, convert to get()
              const childrenKeys = optionalIdentifierStack.map((childId) =>
                t.stringLiteral(childId.name)
              );
              const getParams =
                childrenKeys.length > 1
                  ? t.arrayExpression(childrenKeys)
                  : childrenKeys[0];
              path.replaceWith(
                // @ts-ignore
                t.callExpression(this.getter || t.identifier("get"), [
                  optionalObjectRoot,
                  getParams,
                ])
              );
              optionalIdentifierStack = [];
              optionalObjectRoot = null;
            }
          }
        },
      },
    },
  };
}

export default babelPluginOptionalChainingRetro;
