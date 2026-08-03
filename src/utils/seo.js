import { useEffect } from 'react';

/**
 * Utility function to set document title and meta description dynamically.
 * @param {string} title - Page title (e.g. "Beranda | HMIF USD")
 * @param {string} description - Meta description for SEO
 */
export function setSEO(title, description) {
  if (title) {
    document.title = title.includes('HMIF') ? title : `${title} | HMIF USD`;
  }

  if (description) {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
  }
}

/**
 * React hook to set document title and meta description on page mount.
 * @param {string} title
 * @param {string} description
 */
export function useSEO(title, description) {
  useEffect(() => {
    setSEO(title, description);
  }, [title, description]);
}
