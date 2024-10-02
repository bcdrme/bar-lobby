module.exports = {
    root: true,
    env: {
        node: true,
    },
    globals: {
        defineProps: "readonly",
        defineEmits: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
        api: "readonly",
    },
    ignorePatterns: ["dist", "build", "dist_electron", "node_modules", "src/routes.ts", "working-files", "**/*.js"],
    extends: ["eslint:recommended", "@vue/typescript/recommended", "plugin:vue/vue3-recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    parser: "vue-eslint-parser",
    parserOptions: {
        ecmaVersion: 2020,
    },
    plugins: ["vue", "@typescript-eslint", "unused-imports", "simple-import-sort"],
    rules: {
        "no-console": "off",
        "no-restricted-imports": [
            "error",
            {
                patterns: [".*"],
            },
        ],

        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/ban-ts-comment": "off",

        "vue/no-v-model-argument": "off",
        "vue/multi-word-component-names": "off",
        "vue/no-multiple-template-root": "off",
        "vue/attribute-hyphenation": ["error", "never"],

        "unused-imports/no-unused-imports": "error",

        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
    },
};