const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const args = process.argv.slice(2);
const newVersionArg = args.find((arg) => arg.startsWith("--new-version="));
if (!newVersionArg) {
  console.error(
    "Error: Provide --new-version=<version> (ex: --new-version=0.4.0)"
  );
  process.exit(1);
}
const newVersion = newVersionArg.split("=")[1].trim();

if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error(
    "Error: Version must be in the format major.minor.patch (ex: 0.4.0)"
  );
  process.exit(1);
}

console.log(`Updating version to ${newVersion}...`);

const packagePath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
execSync("npm install");
console.log("package.json and package-lock.json updated.");

const cargoPath = path.join(__dirname, "..", "src-tauri", "Cargo.toml");
let cargoContent = fs.readFileSync(cargoPath, "utf8");
cargoContent = cargoContent.replace(
  /version = "\d+\.\d+\.\d+"/,
  `version = "${newVersion}"`
);
fs.writeFileSync(cargoPath, cargoContent);
console.log("Cargo.toml updated.");

const tauriPath = path.join(__dirname, "..", "src-tauri", "tauri.conf.json");
const tauriJson = JSON.parse(fs.readFileSync(tauriPath, "utf8"));
tauriJson.version = newVersion;
fs.writeFileSync(tauriPath, JSON.stringify(tauriJson, null, 2) + "\n");
console.log("tauri.conf.json updated.");

console.log(
  `Version updated successfully to ${newVersion}. You can now proceed with the build.`
);
