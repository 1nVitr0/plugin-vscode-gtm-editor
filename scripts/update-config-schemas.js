const { resolve } = require("path");
const { promises: { writeFile, readFile } } = require("fs");
const TJS = require("typescript-json-schema");

console.info("Loading TypeScript compiler...");

/** @type Record<`gtm-editor.${string}`, string> */
const schemaTypes = {
  "gtm-editor.additionalFormats": "CustomFormatters",
  "gtm-editor.prettyPrint": "Pretty"
};

/** @type TJS.PartialArgs */
const settings = {
  ref: false,
  required: true,
  noExtraProps: true,
  ignoreErrors: true,
  out: resolve(__dirname, "./config-schema.json"),
};

/** @type TJS.CompilerOptions */
const compilerOptions = {
  strictNullChecks: true,
};

const basePath = resolve(__dirname, "../src");
const program = TJS.getProgramFromFiles(
  [resolve(basePath, "types/Formatter.ts")],
  compilerOptions,
  basePath
);
const generator = TJS.buildGenerator(program, settings);

console.info("Generating schemas...");
const schemas = Object.entries(schemaTypes).reduce((acc, [key, type]) => {
  console.info(`  => Generating schema for ${type}...`);
  const schema = TJS.generateSchema(program, type, settings, [], generator);
  acc[key] = schema;

  return acc;
}, {});

(async function () {
  console.info("Updating package.json...");

  const path = resolve(__dirname, "../package.json");
  const packageJson = await readFile(path, "utf8");
  const package = JSON.parse(packageJson);
  const configuration = package.contributes.configuration[0].properties;

  for (const [entry, schema] of Object.entries(schemas)) {
    console.info(`  => Updating schema for ${entry}...`);
    const configurationEntry = configuration[entry];
    const updatedEntry = { ...schema };
    if (!configurationEntry) throw new Error(`Missing configuration entry for ${entry}`);

    delete updatedEntry.$schema;
    configuration[entry] = {
      ...configurationEntry,
      ...updatedEntry,
    };
  }

  await writeFile(path, JSON.stringify(package, null, 2) + "\n", "utf8");

  console.info("Done!");
})();