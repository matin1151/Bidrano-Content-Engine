import { CONTENT_ITEMS, CUSTOMERS, MEMORY_ITEMS, NADERI_PROFILE, normalizeCustomerId } from "./mock-data";
import type { BrandProfile, ContentItem, Customer, CustomerProfile, CustomerSummary, MemoryItem, Order, OrderStatus } from "./models";

function readJson(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function savedCustomers(): Customer[] {
  const saved = readJson("bidrano_customers");
  return Array.isArray(saved) ? saved.filter((item): item is Customer =>
    Boolean(item && typeof item.id === "string" && typeof item.name === "string" && typeof item.field === "string")
  ) : [];
}

export const customerData = {
  list(): Customer[] {
    return [...CUSTOMERS, ...savedCustomers()];
  },
  summaries(): CustomerSummary[] {
    const custom = savedCustomers().map(({ id, name, field }) => ({
      id: normalizeCustomerId(id), name, field,
    })).filter((item) => !CUSTOMERS.some((base) => base.id === item.id));
    return [...CUSTOMERS, ...custom];
  },
  profile(id: string): CustomerProfile | null {
    const customer = this.list().find((item) => item.id === id);
    if (!customer) return null;
    return {
      name: customer.name, field: customer.field,
      audience: customer.audience || "", tone: customer.tone || "",
      initials: customer.initials || "", location: customer.location || customer.address || "",
    };
  },
  create(customer: Customer): void {
    localStorage.setItem("bidrano_customers", JSON.stringify([...savedCustomers(), customer]));
  },
  brandProfile(): BrandProfile {
    const saved = readJson("bidrano_naderi_profile");
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return NADERI_PROFILE;
    const values = saved as Record<string, unknown>;
    return Object.fromEntries(Object.entries(NADERI_PROFILE).map(([key, fallback]) =>
      [key, typeof values[key] === "string" ? values[key] : fallback]
    )) as BrandProfile;
  },
  saveBrandProfile(profile: BrandProfile): void {
    localStorage.setItem("bidrano_naderi_profile", JSON.stringify(profile));
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
