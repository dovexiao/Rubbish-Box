class FreshchatUser {
  public email: string | null = null;
  public firstName: string | null = null;
  public lastName: string | null = null;
  public phone: string | null = null;
  public phoneCountryCode: string | null = null;

  private constructor() {
    Object.preventExtensions(this);
  }

  static getInstance(): FreshchatUser {
    return new FreshchatUser();
  }
}

export default FreshchatUser;
