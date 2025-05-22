enum FilterType {
  CATEGORY = 'category',
  ARTICLE = 'article',
}

class FaqOptions {
  public showFaqCategoriesAsGrid: boolean;
  public showContactUsOnFaqScreens: boolean;
  public showContactUsOnAppBar: boolean;
  public showContactUsOnFaqNotHelpful: boolean;

  public tags: string[] | null;
  public contactusFilterTags: string[] | null;

  public contactusFilterTitle: string | null;
  public filteredViewTitle: string | null;
  public filterType: FilterType | null;
  constructor() {
    this.showFaqCategoriesAsGrid = true;
    this.showContactUsOnFaqScreens = true;
    this.showContactUsOnAppBar = false;
    this.showContactUsOnFaqNotHelpful = true;

    this.tags = null;
    this.contactusFilterTags = null;

    this.contactusFilterTitle = null;
    this.filteredViewTitle = null;
    this.filterType = null;

    Object.preventExtensions(this);
  }

  static FilterType = FilterType;
}

export default FaqOptions;
