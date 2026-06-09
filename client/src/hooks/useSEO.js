import { useEffect } from 'react';

const SITE = 'Sourashtra Community Portal';

const useSEO = ({ title, description, image, url } = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : SITE;
    document.title = fullTitle;

    const setMeta = (name, content, attr = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) setMeta('description', description);
    setMeta('og:title', fullTitle, 'property');
    if (description) setMeta('og:description', description, 'property');
    if (image) setMeta('og:image', image, 'property');
    if (url) setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', SITE, 'property');

    return () => {
      document.title = SITE;
    };
  }, [title, description, image, url]);
};

export default useSEO;
