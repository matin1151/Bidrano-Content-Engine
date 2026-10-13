import { CONTENT_ITEMS, MEMORY_ITEMS, NADERI_PROFILE } from "./mock-data";
import { CUSTOMER_FIELDS, isCustomer, isOrder, legacyCustomer, MAX_JSON_BYTES } from "./validation";
import { ApiError, apiRequest } from "./api-client";
import type { CustomerForm } from "./models";
import type { BrandProfile, ContentItem, Customer, CustomerProfile, CustomerSummary, MemoryItem, Order, OrderStatus } from "./models";

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeBatch(entries: [string, unknown][]): void {
  const writes = entries.map(([key, value]) => ({ key, value: JSON.stringify(value), previous: localStorage.getItem(key) }));
  const applied: typeof writes = [];
  try {
    for (const write of writes) {
      localStorage.setItem(write.key, write.value);
      applied.push(write);
    }
    if (typeof window !== "undefined") window.dispatchEvent(new Event("bidrano-data-change"));
  } catch (error) {
    for (const write of applied.reverse()) {
      try {
        if (write.previous === null) localStorage.removeItem(write.key);
        else localStorage.setItem(write.key, write.previous);
      } catch {}
    }
    throw error;
  }
}

let legacyImport: Promise<void> | undefined;
function importLegacyCustomers(): Promise<void> {
  if (legacyImport) return legacyImport;
  legacyImport = (async () => {
    const saved = readJson("bidrano_customers");
    const customers = Array.isArray(saved) ? saved.map(legacyCustomer).filter((item): item is Customer => item !== null) : [];
    const savedProfile = readJson("bidrano_naderi_profile");
    let profile: CustomerForm | undefined;
    if (savedProfile && typeof savedProfile === "object" && !Array.isArray(savedProfile)) {
      const values = savedProfile as Record<string, unknown>;
      const merged = Object.fromEntries(Object.entries(NADERI_PROFILE).map(([key, fallback]) =>
        [key, typeof values[key] === "string" ? values[key] : fallback]
      )) as BrandProfile;
      const { brand, business, ...fields } = merged;
      const normalized = legacyCustomer({ ...fields, name: brand, field: business, id: "customer-0" });
      if (normalized) profile = Object.fromEntries(CUSTOMER_FIELDS.map((key) => [key, normalized[key] || ""])) as CustomerForm;
    }
    const send = (batch: Customer[], profile?: CustomerForm) => apiRequest("/api/v1/customers/import", {
      method: "POST", body: JSON.stringify({ customers: batch, profile }),
    });
    if (profile) await send([], profile);
    let batch: Customer[] = [];
    for (const customer of customers) {
      if (batch.length === 200 || new TextEncoder().encode(JSON.stringify({ customers: [...batch, customer] })).length > MAX_JSON_BYTES) {
        await send(batch);
        batch = [];
      }
      batch.push(customer);
    }
    if (batch.length) await send(batch);
  })().catch((error) => { legacyImport = undefined; throw error; });
  return legacyImport;
}

