document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.querySelector('.product-grid');
  const loadingSpinner = document.getElementById('infinite-scroll-loading');
  let nextPageUrl = productGrid ? productGrid.getAttribute('data-next-url') : null;
  let isLoading = false;

  if (!productGrid || !nextPageUrl) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && nextPageUrl) {
      loadNextPage();
    }
  }, {
    rootMargin: '200px',
    threshold: 0.1
  });

  if (loadingSpinner) {
    observer.observe(loadingSpinner);
  }

  async function loadNextPage() {
    isLoading = true;
    loadingSpinner.style.display = 'block';

    try {
      const response = await fetch(nextPageUrl);
      const text = await response.text();
      const parser = new DOMParser();
      const nextDoc = parser.parseFromString(text, 'text/html');
      
      const newProducts = nextDoc.querySelectorAll('.product-grid .product-grid__item');
      const nextGrid = nextDoc.querySelector('.product-grid');
      
      if (newProducts.length > 0) {
        newProducts.forEach(product => {
          productGrid.appendChild(product);
        });
        
        // Update next page URL
        nextPageUrl = nextGrid.getAttribute('data-next-url');
        
        // Update browser history
        const newUrl = new URL(nextPageUrl, window.location.origin);
        // We want the current page, not the next one for history
        // But simplifying, we can just push the fetched URL or keep current
        // window.history.replaceState({}, '', nextPageUrl); 
      } else {
        nextPageUrl = null;
      }

    } catch (error) {
      console.error('Error loading next page:', error);
    } finally {
      isLoading = false;
      if (!nextPageUrl) {
        loadingSpinner.style.display = 'none';
        observer.disconnect();
      }
    }
  }
});
