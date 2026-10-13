import { isContentType } from "./models";
import type { Customer, CustomerForm, Order } from "./models";

export const MAX_JSON_BYTES = 128 * 1024;
export const CUSTOMER_FIELDS = ["name", "field", "audience", "tone", "phone", "address", "website", "instagram", "rules"] as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
export function isCustomer(value: unknown): value is Customer {
  if (!isRecord(value)) return false;
  return ["id", "name", "field", "audience", "tone", "initials"].every((key) => typeof value[key] === "string") &&
    Boolean(value.id && value.name && value.field) && value.status === "Active" &&
    ["location", "phone", "address", "website", "instagram", "rules"].every((key) =>
      value[key] === undefined || typeof value[key] === "string");
}
export function isOrder(value: unknown): value is Order {
  if (!isRecord(value)) return false;
  return ["id", "customerId", "customerName", "topic", "createdAt"].every((key) => typeof value[key] === "string") &&
    Boolean(value.id && value.customerId) && Number.isFinite(Date.parse(value.createdAt as string)) &&
    typeof value.contentType === "string" && isContentType(value.contentType) &&
    ["in-progress", "review", "approved", "revision"].includes(value.status as string) &&
    Array.isArray(value.pipeline) && value.pipeline.every((step) => typeof step === "string") &&
    Number.isInteger(value.currentStep) && (value.currentStep as number) >= 0 &&
    (value.currentStep as number) <= value.pipeline.length &&
    ["instructions", "revisionNote", "customerField"].every((key) => value[key] === undefined || typeof value[key] === "string") &&
    (value.source === undefined || ["Manual", "Today's Suggestion", "Start from a Topic"].includes(value.source as string)) &&
    (value.day === undefined || (Number.isInteger(value.day) && (value.day as number) >= 1 && (value.day as number) <= 31));
}
export function customerInitials(name: string): string {
  return name.split(/[\s\u200c]+/u).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase();
}
export function legacyCustomer(value: unknown): Customer | null {
  if (!isRecord(value) || typeof value.id !== "string" || !/^customer-\d+$/.test(value.id)) return null;
  const form = {} as CustomerForm;
  for (const key of CUSTOMER_FIELDS) {
    const text = typeof value[key] === "string" ? (value[key] as string).trim() : "";
    form[key] = text.length <= (key === "rules" ? 10000 : 2000) ? text : "";
  }
  if (!form.name || !form.field) return null;
  return { ...form, id: value.id, status: "Active", initials: customerInitials(form.name) };
}
