"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCustomerBalanceSnapshot = exports.writeTransaction = exports.getNewMongoClient = exports.getCustomerBalance = void 0;
const mongodb_1 = require("mongodb");
const decoder_1 = require("./decoder");
const mongoCreds = __importStar(require("./creds.json"));
const transaction_1 = require("./DTOs/transaction");
const snapshot_1 = require("./DTOs/snapshot");
const getConnectionString = (username, password) => {
    return `mongodb+srv://${username}:${password}@superadvisor0.wooowae.mongodb.net/`;
};
const getCollection = (client, dbString, colString) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await client.connect()
        const database = client.db(dbString);
        return database.collection(colString);
    }
    catch (err) {
        console.log(err);
        throw err;
    }
});
const getTimeDate = (date) => {
    if (date == undefined) {
        date = new Date().toISOString();
    }
    const expectedTime = Date.parse(date);
    if (isNaN(expectedTime)) {
        throw new Error("Invalid date provided");
    }
    return expectedTime;
};
const getLatestCustomerSnapshot = (client, customer, date) => __awaiter(void 0, void 0, void 0, function* () {
    const endDate = getTimeDate(date);
    const query = { name: customer, date: { $lte: endDate } };
    const snapshots = yield getCollection(client, mongoCreds.database, "customerBalanceSnapshots");
    const record = yield snapshots.findOne(query, { sort: { _id: -1 } });
    if (record == null)
        return null;
    return (0, decoder_1.decodeDTO)(snapshot_1.CustomerSnapshot, record);
});
const getCustomerBalance = (client, customer, date) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c, _d, e_2, _e, _f;
    let startDate = 0;
    let customerBalance = 0;
    let endDate = getTimeDate(date);
    console.log("endDate:", endDate);
    let numberOfTransactionsLookedAt = 0;
    const snapshot = yield getLatestCustomerSnapshot(client, customer, date);
    if (snapshot !== null) {
        console.log("snapshot:", snapshot);
        startDate = snapshot.date;
        customerBalance = snapshot.balance;
    }
    const collection = yield getCollection(client, mongoCreds.database, mongoCreds.collection);
    const incomingTransactions = collection.find({ receiver: customer, date: { $gte: startDate, $lte: endDate } });
    const outgoingTransactions = collection.find({ sender: customer, date: { $gte: startDate, $lte: endDate } });
    try {
        for (var _g = true, incomingTransactions_1 = __asyncValues(incomingTransactions), incomingTransactions_1_1; incomingTransactions_1_1 = yield incomingTransactions_1.next(), _a = incomingTransactions_1_1.done, !_a; _g = true) {
            _c = incomingTransactions_1_1.value;
            _g = false;
            const transaction = _c;
            customerBalance += transaction.amount;
            numberOfTransactionsLookedAt += 1;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_g && !_a && (_b = incomingTransactions_1.return)) yield _b.call(incomingTransactions_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    try {
        for (var _h = true, outgoingTransactions_1 = __asyncValues(outgoingTransactions), outgoingTransactions_1_1; outgoingTransactions_1_1 = yield outgoingTransactions_1.next(), _d = outgoingTransactions_1_1.done, !_d; _h = true) {
            _f = outgoingTransactions_1_1.value;
            _h = false;
            const transaction = _f;
            customerBalance -= transaction.amount;
            numberOfTransactionsLookedAt += 1;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (!_h && !_d && (_e = outgoingTransactions_1.return)) yield _e.call(outgoingTransactions_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    console.log("Number of Transactions Looked at:", numberOfTransactionsLookedAt);
    return customerBalance;
});
exports.getCustomerBalance = getCustomerBalance;
const getNewMongoClient = (username, password) => {
    const connectionString = getConnectionString(username, password);
    return new mongodb_1.MongoClient(connectionString);
};
exports.getNewMongoClient = getNewMongoClient;
const writeTransaction = (client, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const expectedDate = new Date().getTime();
    const transactionData = (0, decoder_1.decodeDTO)(transaction_1.TransactionData, payload);
    const collection = yield getCollection(client, mongoCreds.database, mongoCreds.collection);
    const transaction = Object.assign({ date: expectedDate }, transactionData);
    yield collection.insertOne(transaction);
});
exports.writeTransaction = writeTransaction;
const saveCustomerBalanceSnapshot = (client, customer) => __awaiter(void 0, void 0, void 0, function* () {
    const currentBalance = yield (0, exports.getCustomerBalance)(client, customer);
    const snapshot = { balance: currentBalance, name: customer, date: getTimeDate() };
    const snapshots = yield getCollection(client, mongoCreds.database, "customerBalanceSnapshots");
    yield snapshots.insertOne(snapshot);
});
exports.saveCustomerBalanceSnapshot = saveCustomerBalanceSnapshot;
