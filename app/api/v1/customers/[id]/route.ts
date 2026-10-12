import { listCustomers, parseCustomerInput, updateCustomer } from "../../../../../lib/server/customers";
import { body, failure, handleError, success } from "../../../../../lib/server/api-response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const customer = (await listCustomers()).find((item) => item.id === id);
    return customer ? success(customer) : failure("NOT_FOUND", "Customer not found", 404);
  } catch (error) { return handleError(error); }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const { id } = await params;
    const input = parseCustomerInput(await body(request), true);
    const customer = await updateCustomer(id, input);
    return customer ? success(customer) : failure("NOT_FOUND", "Customer not found", 404);
  } catch (error) { return handleError(error); }
}
