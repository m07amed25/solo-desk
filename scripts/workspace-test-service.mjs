import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import crypto from "node:crypto";

// Real server modules; only request/provider/framework adapters are replaced in tests.
export function loadServerModule(path, adapters = {}, env = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name === "server-only") return {};
      if (name === "node:crypto") return crypto;
      if (name in adapters) return adapters[name];
      throw new Error(`Unexpected test dependency: ${name}`);
    },
    process: { env }, Buffer, Date, Intl, Array, BigInt, Set, String, JSON, URL,
  });
  return exports;
}
