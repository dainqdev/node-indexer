import { parse } from "yaml";
import { loadTypesFromYaml, SuiTypesYaml } from "../generator";

export const CHECKPOINT_VERSION = "mainnet-v1.50.1";
const YAML_URL =
  "https://raw.githubusercontent.com/MystenLabs/sui/{version}/crates/sui-core/tests/staged/sui.yaml";

export async function get_type_definitions(version: string) {
  const response = await fetch(YAML_URL.replace("{version}", version));
  const yamlText = await response.text();
  return parse(yamlText) as SuiTypesYaml;
}

export async function initTypes() {
  const start = performance.now();
  const yaml = await get_type_definitions(CHECKPOINT_VERSION);
  loadTypesFromYaml(yaml);
  const done = performance.now();
  console.log('init type cost:', done - start);
}