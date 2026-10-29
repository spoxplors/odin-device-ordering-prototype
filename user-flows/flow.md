# Flow: ODIN merchant device ordering
Version: v1  |  Status: Confirmed  |  Platform: Odin
Actors: Merchant (which ODIN users can place an order is an open question)
Entry point: Merchant opens the device order form in ODIN (exact location in ODIN is an open question)
Source: new
Diagram: Miro board https://miro.com/app/board/uXjVH4xw_Lg=/ (frames "Phase 1: ordering form", "Phase 2: payment added", "Phase 3: payment plans added", placed below the existing current-state frames)

Devices available: Victa Portable, Victa Mobile.
Launch is in three phases. Each phase builds on the one before it.

## Phase 1: ordering form

1. Device order form — User: chooses a quantity for each device (Victa Portable, Victa Mobile) → System: records the quantities
2. Shipping address — User: confirms the shipping address → System: defaults to the business address on file
   - Branch: user edits the address
3. Submit — User: submits the order → System: emails the internal operations team
4. Fulfilment (outside ODIN) — Operations: fulfils the order and handbills outside ODIN
5. Status update — System: updates the ODIN order status to In transit once operations completes the order

## Phase 2: payment added

1. Device order form — User: chooses a quantity for each device → System: records the quantities
2. Review screen — User: reviews subtotal, taxes, and shipping → System: shows the totals, with the shipping address defaulting to the business address on file
   - Branch: user edits the address → System: refreshes shipping and taxes, then returns the user to the review screen
3. Government entity check — System: determines whether the merchant is a government entity (method is an open question)
   - Branch (government entity): user submits the order to the sales rep → Sales rep: sends a purchase order and invoice outside ODIN → Operations fulfils the order (continue at step 6). No payment happens in ODIN.
4. Payment method — User: pays by card now, or chooses to have the full amount deducted from next month's payout → System: processes the choice
   - Edge case: the order is placed only after payment is completed
   - Edge case: behavior on failed payment is an open question
5. Order placed — System: emails the internal operations team
6. Fulfilment — Operations: fulfils the order via the POS portal
7. Status update — System: updates the ODIN order status to In transit once operations completes the order

## Phase 3: payment plans added

Steps 1 to 3 and 5 to 7 match Phase 2. Step 4 changes:

4. Payment option — User: pays in full by card today, or schedules monthly deductions from payouts → System: processes the choice
   - Branch: scheduled deductions → System: adds an administration processing fee to the totals, then confirms the payment schedule
   - Edge case: whether the full next-month payout deduction from Phase 2 stays as an option is an open question

## Exit
Success: Order placed, operations has fulfilled it, and ODIN shows the order as In transit.
Failure paths (if any): Not yet defined. Failed payment handling is an open question.

## Out of scope
MID assignment. It happens after delivery, once the merchant has the device serial number, and belongs in its own flow. Rule to carry over: one MID can hold many devices, and one device belongs to a single MID.

## Assumptions to confirm
- Government entity orders are fulfilled by the operations team after the sales rep sends the purchase order and invoice, so they also get the In transit update.
- Phase 3 offers two payment options only: pay in full by card today, or scheduled monthly deductions.

## Open questions
1. Where does the merchant start this flow in ODIN, and which users can place an order (owner, admin, any user with permission)?
2. Does Phase 1 show pricing, given billing happens outside ODIN?
3. How does ODIN identify a government entity: a flag on the merchant account, or a self-declared choice on the form?
4. In Phase 3, does the full next-month payout deduction stay as an option, and what are the scheduled plan terms (number of months)?
5. What does the merchant see after submitting (confirmation screen, email, order number), and what happens if payment fails?
6. How does the In transit update reach ODIN (operations updates it manually, or it syncs from the POS portal), and does the merchant get a notification?
