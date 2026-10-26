import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addDays, invoiceStatus, invoiceTotals, nextNumber, quotationTotals } from "./calc";
import { applyTrack, createQuotation, defaultCompany, normalizeState, quotationToInvoice, sampleState, splitTags, toggleTag } from "./defaults";

const company = defaultCompany();

describe("billing numbers and dates", () => {
  it("continues the sequence per kind and year", () => {
    const docs = [
      { kind: "quotation" as const, number: "JD-QT-2026-001" },
      { kind: "quotation" as const, number: "JD-QT-2026-007" },
      { kind: "quotation" as const, number: "JD-QT-2025-040" },
      { kind: "invoice" as const, number: "JD-INV-2026-003" },
    ];
    assert.equal(nextNumber(docs, "quotation", 2026), "JD-QT-2026-008");
    assert.equal(nextNumber(docs, "invoice", 2026), "JD-INV-2026-004");
    assert.equal(nextNumber(docs, "invoice", 2027), "JD-INV-2027-001");
  });

  it("adds days across month ends", () => {
    assert.equal(addDays("2026-01-28", 7), "2026-02-04");
  });
});

describe("quotation", () => {
  it("defaults to a 50,000 BDT first year matching the milestone schedule", () => {
    const q = createQuotation({ company, docs: [], preset: "erp", today: "2026-10-26" });
    const t = quotationTotals(q);
    assert.deepEqual([t.oneTime, t.annual, t.firstYear, t.milestones], [42000, 8000, 50000, 50000]);
    assert.equal(q.number, "JD-QT-2026-001");
  });

  it("presets set the delivery card and timeline together", () => {
    const web = createQuotation({ company, docs: [], preset: "ecommerce" });
    assert.equal(web.kpis.find((k) => k.id === "delivery")?.value, "7–15 Days");
    assert.equal(web.timeline.phases[0].period, "Days 1–3");
    const sw = applyTrack(web, "software");
    assert.equal(sw.kpis.find((k) => k.id === "delivery")?.value, "15–30 Days");
    assert.equal(sw.timeline.phases[0].period, "Week 1");
  });

  it("toggles tech tags without splitting parentheses", () => {
    const text = "Official Meta API (Messenger, Instagram), Payment & Courier APIs";
    assert.deepEqual(splitTags(text), ["Official Meta API (Messenger, Instagram)", "Payment & Courier APIs"]);
    assert.equal(toggleTag(text, "Payment & Courier APIs"), "Official Meta API (Messenger, Instagram)");
    assert.equal(toggleTag("Next.js", "React"), "Next.js, React");
  });
});

describe("invoice", () => {
  it("totals discounts, tax and payments", () => {
    const totals = invoiceTotals({
      items: [
        { id: "a", title: "", description: "", billingType: "one-time", qty: 2, unitPrice: 1000, discount: 200, taxRate: 10 },
        { id: "b", title: "", description: "", billingType: "annual", qty: 1, unitPrice: 500, discount: 0, taxRate: 0 },
      ],
      payments: [{ id: "p", date: "2026-01-01", method: "bKash", reference: "", amount: 1000 }],
    });
    assert.deepEqual(totals, { subtotal: 2500, discount: 200, tax: 180, grandTotal: 2480, paid: 1000, balance: 1480 });
  });

  it("derives status from payments and due date", () => {
    const q = createQuotation({ company, docs: [], preset: "erp", today: "2026-10-01" });
    const inv = quotationToInvoice(q, { company, docs: [q], mode: "full", today: "2026-10-01" });
    assert.equal(inv.client.name, q.client.name);
    assert.equal(inv.deliveryNote, "Estimated Delivery: 15–30 Days from Advance Payment");
    assert.equal(invoiceTotals(inv).grandTotal, 50000);
    assert.equal(invoiceStatus(inv, "2026-10-02"), "unpaid");
    assert.equal(invoiceStatus(inv, "2026-10-20"), "overdue");
    inv.payments.push({ id: "p", date: "2026-10-01", method: "Bank Transfer", reference: "", amount: 20000 });
    assert.equal(invoiceStatus(inv, "2026-10-20"), "partial");
    inv.payments.push({ id: "q", date: "2026-10-05", method: "Cash", reference: "", amount: 30000 });
    assert.equal(invoiceStatus(inv), "paid");
    const milestones = quotationToInvoice(q, { company, docs: [q], mode: "milestones" });
    assert.deepEqual(
      milestones.items.map((i) => i.billingType),
      ["milestone", "milestone", "milestone"],
    );
  });
});

describe("store JSON", () => {
  it("round-trips the sample state and fills missing fields", () => {
    const state = sampleState("2026-10-26");
    const back = normalizeState(JSON.parse(JSON.stringify(state)));
    assert.equal(back?.documents.length, 4);
    const partial = normalizeState({ documents: [{ kind: "quotation", id: "x", number: "JD-QT-2026-099" }, { nope: true }] });
    assert.equal(partial?.documents.length, 1);
    const q = partial!.documents[0];
    assert.equal(q.kind === "quotation" && q.sections.length, 12);
  });
});
