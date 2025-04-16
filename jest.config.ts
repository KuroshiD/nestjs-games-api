import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$', 
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', 
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.(t|j)s',           
    '!**/main.(t|j)s',             
    '!**/index.(t|j)s',             
    '!**/config/**',                
    '!**/migrations/**',            
    '!**/seeds/**',            
    '!**/ormconfig.(t|j)s',         
    '!**/entities/**',          
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ], 
  coverageDirectory: '../coverage', 
  testEnvironment: 'node', 
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/../',
  }),
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/seeds/',
    '/migrations/',
    '/config/',
    '\\.module\\.ts$',
    'main.ts',
    'ormconfig.ts'
  ],
};

export default config;