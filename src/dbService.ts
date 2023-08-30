import { MongoClient } from "mongodb";
import { decodeDTO } from "./decoder";
import * as mongoCreds from "./creds.json";
import { TransactionData } from "./DTOs/transaction";
import { CustomerSnapshotT, CustomerSnapshot } from "./DTOs/snapshot";

export interface ITransaction {
    receiver: string;
    sender: string;
    amount: number;
}

const getConnectionString = (username: string, password: string) => {
    return `mongodb+srv://${username}:${password}@superadvisor0.wooowae.mongodb.net/`;
};

const getCollection = async (client: MongoClient, dbString: string, colString: string) => {
    try {
        // await client.connect()
        const database = client.db(dbString);
        return database.collection(colString);
    } catch (err) {
        console.log(err);
        throw err;
    }
};

const getTimeDate = (date?: string): number => {
    if (date == undefined) {
        date = new Date().toISOString();
    }
    const expectedTime = Date.parse(date);
    
    if (isNaN(expectedTime)) {
        throw new Error("Invalid date provided");
    }
    return expectedTime;
};

const getLatestCustomerSnapshot = async (
    client: MongoClient,
    customer: string,
    date?: string
): Promise<CustomerSnapshotT | null> => {
    const endDate = getTimeDate(date);
    const query = { name: customer, date: { $lte: endDate } };
    const snapshots = await getCollection(client, mongoCreds.database, "customerBalanceSnapshots");
    const record = await snapshots.findOne(query, { sort: { _id: -1 } });

    if (record == null) return null;
    return decodeDTO(CustomerSnapshot, record);
};

export const getCustomerBalance = async (client: MongoClient, customer: string, date?: string) => {
    let startDate = 0;
    let customerBalance = 0;
    let endDate = getTimeDate(date);
    console.log("endDate:", endDate);
    let numberOfTransactionsLookedAt = 0;
    const snapshot = await getLatestCustomerSnapshot(client, customer, date);

    if (snapshot !== null) {
        console.log("snapshot:", snapshot);
        startDate = snapshot.date;
        customerBalance = snapshot.balance;
    }
    const collection = await getCollection(client, mongoCreds.database, mongoCreds.collection);
    const incomingTransactions = collection.find({ receiver: customer, date: { $gte: startDate, $lte: endDate } });
    const outgoingTransactions = collection.find({ sender: customer, date: { $gte: startDate, $lte: endDate } });

    for await (const transaction of incomingTransactions) {
        customerBalance += transaction.amount;
        numberOfTransactionsLookedAt += 1;
    }
    for await (const transaction of outgoingTransactions) {
        customerBalance -= transaction.amount;
        numberOfTransactionsLookedAt += 1;
    }

    console.log("Number of Transactions Looked at:", numberOfTransactionsLookedAt);
    return customerBalance;
};

export const getNewMongoClient = (username: string, password: string): MongoClient => {
    const connectionString = getConnectionString(username, password);
    return new MongoClient(connectionString);
};

export const writeTransaction = async (client: MongoClient, payload: ITransaction) => {
    const expectedDate = new Date().getTime();
    const transactionData = decodeDTO(TransactionData, payload);
    const collection = await getCollection(client, mongoCreds.database, mongoCreds.collection);

    const transaction = { date: expectedDate, ...transactionData };
    await collection.insertOne(transaction);
};

export const saveCustomerBalanceSnapshot = async (client: MongoClient, customer: string) => {
    const currentBalance = await getCustomerBalance(client, customer);
    const snapshot = { balance: currentBalance, name: customer, date: getTimeDate() };
    const snapshots = await getCollection(client, mongoCreds.database, "customerBalanceSnapshots");
    await snapshots.insertOne(snapshot);
};
