import * as t from "io-ts";

export const CustomerSnapshot = t.exact(
    t.type({
        name: t.string,
        balance: t.number,
        date: t.number,
    })
);
export type CustomerSnapshotT = t.TypeOf<typeof CustomerSnapshot>;
