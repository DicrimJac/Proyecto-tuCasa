export function renderLayout(title, bodyContent, props = {}) {
  const header = `<header><nav><span>TuCasa</span></nav></header>`;
  const footer = `<footer><p>© TuCasa</p></footer>`;
  const pre = props?.preContent ?? "";
  return `<!doctype html><html lang=\"es\"><head><meta charset=\"UTF-8\"><title>${title}</title></head><body>${header}${pre}<main>${bodyContent}</main>${footer}</body></html>`;
}

export default renderLayout;
