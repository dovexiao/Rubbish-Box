class FreshchatMessage {
  public tag: string | null = null;
  public message: string | null = null;

  private constructor() {
    Object.preventExtensions(this);
  }

  static createInstance(tag: string, message: string): FreshchatMessage {
    const freshchatMessage = new FreshchatMessage();
    freshchatMessage.tag = tag;
    freshchatMessage.message = message;
    return freshchatMessage;
  }
}

export default FreshchatMessage;
