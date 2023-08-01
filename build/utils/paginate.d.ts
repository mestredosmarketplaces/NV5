import { Document, Model } from 'mongoose';
interface PaginationOptions {
    pageSize?: number;
    page?: number;
}
interface PaginationResult<T extends Document> {
    total_documents: number;
    page: number;
    page_size: number;
    total_pages: number;
    data: T[];
}
export declare function paginate<T extends Document>(model: Model<T>, filter?: Record<string, any>, options?: PaginationOptions): Promise<PaginationResult<T>>;
export {};
