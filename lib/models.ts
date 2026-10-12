export type CustomerStatus = "Active";

export type Customer = {
  id: string;
  name: string;
  field: string;
  status: CustomerStatus;
  initials: string;
  audience: string;
  tone: string;
  location?: string;
  phone?: string;
  address?: string;
  website?: string;
  instagram?: string;
  rules?: string;
};

export type CustomerSummary = Pick<Customer, "id" | "name" | "field">;
export type CustomerProfile = Pick<Customer, "name" | "field" | "audience" | "tone" | "initials" | "location">;
export type CustomerForm = Required<Pick<Customer,
  "name" | "field" | "audience" | "tone" | "phone" | "address" | "website" | "instagram" | "rules"
>>;

// The existing profile editor stores brand/business instead of name/field.
export type BrandProfile = Omit<CustomerForm, "name" | "field"> & {
  brand: Customer["name"];
  business: Customer["field"];
};

export const CONTENT_TYPES = ["Carousel", "Post", "Story", "Reel"] as const;
export type ContentType = typeof CONTENT_TYPES[number];
export function isContentType(value: string): value is ContentType {
  return CONTENT_TYPES.some((type) => type === value);
}

export type OrderStatus = "in-progress" | "review" | "approved" | "revision";
export type ReviewDecision = Extract<OrderStatus, "approved" | "revision">;
export type OrderMode = "manual" | "suggestion" | "topic";
export type OrderSource = "Manual" | "Today's Suggestion" | "Start from a Topic";

export type Order = {
  id: string;
  customerId: Customer["id"];
  customerName: Customer["name"];
  customerField?: Customer["field"];
  contentType: ContentType;
  topic: string;
  instructions?: string;
  source?: OrderSource;
  status: OrderStatus;
  createdAt: string;
  currentStep: number;
  pipeline: string[];
  revisionNote?: string;
};

// The prototype displays the production order itself as its content package.
export type ContentItem = Order & { day?: number };
export type MemoryItem = {
  id: ContentItem["id"];
  title: ContentItem["topic"];
  customer: ContentItem["customerName"];
};
export type Suggestion = { id: string; title: string; description: string };
