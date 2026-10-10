export type Customer = {
  id: string; name: string; field: string; status: string; initials: string;
  audience: string; tone: string; location: string;
};

export const CUSTOMERS: Customer[] = [
  { id: "dental-demo", name: "دکتر نادری", field: "دندانپزشکی", status: "Active", initials: "DN", audience: "بانوان و خانواده‌ها، ۲۵ تا ۴۵ سال", tone: "حرفه‌ای، صمیمی، اطمینان‌بخش", location: "تهران" },
  { id: "aria", name: "استودیو آریا", field: "عکاسی و برندینگ", status: "Active", initials: "AR", audience: "کسب‌وکارهای کوچک و برندهای شخصی", tone: "خلاق، حرفه‌ای، الهام‌بخش", location: "تهران" },
  { id: "savan", name: "سوان هانی", field: "عسل و محصولات طبیعی", status: "Active", initials: "SH", audience: "خانواده‌ها و خریداران محصولات طبیعی", tone: "گرم، طبیعی، قابل‌اعتماد", location: "ایران" },
];

export const NADERI_PROFILE = {
  brand: CUSTOMERS[0].name, business: CUSTOMERS[0].field,
  audience: CUSTOMERS[0].audience, tone: CUSTOMERS[0].tone,
  phone: "021-00000000", address: "تهران، منطقه ۲", website: "drnaderi.example",
  instagram: "@drnaderi", rules: "ادعاهای درمانی بدون منبع منتشر نشود.\nاز لحن ترساننده استفاده نشود.",
};

export const CONTENT_TYPES = ["Carousel", "Post", "Story", "Reel"] as const;
export const STATUS_LABELS: Record<string, string> = {
  "in-progress": "In Progress", review: "Needs Review", approved: "Approved", revision: "Revision",
};
export const STATUS_CLASSES: Record<string, string> = {
  "in-progress": "production", review: "review", approved: "approved", revision: "revision",
};
export const ROUTE_STATUS: Record<string, string> = {
  "in-progress": "in-progress", review: "review", "needs-review": "review",
  approved: "approved", completed: "approved", revision: "revision",
};
export const PIPELINE = ["Order Context", "Research", "Strategy & Copy", "Visual", "QA"];
export const PRODUCTION_SUMMARY = [
  { status: "in-progress", count: "08", text: "Active production orders" },
  { status: "review", count: "05", text: "Waiting for human review" },
  { status: "approved", count: "21", text: "Ready or published" },
];

export const CONTENT_ITEMS = [
  { id: "001", customerId: CUSTOMERS[0].id, customerName: CUSTOMERS[0].name, contentType: CONTENT_TYPES[0], topic: "۵ اشتباه رایج در مسواک زدن", day: 11, status: "approved", createdAt: "2026-10-03T00:00:00Z", currentStep: PIPELINE.length, pipeline: PIPELINE },
  { id: "002", customerId: CUSTOMERS[1].id, customerName: CUSTOMERS[1].name, contentType: CONTENT_TYPES[2], topic: "پشت صحنه عکاسی برند", day: 13, status: "approved", createdAt: "2026-10-05T00:00:00Z", currentStep: PIPELINE.length, pipeline: PIPELINE },
  { id: "003", customerId: CUSTOMERS[2].id, customerName: CUSTOMERS[2].name, contentType: CONTENT_TYPES[3], topic: "چطور عسل طبیعی را تشخیص دهیم؟", day: 15, status: "approved", createdAt: "2026-10-07T00:00:00Z", currentStep: PIPELINE.length, pipeline: PIPELINE },
];
export const MEMORY_ITEMS = CONTENT_ITEMS.filter((item) => item.status === "approved").map((item) => ({
  id: item.id, title: item.topic, customer: item.customerName,
}));
const weekdayFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", timeZone: "UTC" });
export const CALENDAR_DAYS = Array.from({ length: 7 }, (_, index) => {
  const day = index + 10;
  // Mehr 1, 1405 corresponds to September 23, 2026.
  return {
    day, date: new Intl.NumberFormat("fa-IR").format(day),
    weekday: weekdayFormatter.format(new Date(Date.UTC(2026, 8, 22 + day))),
    items: CONTENT_ITEMS.filter((item) => item.day === day),
  };
});

export type Suggestion = { id: string; title: string; description: string };
export const SUGGESTIONS: Record<string, Suggestion[]> = {
  "dental-demo": [
    {
      id: "dental-demo-1",
      title: "۳ نشانه که می‌گویند وقت چکاپ دندان رسیده",
      description: "Educational carousel for dental patients.",
    },
    {
      id: "dental-demo-2",
      title: "۵ اشتباه رایج در مسواک زدن",
      description: "Practical educational content for patients.",
    },
    {
      id: "dental-demo-3",
      title: "چرا با وجود مسواک زدن هنوز دندان‌ها آسیب می‌بینند؟",
      description: "Awareness content explaining common causes.",
    },
  ],
  aria: [
    {
      id: "aria-1",
      title: "۵ اشتباه رایج در عکاسی محصول برای اینستاگرام",
      description: "Educational content for product brands.",
    },
    {
      id: "aria-2",
      title: "قبل و بعد: نورپردازی چه چیزی را تغییر می‌دهد؟",
      description: "Visual comparison content.",
    },
    {
      id: "aria-3",
      title: "چطور برای یک برند عکس حرفه‌ای برنامه‌ریزی کنیم؟",
      description: "Practical content for business owners.",
    },
  ],
  savan: [
    {
      id: "savan-1",
      title: "چطور عسل طبیعی را از نمونه‌های تقلبی تشخیص دهیم؟",
      description: "Educational content for honey buyers.",
    },
    {
      id: "savan-2",
      title: "عسل گون چه ویژگی‌هایی دارد؟",
      description: "Product education and awareness.",
    },
    {
      id: "savan-3",
      title: "از کندو تا شیشه: مسیر تولید عسل سوان",
      description: "Brand storytelling content.",
    },
  ],
};


export function normalizeCustomerId(id: string) {
  return id === "naderi" ? "dental-demo" : id;
}
