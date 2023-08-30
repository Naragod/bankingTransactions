"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeDTO = void 0;
const Either_1 = require("fp-ts/Either");
const function_1 = require("fp-ts/function");
const validate = (validation) => {
    return (0, function_1.pipe)(validation, (0, Either_1.match)((errors) => errors.map((err) => {
        const context = err.context[1];
        const { actual, key, type } = context;
        return { input: actual !== null && actual !== void 0 ? actual : "undefined", key: key, expectedType: type.name };
    }), (v) => v));
};
const decodeDTO = (decoder, payload) => {
    const decoded = decoder.decode(payload);
    if ((0, Either_1.isLeft)(decoded)) {
        const errorMessage = validate(decoded);
        throw new Error(JSON.stringify(errorMessage));
    }
    return decoded.right;
};
exports.decodeDTO = decodeDTO;
