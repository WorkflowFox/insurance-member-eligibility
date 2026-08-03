const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

// Workaround: @salesforce/sfdx-lwc-jest@8.0.0's bundled resolver maps the
// bare `lwc` specifier to `require.resolve('@lwc/engine-dom')`, which now
// resolves to that package's ESM `main` (`dist/index.js`) since
// @lwc/engine-dom 9.x declares `"type": "module"`. Jest's default
// transformIgnorePatterns excludes node_modules, so the ESM file fails to
// parse ("Unexpected token 'export'"). Map `lwc` directly to the
// package's CommonJS build (`dist/index.cjs`, which @lwc/jest-resolver
// itself already prefers) so resolution bypasses the broken special case.
module.exports = {
    ...jestConfig,
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver'],
    moduleNameMapper: {
        ...(jestConfig.moduleNameMapper || {}),
        '^lwc$': require.resolve('@lwc/engine-dom/dist/index.cjs')
    },
    // This project lives under iCloud Drive (~/Library/Mobile Documents/...).
    // Jest's default haste-map file crawler shells out to `find`, which
    // hangs indefinitely walking an iCloud-synced node_modules tree.
    // Forcing the pure Node.js fs API crawler avoids that hang.
    haste: {
        forceNodeFilesystemAPI: true,
        enableSymlinks: false
    },
    watchman: false
};
