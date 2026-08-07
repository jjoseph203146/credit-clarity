import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// ESLint 9 flat config. Next 16 requires ESLint >= 9, which dropped the
// .eslintrc format this project used previously. eslint-config-next@16 ships
// flat-native, so it is spread in directly — no FlatCompat bridge needed.
const config = [
  {
    // `next lint` (removed in Next 16) only ever linted the app source. The
    // replacement `eslint .` walks the whole repo, which would otherwise pull
    // in loose design-reference files at the root (support.js, ios-frame.jsx)
    // that are not part of the build — tsconfig and tailwind.config both scope
    // to src/ only.
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "support.js",
      "ios-frame.jsx",
      "public/**",
    ],
  },
  ...nextCoreWebVitals,
];

export default config;
