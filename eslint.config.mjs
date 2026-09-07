import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The codebase already uses a leading underscore to mark a binding as
      // deliberately unused (`_request` on routes that ignore their argument,
      // `_onChange` on the useSyncExternalStore subscribe no-op). Honor that
      // convention instead of flagging it.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Known debt, deliberately enumerated so it stays finite and visible.
    //
    // Both files read browser-only state (localStorage, userAgent) once after
    // hydration, which React's compiler lint flags as a synchronous setState in
    // an effect. The pattern works — it just costs one extra render. The proper
    // migration is useSyncExternalStore with a server snapshot, which this repo
    // already uses in src/components/site/TrackedPhone.tsx.
    //
    // Scoped to these two paths on purpose: a new occurrence anywhere else in
    // the codebase still fails the build.
    files: [
      "src/components/hq/InstallPrompt.tsx",
      "src/app/hq/components/NextActionCardClient.tsx",
    ],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Serwist emits a minified service worker into public/ at build time.
    // It's generated and gitignored, so linting it just reports noise from
    // whichever build ran last.
    "public/sw.js",
    "public/sw.js.map",
  ]),
]);

export default eslintConfig;
