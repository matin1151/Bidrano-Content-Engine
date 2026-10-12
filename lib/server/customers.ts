import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { CUSTOMERS, NADERI_PROFILE } from "../mock-data";
import type { Customer, CustomerForm } from "../models";

const directory = path.join(process.cwd(), ".bidrano-data");
const file = path.join(directory, "customers.json");
const seed: Customer[] = CUSTOMERS.map((customer) => customer.id === "dental-demo" ? {
  ...customer, phone: NADERI_PROFILE.phone, address: NADERI_PROFILE.address,
  website: NADERI_PROFILE.website, instagram: NADERI_PROFILE.instagram, rules: NADERI_PROFILE.rules,
} : customer);

const storeGlobal = globalThis as typeof globalThis & { bidranoCustomerWrites?: Promise<unknown> };

export async function listCustomers(): Promise<Customer[]> {
  try {
    const value: unknown = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(value) || !value.every((item) =>
      item && typeof item.id === "string" && typeof item.name === "string" && typeof item.field === "string" &&
      typeof item.audience === "string" && typeof item.tone === "string" &&
      typeof item.initials === "string" && item.status === "Active"
    )) throw new Error("Invalid customer store");
    return value as Customer[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return seed.map((customer) => ({ ...customer }));
    throw error;
  }
}

// Serialize writes within the local server process and replace the file atomically.
function mutate<T>(operation: (customers: Customer[]) => T): Promise<T> {
  const result = (storeGlobal.bidranoCustomerWrites || Promise.resolve()).then(async () => {
    const customers = await listCustomers();
    const value = operation(customers);
    await mkdir(directory, { recursive: true });
    const temporary = path.join(directory, randomUUID() + ".tmp");
    await writeFile(temporary, JSON.stringify(customers, null, 2), "utf8");
    await rename(temporary, file);
    return value;
  });
  storeGlobal.bidranoCustomerWrites = result.catch(() => undefined);
  return result;
}

const fields = ["name", "field", "audience", "tone", "phone", "address", "website", "instagram", "rules"] as const;
export class CustomerValidationError extends Error {
  constructor(public fields: Record<string, string>) { super("Request validation failed"); }
}

export function parseCustomerInput(value: unknown, partial = false): Partial<CustomerForm> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CustomerValidationError({ body: "Expected an object" });
  }
  const input = value as Record<string, unknown>;
  const result: Partial<CustomerForm> = {};
  const errors: Record<string, string> = {};
  for (const key of Object.keys(input)) {
    if (!fields.includes(key as typeof fields[number])) errors[key] = "Unknown field";
  }
  for (const key of fields) {
    if (!(key in input)) {
      if (!partial && (key === "name" || key === "field")) errors[key] = "Required";
      continue;
    }
    if (typeof input[key] !== "string") { errors[key] = "Expected text"; continue; }
    const text = (input[key] as string).trim();
    const maximum = key === "rules" ? 10000 : 2000;
    if (text.length > maximum) errors[key] = "Text is too long";
    else if ((key === "name" || key === "field") && !text) errors[key] = "Required";
    else result[key] = text;
  }
  if (partial && !Object.keys(input).length) errors.body = "At least one field is required";
  if (Object.keys(errors).length) throw new CustomerValidationError(errors);
  return result;
}

function initials(name: string): string {
  return name.split(/[\s\u200c]+/u).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
}

export function createCustomer(input: Partial<CustomerForm>): Promise<Customer> {
  return mutate((customers) => {
    const customer: Customer = {
      id: "customer-" + randomUUID(), name: input.name!, field: input.field!,
      audience: input.audience || "", tone: input.tone || "", status: "Active",
      initials: initials(input.name!), ...input,
    };
    customers.push(customer);
    return customer;
  });
}

export function updateCustomer(id: string, input: Partial<CustomerForm>): Promise<Customer | null> {
  return mutate((customers) => {
    const index = customers.findIndex((customer) => customer.id === id);
    if (index < 0) return null;
    const customer = { ...customers[index], ...input };
    if (input.name !== undefined) customer.initials = initials(input.name);
    customers[index] = customer;
    return customer;
  });
}

export function importCustomers(customersToImport: Customer[], profile?: Partial<CustomerForm>) {
  return mutate((customers) => {
    let imported = 0;
    for (const customer of customersToImport) {
      if (!customers.some((item) => item.id === customer.id)) {
        customers.push(customer);
        imported++;
      }
    }
    const index = customers.findIndex((item) => item.id === "dental-demo");
    // Import the old profile only while the server still holds its untouched seed.
    if (profile && index >= 0 && JSON.stringify(customers[index]) === JSON.stringify(seed[0])) {
      customers[index] = { ...customers[index], ...profile };
      customers[index].initials = initials(customers[index].name);
    }
    return { imported };
  });
}
