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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = void 0;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'food-discovery';
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
let cachedClient = null;
let cachedDb = null;
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (cachedClient && cachedDb) {
            return { client: cachedClient, db: cachedDb };
        }
        if (!MONGODB_URI) {
            // This check ensures the type is narrowed to `string` for the connect call
            throw new Error('MONGODB_URI is not defined at runtime');
        }
        const client = yield mongodb_1.MongoClient.connect(MONGODB_URI);
        const db = client.db(DB_NAME);
        cachedClient = client;
        cachedDb = db;
        return { client, db };
    });
}
exports.connectToDatabase = connectToDatabase;
