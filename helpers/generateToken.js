const { table } = require("console");
// this module included in node js
const crypto = require("crypto");

const key = crypto.randomBytes(32).toString("hex");
console.table({ key });
