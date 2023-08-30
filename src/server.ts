import express, { Request, Response } from "express";
import { getCustomerBalance, getNewMongoClient, saveCustomerBalanceSnapshot, writeTransaction } from "./dbService";
import { username, password } from "./creds.json";

export const port = 1234;
export const app = express();

const mongoClient = getNewMongoClient(username, password);

// parses incoming json payloads
app.use(express.json());

// Get customer balance.
// If a date is specified it will return the balance upto that date. 
app.get("/balance", async (req: Request, res: Response) => {
    try {
        const { query } = req;
        const { customer, date } = query;
        const result = await getCustomerBalance(mongoClient, <string>customer, <string>date);
        return res.json({ success: "yes", result });
    } catch (err: any) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
});

app.post("/transfer", async (req: Request, res: Response) => {
    try {
        console.log("Body:", req.body);
        await writeTransaction(mongoClient, req.body);
        return res.json({ success: "yesss" });
    } catch (err: any) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
});

app.post("/saveSnapshot", async (req: Request, res: Response) => {
    try {
        console.log("Body:", req.body);
        await saveCustomerBalanceSnapshot(mongoClient, req.body.customer);
        return res.json({ success: "yesss" });
    } catch (err: any) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
});
