import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { CUSTOMERS, NADERI_PROFILE } from "../mock-data";
import { CUSTOMER_FIELDS, customerInitials, isCustomer } from "../validation";
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
    if (!Array.isArray(value) || !value.every(isCustomer) || new Set(value.map((item) => item.id)).size !== value.length) throw new Error("Invalid customer store");
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
    if (value === null) return value;
    await mkdir(directory, { recursive: true });
    const temporary = path.join(directory, randomUUID() + ".tmp");
    try {
      await writeFile(temporary, JSON.stringify(customers, null, 2), "utf8");
      await rename(temporary, file);
    } finally { await unlink(temporary).catch(() => undefined); }
    return value;
  });
  storeGlobal.bidranoCustomerWrites = result.catch(() => undefined);
  return result;
}

const fields = CUSTOMER_FIELDS;
export class CustomerValidationError extends Error {
  constructor(public fields: Record<string, string>) { super("Request validation failed"); }
}
export class CustomerConflictError extends Error {}

export function parseCustomerInput(value: unknown, partial = false): Partial<CustomerForm> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new CustomerValidationError({ body: "Expected an object" });
  }
  const input = value as Record<string, unknown>;
  const result: Partial<CustomerForm> = {};
  const errors: Record<string, string> = Object.create(null);
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


export function createCustomer(input: Partial<CustomerForm>, key?: string): Promise<Customer> {
  if (key && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    throw new CustomerValidationError({ "Idempotency-Key": "Use a UUID" });
  }
  return mutate((customers) => {
    const id = "customer-" + (key || randomUUID());
    const existing = customers.find((customer) => customer.id === id);
    if (existing) {
      if (!fields.every((field) => (existing[field] || "") === (input[field] || ""))) {
        throw new CustomerConflictError("The creation key was used for different customer data");
      }
      return existing;
    }
    const customer: Customer = {
      id, name: input.name!, field: input.field!,
      audience: input.audience || "", tone: input.tone || "", status: "Active",
      initials: customerInitials(input.name!), ...input,
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
    if (input.name !== undefined) customer.initials = customerInitials(input.name);
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
      customers[index].initials = customerInitials(customers[index].name);
    }
    return { imported };
  });
}
