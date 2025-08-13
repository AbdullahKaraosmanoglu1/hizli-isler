import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/*.spec.ts', '!**/*.e2e-spec.ts'],
    setupFiles: ['dotenv/config'],
};

export default config;
