import * as t from "io-ts";

export const TransactionData = t.exact(
    t.type({
        sender: t.string,
        receiver: t.string,
        amount: t.number,
    })
);

export const Transaction = t.intersection([TransactionData, t.type({ date: t.number })]);
export type TransactionDataT = t.TypeOf<typeof TransactionData>;
export type TransactionT = t.TypeOf<typeof Transaction>;
