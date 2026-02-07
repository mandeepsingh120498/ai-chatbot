import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildTenantIndex, searchIndex } from "../utils/vector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../../data/tenants");

const tenantMap = new Map();

const bootstrapTenants = () => {
  const files = fs.readdirSync(dataDir).filter((name) => name.endsWith(".json"));

  for (const file of files) {
    const raw = fs.readFileSync(path.join(dataDir, file), "utf-8");
    const tenant = JSON.parse(raw);

    tenantMap.set(tenant.tenantId, {
      ...tenant,
      index: buildTenantIndex(tenant.documents)
    });
  }
};

bootstrapTenants();

export const listTenants = () =>
  Array.from(tenantMap.values()).map(({ tenantId, name, description }) => ({
    tenantId,
    name,
    description
  }));

export const getTenant = (tenantId) => tenantMap.get(tenantId);

export const retrieveForTenant = (tenantId, query, topK = 3) => {
  const tenant = getTenant(tenantId);
  if (!tenant) return [];

  return searchIndex(tenant.index, query, topK).map(({ id, content, score }) => ({
    id,
    content,
    score
  }));
};
