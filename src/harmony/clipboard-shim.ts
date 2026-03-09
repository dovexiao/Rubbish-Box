const Clipboard = {
  setString(text: string) {
    console.warn('Clipboard not implemented on Harmony yet:', text);
  },

  async getString() {
    console.warn('Clipboard getString not implemented on Harmony');
    return '';
  },
};

export default Clipboard;
