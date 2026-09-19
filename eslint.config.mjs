import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // These three rules assume React Compiler semantics and false-positive on:
      // (1) react-three-fiber's useFrame, an imperative per-frame callback (not a
      //     render function) where reading Math.random() each tick is correct;
      // (2) effects that bridge external imperative browser APIs (getUserMedia,
      //     MediaPipe, debounce timers) into React state - the documented,
      //     recommended pattern for "subscribe to an external system";
      // (3) a custom hook (useHandTracking) returning a plain state value
      //     alongside an unrelated ref field, which the rule's static analysis
      //     conflates. We don't use the React Compiler in this project.
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
