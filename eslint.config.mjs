import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: [".next/**", ".open-next/**", ".wrangler-dry-run/**", "node_modules/**"] },
  ...nextVitals
];

export default eslintConfig;
