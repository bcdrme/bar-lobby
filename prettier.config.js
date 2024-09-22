import jazTsUtilsConfig from "./node_modules/jaz-ts-utils/prettier.config";

export default {
    ...jazTsUtilsConfig,
    overrides: [
        {
            files: "src/**/*.vue",
            options: {
                printWidth: 140,
            },
        },
    ],
};
