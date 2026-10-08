import Markdoc, { type Config, type Node } from '@markdoc/markdoc';

const SAFE_HREF = /^(\/|#|https?:\/\/|mailto:|tel:)/i;

/**
 * Rich text from Keystatic is stored as a Markdoc string. Markdoc never emits
 * raw HTML from content, so editors cannot inject markup. Links are limited
 * to safe schemes.
 */
const config: Config = {
  nodes: {
    link: {
      ...Markdoc.nodes.link,
      transform(node: Node, cfg: Config) {
        const href = String(node.attributes.href ?? '');
        const children = node.transformChildren(cfg);
        if (!SAFE_HREF.test(href)) return children;
        return new Markdoc.Tag('a', { href }, children);
      },
    },
  },
};

export function renderRichText(source: string): string {
  if (!source.trim()) return '';
  const ast = Markdoc.parse(source);
  const errors = Markdoc.validate(ast, config).filter(
    (e) => e.error.level === 'error' || e.error.level === 'critical',
  );
  if (errors.length > 0) {
    throw new Error(`Invalid rich text: ${errors.map((e) => e.error.message).join('; ')}`);
  }
  // Markdoc wraps the document in <article>; render only its children so rich
  // text doesn't add an extra article to the page structure.
  const tree = Markdoc.transform(ast, config);
  return Markdoc.renderers.html(Markdoc.Tag.isTag(tree) ? tree.children : tree);
}
