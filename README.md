# babel-plugin-optional-chaining-retro

## What is this:
This is a retrospetive trasformation plugin of EcmaScript optional chaining syntax.

## Why?

- Because the output of default built-in [@babel/plugin-syntax-optional-chaining](https://babeljs.io/docs/en/next/babel-plugin-syntax-optional-chaining.html) is too wordy and unreadable
- Remember the good old day when we use keyPath helpers like [lodash.get](https://www.npmjs.com/package/lodash.get) to safely get a key deep inside an object?
- To sqeeze every possible bit of space in the javascript bundle.
- I want to try fiddling with babel myself :)

### Example
Assume we have this object with some deeply nested keys:
```javascript
const obj = {
  alpha: {
    beta: {
      charlie: {
        delta: "hello",
      },
    },
  },
};
```

And we have some code snippets getting optional values deep inside 


```javascript
// 108 Bytes (comments excluded)
// 1x size, take it as a baseline
const x = obj?.alpha?.beta?.charlie;
// x = {delta:"hello"}

const y = obj?.alpha?.beta.charlie?.delta;
// y = "hello"

const z = obj?.alpha?.fox
// z = undefined

```

#### Transpiled by the vanilla babel
(Try it yourself on the [Babel Repl](https://babeljs.io/repl))

```javascript
// 790 Bytes, 7.31x inflation
// Code length complexity ~ O(7N)
"use strict";

var _obj, _obj$alpha, _obj$alpha$beta, _obj2, _obj2$alpha, _obj2$alpha$beta$char, _obj3, _obj3$alpha;

const x = (_obj = obj) === null || _obj === void 0 ? void 0 : (_obj$alpha = _obj.alpha) === null || _obj$alpha === void 0 ? void 0 : (_obj$alpha$beta = _obj$alpha.beta) === null || _obj$alpha$beta === void 0 ? void 0 : _obj$alpha$beta.charlie;
const y = (_obj2 = obj) === null || _obj2 === void 0 ? void 0 : (_obj2$alpha = _obj2.alpha) === null || _obj2$alpha === void 0 ? void 0 : (_obj2$alpha$beta$char = _obj2$alpha.beta.charlie) === null || _obj2$alpha$beta$char === void 0 ? void 0 : _obj2$alpha$beta$char.delta;
const z = (_obj3 = obj) === null || _obj3 === void 0 ? void 0 : (_obj3$alpha = _obj3.alpha) === null || _obj3$alpha === void 0 ? void 0 : _obj3$alpha.fox;
```

#### Transpiled by babel with this retro plugin

```javascript
// runtime keyPath helper
// a constant size dependency
import get from "lodash.get"

// 165 Bytes below, 1.53x inflation
// Code length complexity ~ O(C+1.5N)
"use strict";
const x = get(obj, ["alpha", "beta", "charlie"]);
const y = get(get(obj, ["alpha", "beta"]).charlie, "charlie");
const z = get(obj, ["alpha", "fox"]);
```

We can see the transpiled code using a runtime `keyPath` function costs `1.53x` inflation vs the `7.31x` overhead in the current babel transpiler. 

That is `~4.78x` save of space in our naive example. Of course, the optional chaining won't normally happen that much in your code.

## Sounds good, but what's the catch?
I'm glad you asked.
- The runtime `keyPath` function introduces a constant cost depending on what `get` function you introduce. Here we provide 2 options:
    - [`lodash.get`](https://www.npmjs.com/package/lodash.get): The most commonly used `keyPath` helper, [costs 4.4KB minified, or 1.8KB minified and gzipped](https://bundlephobia.com/result?p=lodash.get@4.4.2)
    - [`dlv`](https://www.npmjs.com/package/dlv): A geniously minimalist implementation from the author of PreactJS, [costs 253B minified, or 191B minified and gzipped](https://bundlephobia.com/result?p=dlv@1.1.3).
    - The extra cost is easily negated after a few or even one usage of optional chaining.
    - You can technically get the helper function for free if you have it already in your dependency.
- Some minor performance overhead. 
    - The retro output using the `dlv` helper takes ~30% performance hit on my laptop vs the vanilla babel output.
    - Run the benchmark [here](https://jsben.ch/NTCz9) by yourself