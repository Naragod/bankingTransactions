"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.port = void 0;
const express_1 = __importDefault(require("express"));
const dbService_1 = require("./dbService");
const creds_json_1 = require("./creds.json");
exports.port = 1234;
exports.app = (0, express_1.default)();
const mongoClient = (0, dbService_1.getNewMongoClient)(creds_json_1.username, creds_json_1.password);
// parses incoming json payloads
exports.app.use(express_1.default.json());
// Get customer balance.
// If a date is specified it will return the balance upto that date. 
exports.app.get("/balance", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { query } = req;
        const { customer, date } = query;
        const result = yield (0, dbService_1.getCustomerBalance)(mongoClient, customer, date);
        return res.json({ success: "yes", result });
    }
    catch (err) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
}));
exports.app.post("/transfer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Body:", req.body);
        yield (0, dbService_1.writeTransaction)(mongoClient, req.body);
        return res.json({ success: "yesss" });
    }
    catch (err) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
}));
exports.app.post("/saveSnapshot", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Body:", req.body);
        yield (0, dbService_1.saveCustomerBalanceSnapshot)(mongoClient, req.body.customer);
        return res.json({ success: "yesss" });
    }
    catch (err) {
        // TODO: implement proper error handling
        console.log(err.message);
        return res.status(400).json({ success: "no", err: err.message });
    }
}));
