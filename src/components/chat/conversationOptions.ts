class ConversationOptions {
  private tags: null | string;
  private filteredViewTitle: null | string;
  constructor() {
    this.tags = null;
    this.filteredViewTitle = null;

    Object.preventExtensions(this);
  }
}

export default ConversationOptions;
