class NewsItem {
  constructor({
    id = null,
    title,
    content,
    source = null,
    category = null,
    publishedAt = new Date(),
    createdAt = new Date(),
  }) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.source = source;
    this.category = category;
    this.publishedAt = publishedAt;
    this.createdAt = createdAt;
  }

  static fromJSON(json) {
    return new NewsItem({
      ...json,
      publishedAt: json.published_at ? new Date(json.published_at) : new Date(),
      createdAt: json.created_at ? new Date(json.created_at) : new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      source: this.source,
      category: this.category,
      published_at: this.publishedAt.toISOString(),
      created_at: this.createdAt.toISOString(),
    };
  }
}

export default NewsItem;
