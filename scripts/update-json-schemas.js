const { resolve, join } = require("path");
const { promises: { writeFile, readFile } } = require("fs");
const TJS = require("typescript-json-schema");

/** @type string[] */
const exportSchemas = [
  "GtmExport",
  "GtmContainer",
  "GtmTag",
  "GtmTrigger",
  "GtmVariable",
  "GtmFolder",
  "GtmBuiltInVariable",
  "GtmCustomTemplate",
];

const schemaPath = resolve(__dirname, "../resources/schemas");

console.info("Loading TypeScript compiler...");

/** @type TJS.PartialArgs */
const settings = {
  ref: true,
  required: true,
  noExtraProps: true,
  ignoreErrors: true,
  out: join(schemaPath, "gtm-export.schema.json"),
};

/** @type TJS.CompilerOptions */
const compilerOptions = {
  strictNullChecks: true,
};

const basePath = resolve(__dirname, "../src");
const program = TJS.getProgramFromFiles(
  [resolve(basePath, "types/gtm/GtmExport.ts")],
  compilerOptions,
  basePath
);
const generator = TJS.buildGenerator(program, settings);

console.info("Generating schema...");
const schemas = exportSchemas.map((name) => {
  const schema = TJS.generateSchema(program, name, settings, [], generator);
  const data = JSON.stringify(schema, null, 2);
  return {
    name,
    promise: writeFile(join(schemaPath, `${name}.schema.json`), data, "utf8"),
  };
});

console.info("Writing schema...");
Promise.all(schemas.map(({ name, promise }) => {
  console.info(`  ✓ Wrote ${name}.schema.json`);
  return promise;
})).then(() => console.info("Done"));