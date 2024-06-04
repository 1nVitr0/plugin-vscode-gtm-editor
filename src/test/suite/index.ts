import * as Mocha from "mocha";
import { glob } from "glob";
import { resolve } from "path";

export function run(): Promise<void> {
  return new Promise(async (c, e) => {
    const mocha = new Mocha({ ui: "tdd", color: true, timeout: 10000 });

    const files = await glob("**/**.test.js", { cwd: __dirname });
    files.forEach((f) => mocha.addFile(resolve(__dirname, f)));

    mocha.run((failures) => {
      if (failures > 0) e(new Error(`${failures} tests failed.`));
      else c();
    });
  });
}
