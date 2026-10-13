const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");
const project = path.resolve(__dirname, "..");
const originalCwd = process.cwd();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "bidrano-audit-"));
process.chdir(temporary);
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, filename);
};
const { isOrder, isCustomer, MAX_JSON_BYTES } = require(path.join(project, "lib/validation.ts"));
const { orderData, contentData, customerData } = require(path.join(project, "lib/data.ts"));
const { apiRequest, ApiError } = require(path.join(project, "lib/api-client.ts"));
const server = require(path.join(project, "lib/server/customers.ts"));
const response = require(path.join(project, "lib/server/api-response.ts"));
const routes = require(path.join(project, "app/api/v1/customers/route.ts"));
const byId = require(path.join(project, "app/api/v1/customers/[id]/route.ts"));
const order = { id: "ORD-audit", customerId: "dental-demo", customerName: "Customer", topic: "Topic", contentType: "Carousel", status: "review", createdAt: "2026-10-13T00:00:00Z", currentStep: 5, pipeline: ["a", "b", "c", "d", "e"] };
class Storage {
  constructor(entries = []) { this.items = new Map(entries); this.fail = null; }
  get length() { return this.items.size; }
  key(index) { return [...this.items.keys()][index] || null; }
  getItem(key) { return this.items.get(key) ?? null; }
  setItem(key, value) {
    if (this.fail === key) { this.fail = null; throw new Error("Quota exceeded"); }
    this.items.set(key, value);
  }
  removeItem(key) { this.items.delete(key); }
}
test("malformed persisted orders and optional customer fields are rejected", () => {
  assert.equal(isOrder(order), true);
  for (const change of [{ topic: {} }, { currentStep: -1 }, { currentStep: 99 }, { createdAt: "bad" }, { status: "unknown" }, { pipeline: null }]) {
    assert.equal(isOrder({ ...order, ...change }), false);
  }
  assert.equal(isCustomer({ id: "x", name: "N", field: "F", audience: "", tone: "", initials: "N", status: "Active", rules: {} }), false);
  global.localStorage = new Storage([["bidrano_order_bad", JSON.stringify({ id: "bad", status: "review" })]]);
  assert.equal(orderData.get("bad"), null);
});
test("failed order save restores both previous storage values", () => {
  const prior = JSON.stringify({ ...order, topic: "Previous" });
  global.localStorage = new Storage([["bidrano_order_" + order.id, prior], ["bidrano_current_order", prior]]);
  localStorage.fail = "bidrano_current_order";
  assert.throws(() => orderData.save(order));
  assert.equal(localStorage.getItem("bidrano_order_" + order.id), prior);
  assert.equal(localStorage.getItem("bidrano_current_order"), prior);
});
test("current-only legacy orders are read only for their exact ID", () => {
  global.localStorage = new Storage([["bidrano_current_order", JSON.stringify(order)]]);
  assert.equal(orderData.get(order.id).id, order.id);
  assert.equal(orderData.get("unknown"), null);
});
test("failed approval restores memory and leaves the order in review", () => {
  const prior = JSON.stringify(order);
  global.localStorage = new Storage([["bidrano_content_memory", "[]"], ["bidrano_order_" + order.id, prior]]);
  localStorage.fail = "bidrano_order_" + order.id;
  assert.throws(() => contentData.approve({ ...order, status: "approved" }));
  assert.equal(localStorage.getItem("bidrano_content_memory"), "[]");
  assert.equal(orderData.get(order.id).status, "review");
});
test("approved memory is deduplicated and can provide content detail", () => {
  const approved = { ...order, status: "approved" };
  global.localStorage = new Storage([["bidrano_content_memory", JSON.stringify([approved, approved, { id: "bad", topic: {} }])]]);
  assert.equal(contentData.memory().filter((item) => item.id === order.id).length, 1);
  assert.equal(contentData.get(order.id).status, "approved");
});
test("validation rejects unknown keys including prototype names", () => {
  assert.throws(() => server.parseCustomerInput(JSON.parse('{"name":"N","field":"F","__proto__":"bad"}')));
  assert.throws(() => server.parseCustomerInput({ name: "", field: "F" }));
  assert.throws(() => server.parseCustomerInput({ name: "N", field: "F", rules: {} }));
});
test("concurrent writes preserve customers and creation retries are idempotent", async () => {
  await Promise.all(Array.from({ length: 12 }, (_, i) => server.createCustomer({ name: "Name " + i, field: "Field" })));
  assert.equal((await server.listCustomers()).length, 15);
  const key = "00000000-0000-4000-8000-000000000001";
  const one = await server.createCustomer({ name: "Repeat", field: "Field" }, key);
  const two = await server.createCustomer({ name: "Repeat", field: "Field" }, key);
  assert.equal(one.id, two.id);
  assert.equal((await server.listCustomers()).length, 16);
  await assert.rejects(server.createCustomer({ name: "Different", field: "Field" }, key), server.CustomerConflictError);
});
test("imports do not replace an edited server customer or duplicate IDs", async () => {
  const existing = (await server.listCustomers())[0];
  await server.updateCustomer(existing.id, { name: "Edited" });
  await server.importCustomers([{ ...existing, name: "Old" }], { name: "Legacy", field: "Legacy" });
  assert.equal((await server.listCustomers()).find((item) => item.id === existing.id).name, "Edited");
});
test("corrupt server data is not silently reset or overwritten", async () => {
  const filename = path.join(temporary, ".bidrano-data/customers.json");
  const previous = fs.readFileSync(filename, "utf8");
  fs.writeFileSync(filename, '{"broken":true}');
  try {
    await assert.rejects(server.createCustomer({ name: "N", field: "F" }));
    assert.equal(fs.readFileSync(filename, "utf8"), '{"broken":true}');
  } finally { fs.writeFileSync(filename, previous); }
});
test("customer handlers paginate, validate queries, and return a real not-found", async () => {
  const first = await routes.GET(new Request("http://localhost/api/v1/customers?limit=2"));
  const payload = await first.json();
  assert.equal(first.status, 200);
  assert.equal(payload.data.length, 2);
  assert.ok(payload.meta.nextCursor);
  assert.equal((await routes.GET(new Request("http://localhost/api/v1/customers?limit=0"))).status, 400);
  assert.equal((await byId.GET(new Request("http://localhost/api/v1/customers/missing"), { params: Promise.resolve({ id: "missing" }) })).status, 404);
});
test("write requests require JSON, reject cross-origin requests, and enforce a streamed size limit", async () => {
  async function status(request) {
    try { await response.body(request); return 200; }
    catch (error) { return response.handleError(error).status; }
  }
  assert.equal(await status(new Request("http://localhost/api", { method: "POST", body: "{}" })), 415);
  assert.equal(await status(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://other.example" }, body: "{}" })), 403);
  assert.equal(await status(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" })), 400);
  assert.equal(await status(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: "x".repeat(MAX_JSON_BYTES + 1) })), 413);
});
test("non-JSON HTTP errors preserve their status and custom Headers are preserved", async () => {
  const previous = global.fetch;
  let calls = 0;
  global.fetch = async () => { calls++; return new Response("not found", { status: 404 }); };
  try {
    await assert.rejects(apiRequest("/missing"), (error) => error instanceof ApiError && error.status === 404);
    assert.equal(calls, 1);
    global.fetch = async (_url, options) => {
      assert.equal(options.headers.get("X-Test"), "kept");
      return Response.json({ data: [] });
    };
    await apiRequest("/list", { headers: new Headers({ "X-Test": "kept" }) });
  } finally { global.fetch = previous; }
});
test("legacy migration skips malformed records, batches large imports, and retains the original data", async () => {
  const previous = global.fetch;
  const legacy = [...Array.from({ length: 205 }, (_, i) => ({ id: "customer-" + i, name: "Name", field: "Field", rules: "ق".repeat(10000) })),
    { id: "customer-9999", name: "Bad optional", field: "Field", rules: {} }, { id: "customer-9998", name: {}, field: "Field" }];
  const raw = JSON.stringify(legacy);
  global.localStorage = new Storage([["bidrano_customers", raw]]);
  const batches = [];
  global.fetch = async (url, options) => {
    if (url.endsWith("/import")) {
      assert.ok(Buffer.byteLength(options.body, "utf8") <= MAX_JSON_BYTES);
      const payload = JSON.parse(options.body);
      assert.ok(payload.customers.length <= 200);
      batches.push(payload.customers);
      return Response.json({ data: { imported: payload.customers.length } });
    }
    return Response.json({ data: [], meta: { nextCursor: null } });
  };
  try {
    await customerData.list();
    assert.ok(batches.length > 1);
    assert.equal(batches.flat().length, 206);
    assert.equal(localStorage.getItem("bidrano_customers"), raw);
  } finally { global.fetch = previous; }
});
test.after(() => {
  process.chdir(originalCwd);
  const resolved = fs.realpathSync(temporary);
  assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()));
  assert.ok(path.basename(resolved).startsWith("bidrano-audit-"));
  fs.rmSync(temporary, { recursive: true, force: true });
});
