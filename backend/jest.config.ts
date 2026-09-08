import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import ts from 'typescript';

// tsconfig.json に定義された Path Alias を読み込む
// 例: @app/*, @libs/* など
const { config: tsconfig } = ts.readConfigFile(
  './tsconfig.json',
  ts.sys.readFile,
);

const paths =
  tsconfig?.compilerOptions?.paths ?? {};

const config: Config = {
  // Jestが対象とするファイル拡張子
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],

  // backendディレクトリを基準とする
  rootDir: '.',

  // *.spec.ts をテスト対象とする
  testRegex: '.*\\.spec\\.ts$',

  /**
   * TypeScriptをESMとして変換する。
   *
   * 現在のtsconfig.jsonが
   * module: nodenext
   * なので、Jest側もESMへ合わせる。
   */
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: './tsconfig.spec.json',
      },
    ],
  },

  // .tsファイルをES Moduleとして扱う
  extensionsToTreatAsEsm: [
    '.ts',
  ],

  /**
   * TypeScriptのPath Aliasを
   * Jestでも利用可能にする。
   */
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      paths,
      {
        prefix: '<rootDir>/',
      },
    ),

    /**
     * NodeNext / ESM環境で
     * import末尾に.jsが付く場合への対応。
     */
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    'libs/**/*.(t|j)s',
    'apps/**/*.(t|j)s',
  ],

  coverageDirectory:
    './coverage',

  testEnvironment: 'node',
};

export default config;