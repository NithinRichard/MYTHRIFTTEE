class Wishlist {
    constructor() {
        this.LOCAL_STORAGE_KEY = 'shopify-wishlist';
        this.items = this.getWishlist();
        this.bindEvents();
        this.updateButtons();
    }

    getWishlist() {
        try {
            const wishlist = localStorage.getItem(this.LOCAL_STORAGE_KEY);
            return wishlist ? JSON.parse(wishlist) : [];
        } catch (e) {
            console.error('Error reading wishlist:', e);
            return [];
        }
    }

    saveWishlist(items) {
        try {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(items));
            this.items = items;
            this.updateButtons();

            // Dispatch event for other components to listen to
            document.dispatchEvent(new CustomEvent('wishlist:updated', {
                detail: { items: this.items }
            }));
            console.log('Wishlist saved:', items);
        } catch (e) {
            console.error('Error saving wishlist:', e);
        }
    }

    toggleItem(handle) {
        if (this.items.includes(handle)) {
            console.log('Removing from wishlist:', handle);
            this.removeItem(handle);
        } else {
            console.log('Adding to wishlist:', handle);
            this.addItem(handle);
        }
    }

    addItem(handle) {
        if (!handle) {
            console.error('Cannot add empty handle to wishlist');
            return;
        }
        if (!this.items.includes(handle)) {
            const newItems = [...this.items, handle];
            this.saveWishlist(newItems);
        }
    }

    removeItem(handle) {
        const newItems = this.items.filter(item => item !== handle);
        this.saveWishlist(newItems);
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.wishlist-btn');
            if (button) {
                e.preventDefault();
                e.stopPropagation();
                const handle = button.dataset.productHandle;
                this.toggleItem(handle);
            }
        });
    }

    updateButtons() {
        const buttons = document.querySelectorAll('.wishlist-btn');
        buttons.forEach(button => {
            const handle = button.dataset.productHandle;
            if (this.items.includes(handle)) {
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-pressed', 'false');
            }
        });
    }
}

// Initialize Wishlist
document.addEventListener('DOMContentLoaded', () => {
    window.wishlist = new Wishlist();
});

// Re-initialize on Shopify section reloads (if needed) or dynamic content loading
document.addEventListener('shopify:section:load', () => {
    if (window.wishlist) {
        window.wishlist.updateButtons();
    }
});
