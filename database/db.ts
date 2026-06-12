import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("academia.db");

export default db;
