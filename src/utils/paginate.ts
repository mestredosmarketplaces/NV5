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

export async function paginate<T extends Document>(
  model: Model<T>,
  filter: Record<string, any> = {},
  options: PaginationOptions = {}
): Promise<PaginationResult<T>> {
  const pageSize = (options.pageSize && options.pageSize > 25) ? 25 : (options.pageSize || 10);
  const page = options.page || 1;

  const totalCount = await model.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / pageSize);

  const data = await model
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
};