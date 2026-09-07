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
  {
    // NAP (name, address, phone) has exactly one owner: src/lib/site.ts.
    //
    // It had drifted into 48 hardcoded copies across email templates, metadata
    // descriptions, data files and the quote PDF — so changing the phone number
    // meant editing 20+ files, and local-SEO NAP consistency is a ranking
    // factor. This rule keeps it at zero.
    //
    // Deliberately narrow: it bans the phone number in any form and the fully
    // composed one-line address. Bare prose mentions of the street ("our shop
    // sits on Tem-Bel Ln") are allowed — those are sentences, not addresses,
    // and interpolating a constant into them reads badly.
    // Tests are exempt: pinning the literal expected value is the whole point
    // of asserting on it. A test that only compares SITE to SITE would pass
    // even if SITE itself were wrong.
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/lib/site.ts", "src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/254-?346-?7764/]",
          message: "Hardcoded phone number. Use SITE.phone / SITE.phoneHref from @/lib/site.",
        },
        {
          selector: "TemplateElement[value.raw=/254-?346-?7764/]",
          message: "Hardcoded phone number. Use ${SITE.phone} from @/lib/site.",
        },
        {
          selector: "JSXText[value=/254-?346-?7764/]",
          message: "Hardcoded phone number. Use {SITE.phone} from @/lib/site.",
        },
        {
          selector: "Literal[value=/3319 Tem-Bel Ln,\\s*Temple/]",
          message: "Hardcoded address. Use SITE.addressOneLine from @/lib/site.",
        },
        {
          selector: "TemplateElement[value.raw=/3319 Tem-Bel Ln,\\s*Temple/]",
          message: "Hardcoded address. Use ${SITE.addressOneLine} from @/lib/site.",
        },
        {
          selector: "JSXText[value=/3319 Tem-Bel Ln,\\s*Temple/]",
          message: "Hardcoded address. Use {SITE.addressOneLine} from @/lib/site.",
        },
      ],
    },
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
