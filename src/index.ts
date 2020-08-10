import { types as t, PluginObj } from "@babel/core";
import syntaxOptionalChaining from "@babel/plugin-syntax-optional-chaining";
import { Identifier, Expression } from "@babel/types";

function babelPluginOptionalChainingRetro(): PluginObj {
  return {
    name: "optional-chaining-retro",
    inherits: syntaxOptionalChaining,
    visitor: {
      OptionalMemberExpression: (path, state) => {
        let n = path.node as Expression;
        const childIds: Identifier[] = [];
        let parentId: Identifier;
        while (true) {
          if (n.type === "OptionalMemberExpression") {
            if (n.property.type === "Identifier") {
              childIds.push(n.property);
              n = n.object;
            }
          } else if (n.type === "Identifier") {
            parentId = n;
            break;
          }
        }
        childIds.reverse();
        const childrenKeys = childIds.map(childId =>
          t.stringLiteral(childId.name)
        );
        const getParams =
          childIds.length > 1
            ? t.arrayExpression(childrenKeys)
            : childrenKeys[0];
        path.replaceWith(
          t.callExpression(t.identifier("get"), [parentId, getParams])
        );
        path.skip();
      }
    }
  };
}

export default babelPluginOptionalChainingRetro;
