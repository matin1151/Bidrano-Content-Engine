import { createCustomer, listCustomers, parseCustomerInput } from "../../../../lib/server/customers";
import { body, failure, handleError, success } from "../../../../lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const rawLimit = query.get("limit") || "20";
    const limit = Number(rawLimit);
    if (!/^\d+$/.test(rawLimit) || limit < 1 || limit > 100) {
      return failure("VALIDATION_ERROR", "Invalid limit", 400, { limit: "Use a number from 1 to 100" });
    }
    const customers = await listCustomers();
    const cursor = query.get("cursor");
    const cursorIndex = cursor ? customers.findIndex((customer) => customer.id === cursor) : -1;
    if (cursor && cursorIndex < 0) return failure("VALIDATION_ERROR", "Invalid cursor", 400);
    const start = cursorIndex + 1;
    const page = customers.slice(start, start + limit);
    return success(page, 200, start + limit < customers.length ? page[page.length - 1].id : null);
  } catch (error) { return handleError(error); }
}

export async function POST(request: Request) {
  try {
    const input = parseCustomerInput(await body(request));
    return success(await createCustomer(input), 201);
  } catch (error) { return handleError(error); }
}
