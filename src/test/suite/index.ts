import * as Mocha from "mocha";
import { glob } from "glob";
import { resolve } from "path";

export function run(): Promise<void> {
  return new Promise(async (c, e) => {
    const mocha = new Mocha({ ui: "tdd", color: true });

    const testsRoot = resolve(__dirname, "..");
    const files = await glob("**/**.test.js", { cwd: testsRoot });
    files.forEach((f) => mocha.addFile(resolve(testsRoot, f)));

    mocha.run((failures) => {
      if (failures > 0) e(new Error(`${failures} tests failed.`));
      else c();
    });
  });
}