export const customerData = {
  async list(signal?: AbortSignal): Promise<Customer[]> {
    await importLegacyCustomers();
    const customers: Customer[] = [];
    const cursors = new Set<string>();
    let cursor: string | null | undefined;
    do {
      const response = await apiRequest<Customer[]>("/api/v1/customers?limit=100" +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""), { signal });
      if (!Array.isArray(response.data) || !response.data.every(isCustomer)) throw new ApiError("Invalid customer response", 502);
      customers.push(...response.data);
      cursor = response.meta?.nextCursor;
      if (cursor) {
        if (typeof cursor !== "string" || cursors.has(cursor)) throw new ApiError("Invalid pagination response", 502);
        cursors.add(cursor);
      }
    } while (cursor);
    return customers;
  },
  async summaries(signal?: AbortSignal): Promise<CustomerSummary[]> {
    return (await this.list(signal)).map(({ id, name, field }) => ({ id, name, field }));
  },
  async profile(id: string, signal?: AbortSignal): Promise<CustomerProfile | null> {
    await importLegacyCustomers();
    try {
      const { data: customer } = await apiRequest<Customer>("/api/v1/customers/" + encodeURIComponent(id), { signal });
      if (!isCustomer(customer)) throw new ApiError("Invalid customer response", 502);
      return { name: customer.name, field: customer.field, audience: customer.audience,
        tone: customer.tone, initials: customer.initials, location: customer.location || customer.address || "" };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  async create(form: CustomerForm, key = crypto.randomUUID()): Promise<Customer> {
    await importLegacyCustomers();
    const { data } = await apiRequest<Customer>("/api/v1/customers", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify(form) });
    if (!isCustomer(data)) throw new ApiError("Invalid customer response", 502);
    return data;
  },
  async brandProfile(signal?: AbortSignal): Promise<BrandProfile> {
    await importLegacyCustomers();
    const { data: customer } = await apiRequest<Customer>("/api/v1/customers/dental-demo", { signal });
    if (!isCustomer(customer)) throw new ApiError("Invalid customer response", 502);
    return { brand: customer.name, business: customer.field, audience: customer.audience,
      tone: customer.tone, phone: customer.phone || "", address: customer.address || "",
      website: customer.website || "", instagram: customer.instagram || "", rules: customer.rules || "" };
  },
  async saveBrandProfile(profile: BrandProfile): Promise<void> {
    const { brand, business, ...fields } = profile;
    await apiRequest<Customer>("/api/v1/customers/dental-demo", {
      method: "PATCH", body: JSON.stringify({ ...fields, name: brand, field: business }),
    });
  },
};

export const orderData = {
  get(id: string): Order | null {
    const saved = readJson(`bidrano_order_${id}`);
    if (isOrder(saved) && saved.id === id) return saved;
    const current = readJson("bidrano_current_order");
    return isOrder(current) && current.id === id ? current : null;
  },
  current(): Order | null {
    const saved = readJson("bidrano_current_order");
    return isOrder(saved) ? saved : null;
  },
  list(): Order[] {
    const orders = new Map<string, Order>(CONTENT_ITEMS.map((item) => [item.id, item]));
    const current = this.current();
    if (current) orders.set(current.id, current);
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("bidrano_order_")) continue;
        const order = this.get(key.slice("bidrano_order_".length));
        if (order) orders.set(order.id, order);
      }
    } catch {}
    return [...orders.values()];
  },
  findByStatus(status: OrderStatus, id?: string): Order | null {
    return this.list().find((order) => (!id || order.id === id) && order.status === status) || null;
  },
  save(order: Order): void {
    writeBatch([[`bidrano_order_${order.id}`, order], ["bidrano_current_order", order]]);
  },
  update(order: Order): void {
    writeBatch([[`bidrano_order_${order.id}`, order], ...(this.current()?.id === order.id ? [["bidrano_current_order", order] as [string, unknown]] : [])]);
  },
};

export const contentData = {
  get(id: string): ContentItem | null {
    const memory = readJson("bidrano_content_memory");
    return orderData.get(id) || (Array.isArray(memory) ? memory.find((item) => isOrder(item) && item.id === id) : null) || CONTENT_ITEMS.find((item) => item.id === id) || null;
  },
  memory(): MemoryItem[] {
    const saved = readJson("bidrano_content_memory");
    const approved = Array.isArray(saved) ? saved.filter((item) =>
      isOrder(item) && item.status === "approved"
    ).map((item) => ({ id: item.id, title: item.topic, customer: item.customerName })) as MemoryItem[] : [];
    return [...new Map([...MEMORY_ITEMS, ...approved].map((item) => [item.id, item])).values()];
  },
  approve(item: ContentItem): void {
    const saved = readJson("bidrano_content_memory");
    if (!isOrder(item) || item.status !== "approved") throw new Error("Invalid approved content");
    const existing = Array.isArray(saved) ? saved.filter((entry) => isOrder(entry) && entry.status === "approved" && entry.id !== item.id) : [];
    writeBatch([
      ["bidrano_content_memory", [...existing, item]], [`bidrano_order_${item.id}`, item],
      ...(orderData.current()?.id === item.id ? [["bidrano_current_order", item] as [string, unknown]] : []),
    ]);
  },
};
