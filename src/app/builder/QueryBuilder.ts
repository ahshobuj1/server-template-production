/* eslint-disable @typescript-eslint/no-explicit-any */


class QueryBuilder {
  public model: any;
  public query: Record<string, unknown>;
  public args: Record<string, any>;

 
  constructor(model: any, query: Record<string, unknown>) {
    this.model = model;
    this.query = query;
    this.args = {
      where: {},
    };
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;

    if (searchTerm) {
      this.args.where.OR = searchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: 'insensitive' },
      }));
    }

    return this;
  }

  filter() {
    const filterQueryObj = { ...this.query }; // make a copy
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields']; // delete fields from query

    excludeFields.forEach((field) => delete filterQueryObj[field]);

    // Apply exact match filters
    Object.keys(filterQueryObj).forEach((key) => {
      // Basic implementation for exact match.
      // For more advanced operators (gte, lte), you'll need a mapping function here.
      this.args.where[key] = filterQueryObj[key];
    });

    return this;
  }

  sort() {
    const sortFields = ((this.query?.sort as string) || '-createdAt').split(',');

    this.args.orderBy = sortFields.map((field) => {
      const fieldName = field.trim();
      if (fieldName.startsWith('-')) {
        return { [fieldName.substring(1)]: 'desc' };
      }
      return { [fieldName]: 'asc' };
    });

    return this;
  }

  pagination() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.args.skip = skip;
    this.args.take = limit;

    return this;
  }

  fields() {
    const fields = this.query?.fields as string;

    if (fields) {
      const selectFields = fields.split(',').reduce((acc: Record<string, boolean>, field) => {
        const fieldName = field.trim();
        // Prisma's select doesn't easily support exclusion ('-field'). 
        // We only map included fields.
        if (!fieldName.startsWith('-')) {
          acc[fieldName] = true;
        }
        return acc;
      }, {});

      if (Object.keys(selectFields).length > 0) {
        this.args.select = selectFields;
      }
    }

    return this;
  }

  async countTotal() {
    const total = await this.model.count({ where: this.args.where });
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPage,
    };
  }

  async findMany() {
    return await this.model.findMany(this.args);
  }
}

export default QueryBuilder;