import { importCustomers, parseCustomerInput } from "../../../../../lib/server/customers";
import { body, failure, handleError, success } from "../../../../../lib/server/api-response";
import type { Customer } from "../../../../../lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Local prototype migration; existing server records are never replaced.
export async function POST(request: Request) {
  try {
    const value = await body(request);
    if (!value || typeof value !== "object" || Array.isArray(value)) return failure("VALIDATION_ERROR", "Invalid import", 400);
    const input = value as Record<string, unknown>;
    if (!Array.isArray(input.customers) || input.customers.length > 200) return failure("VALIDATION_ERROR", "Invalid customer list", 400);
    const customers: Customer[] = input.customers.map((item: Record<string, unknown>) => {
      if (!item || typeof item !== "object" || typeof item.id !== "string" || !/^customer-\d+$/.test(item.id)) {
        throw new Error("Invalid legacy ID");
      }
      const { id, initials, status, location, ...form } = item;
      const fields = parseCustomerInput(form);
      const name = fields.name!;
      return { ...fields, id: id as string, name, field: fields.field!, audience: fields.audience || "",
        tone: fields.tone || "", status: "Active",
        initials: name.split(/[\s\u200c]+/u).filter(Boolean).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase() };
    });
    const profile = input.profile ? parseCustomerInput(input.profile) : undefined;
    return success(await importCustomers(customers, profile));
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid legacy ID") return failure("VALIDATION_ERROR", error.message, 400);
    return handleError(error);
  }
}
