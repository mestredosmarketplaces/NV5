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
exports.paginate = void 0;
function paginate(model, filter = {}, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const pageSize = (options.pageSize && options.pageSize > 25) ? 25 : (options.pageSize || 10);
        const page = options.page || 1;
        const totalCount = yield model.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / pageSize);
        const data = yield model
            .find(filter)
            .skip((page - 1) * pageSize)
            .limit(pageSize);
        return {
            total_documents: totalCount,
            page,
            page_size: pageSize,
            total_pages: totalPages,
            data,
        };
    });
}
exports.paginate = paginate;
;
