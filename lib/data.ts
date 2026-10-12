import { CONTENT_ITEMS, MEMORY_ITEMS, NADERI_PROFILE } from "./mock-data";
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

let legacyImport: Promise<void> | undefined;
function importLegacyCustomers(): Promise<void> {
  if (legacyImport) return legacyImport;
  legacyImport = (async () => {
    const saved = readJson("bidrano_customers");
    const customers = Array.isArray(saved) ? saved.filter((item) =>
      item && typeof item.id === "string" && /^customer-\d+$/.test(item.id) &&
      typeof item.name === "string" && typeof item.field === "string"
    ) : [];
    const savedProfile = readJson("bidrano_naderi_profile");
    let profile: CustomerForm | undefined;
    if (savedProfile && typeof savedProfile === "object" && !Array.isArray(savedProfile)) {
      const values = savedProfile as Record<string, unknown>;
      const merged = Object.fromEntries(Object.entries(NADERI_PROFILE).map(([key, fallback]) =>
        [key, typeof values[key] === "string" ? values[key] : fallback]
      )) as BrandProfile;
      const { brand, business, ...fields } = merged;
      profile = { ...fields, name: brand, field: business };
    }
    if (customers.length || profile) {
      await apiRequest("/api/v1/customers/import", {
        method: "POST", body: JSON.stringify({ customers, profile }),
      });
    }
  })().catch((error) => { legacyImport = undefined; throw error; });
  return legacyImport;
}

export const customerData = {
  async list(signal?: AbortSignal): Promise<Customer[]> {
    await importLegacyCustomers();
    const customers: Customer[] = [];
    let cursor: string | null | undefined;
    do {
      const response = await apiRequest<Customer[]>("/api/v1/customers?limit=100" +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""), { signal });
      customers.push(...response.data);
      cursor = response.meta?.nextCursor;
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
      return { name: customer.name, field: customer.field, audience: customer.audience,
        tone: customer.tone, initials: customer.initials, location: customer.location || customer.address || "" };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },
  async create(form: CustomerForm): Promise<Customer> {
    return (await apiRequest<Customer>("/api/v1/customers", { method: "POST", body: JSON.stringify(form) })).data;
  },
  async brandProfile(signal?: AbortSignal): Promise<BrandProfile> {
    await importLegacyCustomers();
    const { data: customer } = await apiRequest<Customer>("/api/v1/customers/dental-demo", { signal });
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
    return saved && typeof saved === "object" && (saved as Order).id === id ? saved as Order : null;
  },
  current(): Order | null {
    const saved = readJson("bidrano_current_order");
    return saved && typeof saved === "object" && typeof (saved as Order).id === "string" ? saved as Order : null;
  },
  findByStatus(status: OrderStatus, id?: string): Order | null {
    if (id) {
      const direct = this.get(id);
      if (direct) return direct.status === status ? direct : null;
    }
    const current = this.current();
    if (current && (!id || current.id === id) && current.status === status) return current;
    if (id) return null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("bidrano_order_")) continue;
      const candidate = this.get(key.slice("bidrano_order_".length));
      if (candidate?.status === status) return candidate;
    }
    return null;
  },
  save(order: Order): void {
    localStorage.setItem(`bidrano_order_${order.id}`, JSON.stringify(order));
    localStorage.setItem("bidrano_current_order", JSON.stringify(order));
  },
  update(order: Order): void {
    localStorage.setItem(`bidrano_order_${order.id}`, JSON.stringify(order));
    if (this.current()?.id === order.id) {
      localStorage.setItem("bidrano_current_order", JSON.stringify(order));
    }
  },
};

export const contentData = {
  get(id: string): ContentItem | null {
    return orderData.get(id) || CONTENT_ITEMS.find((item) => item.id === id) || null;
  },
  memory(): MemoryItem[] {
    const saved = readJson("bidrano_content_memory");
    const approved = Array.isArray(saved) ? saved.filter((item) =>
      item?.status === "approved" && typeof item.id === "string" &&
      typeof item.topic === "string" && typeof item.customerName === "string"
    ).map((item) => ({ id: item.id, title: item.topic, customer: item.customerName })) as MemoryItem[] : [];
    return [...MEMORY_ITEMS.filter((item) => !approved.some((entry) => entry.id === item.id)), ...approved];
  },
  approve(item: ContentItem): void {
    const saved = readJson("bidrano_content_memory");
    const existing = Array.isArray(saved) ? saved.filter((entry) => entry?.id && entry.id !== item.id) : [];
    localStorage.setItem("bidrano_content_memory", JSON.stringify([...existing, item]));
    orderData.update(item);
  },
};
