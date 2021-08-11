"use strict";
exports.__esModule = true;
var types_1 = require("./types");
var ProgressData = /** @class */ (function () {
    function ProgressData(rawData, rows) {
        var _this = this;
        this.columns = new Map();
        this.rawData = rawData;
        rawData.split('\n').forEach((function (row) {
            row.split(',').forEach(function (column, idx) {
                var _a;
                var type = rows[idx].type;
                (_a = _this.columns.get(rows[idx].key)) === null || _a === void 0 ? void 0 : _a.push(type === types_1.DataType.STRING ? column : parseFloat(column));
            });
        }));
    }
    ProgressData.prototype.getColumn = function (key) {
        return this.columns.get(key);
    };
    ProgressData.prototype.getColumns = function () {
        return this.columns;
    };
    return ProgressData;
}());
exports["default"] = ProgressData;
