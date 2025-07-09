import { parse } from "yaml";
import { loadTypesFromYaml, SuiTypesYaml } from "../generator/checkpoint.bcs";
import { SUI_VERSION } from "../envs/env";
import logger from "../lib/logger";

const YAML_URL =
  "https://raw.githubusercontent.com/MystenLabs/sui/{version}/crates/sui-core/tests/staged/sui.yaml";

export async function get_type_definitions(version: string) {
  const response = await fetch(YAML_URL.replace("{version}", version));
  const yamlText = await response.text();
  return parse(yamlText) as SuiTypesYaml;
}

let CURRENT_VERSION = SUI_VERSION;
let INITED_TYPES = false;

export async function initTypes() {
  const latestVersion = await getLastestVersion();
  if (latestVersion !== CURRENT_VERSION) {
    logger.warn("Version updating from %s to %s", CURRENT_VERSION, latestVersion)
    await upgradeSchema(latestVersion)
    logger.warn("Version updated from %s to %s", CURRENT_VERSION, latestVersion)
    CURRENT_VERSION = latestVersion;
  } else if (!INITED_TYPES) {
    await upgradeSchema(CURRENT_VERSION)
  }
  INITED_TYPES = true;
}

export async function requireInitialed() {
  if (!INITED_TYPES) {
    await initTypes()
  }
}

export async function upgradeSchema(version: string) {
  const start = performance.now();
  const yaml = await get_type_definitions(version);
  loadTypesFromYaml(version, yaml);
  const done = performance.now();
  logger.info("Generate schema from version %s cost: %s", version, done - start);
}

export async function checkUpdateTask() {
  return setInterval(async () => {
    const latestVersion = await getLastestVersion();
    if (latestVersion !== CURRENT_VERSION) {
      logger.warn("Version updating from %s to %s", CURRENT_VERSION, latestVersion)
      await upgradeSchema(latestVersion)
      logger.warn("Version updated from %s to %s", CURRENT_VERSION, latestVersion)
      CURRENT_VERSION = latestVersion;
    }
  }, 60_000 * 10) //check newest version every 10 minute
}

type SuiReleaseResponse = {
  tag_name: string;
  name: string;
};

async function getLastestVersion() {
  const res = await fetch(
    "https://api.github.com/repos/MystenLabs/sui/releases?per_page=1"
  ).then((res) => res.json()) as SuiReleaseResponse[];

  if (!res.length) {
    return CURRENT_VERSION
  }

  return res[0].tag_name
}
