class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  fiter() {
    // Build the query without excluded fields:
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Create query string with opporators functionality:
    const queryStr = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gte|gt|lte|lt|eq)\b/g,
        (match) => `$${match}`,
      ),
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortStr = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortStr);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryStr.fields) {
      const fieldsStr = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fieldsStr);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = ApiFeatures;
