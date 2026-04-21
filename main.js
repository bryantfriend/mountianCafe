// --- MOCK DATA ---
const MENU_DATA = [
    { id: 1, category: 'Food', name: { en: 'Lagman', ru: 'Лагман' }, price: 350, img: '🍜' },
    { id: 2, category: 'Food', name: { en: 'Plov', ru: 'Плов' }, price: 400, img: '🍛' },
    { id: 3, category: 'Food', name: { en: 'Beef Steak', ru: 'Бифштекс' }, price: 650, img: '🥩' },
    { id: 4, category: 'Food', name: { en: 'Fresh Salad', ru: 'Свежий салат' }, price: 250, img: '🥗' },
    { id: 5, category: 'Drinks', name: { en: 'Apple Juice', ru: 'Яблочный сок' }, price: 150, img: '🧃' },
    { id: 6, category: 'Drinks', name: { en: 'Green Tea', ru: 'Зеленый чай' }, price: 100, img: '🍵' },
    { id: 7, category: 'Desserts', name: { en: 'Baklava', ru: 'Паклава' }, price: 200, img: '🥮' }
];

const I18N = {
    en: {
        menu: "Our Menu",
        viewOrder: "My Order",
        yourOrder: "My Order",
        total: "Total",
        placeOrder: "Place Order",
        thanks: "Thank you!",
        received: "Your order has been received.",
        notify: "We will notify you when it's ready.",
        categories: ['All', 'Food', 'Drinks', 'Desserts']
    },
    ru: {
        menu: "Наше Меню",
        viewOrder: "Мой заказ",
        yourOrder: "Мой заказ",
        total: "Итого",
        placeOrder: "Сделать заказ",
        thanks: "Спасибо!",
        received: "Ваш заказ получен.",
        notify: "Мы сообщим вам, когда он будет готов.",
        categories: ['Все', 'Еда', 'Напитки', 'Десерты']
    }
};

let state = {
    language: 'en',
    currentCategory: 'All', 
    cart: []
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(function(s) {
        s.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    const bottomNav = document.getElementById('main-bottom-nav');
    if (screenId === 'screen-language' || screenId === 'screen-confirm') {
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.classList.remove('hidden');
    }
    
    window.scrollTo(0, 0);
}

function selectLanguage(lang) {
    state.language = lang;
    updateUIStrings();
    renderCategories();
    renderMenu();
    showScreen('screen-menu');
}

function updateUIStrings() {
    const lang = I18N[state.language];
    document.getElementById('menu-title').innerText = lang.menu;
    document.getElementById('cart-title').innerText = lang.yourOrder;
    document.getElementById('label-total').innerText = lang.total;
    
    document.getElementById('nav-menu-lbl').innerText = lang.menu;
    document.getElementById('nav-cart-lbl').innerText = lang.yourOrder;
}

function renderCategories() {
    const container = document.getElementById('category-list');
    const cats = I18N[state.language].categories;
    const originalCats = ['All', 'Food', 'Drinks', 'Desserts']; 
    
    container.innerHTML = cats.map(function(cat, idx) {
        return `
            <div class="tab ${(originalCats[idx] === state.currentCategory) ? 'active' : ''}" 
                 onclick="setCategory('${originalCats[idx]}')">
                ${cat}
            </div>
        `;
    }).join('');
}

function setCategory(cat) {
    state.currentCategory = cat;
    renderCategories();
    renderMenu();
}

function renderMenu() {
    const container = document.getElementById('menu-items');
    
    const items = MENU_DATA.filter(function(item) {
        if (state.currentCategory === 'All') return true;
        return item.category === state.currentCategory;
    });

    container.innerHTML = items.map(function(item) {
        return `
            <div class="menu-item-card">
                <div class="item-img">${item.img}</div>
                <div class="item-info">
                    <div class="item-name">${item.name[state.language]}</div>
                    <div class="item-price">${item.price} som</div>
                </div>
                <button class="add-btn" onclick="addToCart(${item.id})">+</button>
            </div>
        `;
    }).join('');
}

function addToCart(itemId) {
    const existing = state.cart.find(function(c) {
        return c.itemId === itemId;
    });
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ itemId: itemId, quantity: 1 });
    }
    updateCartUI();
}

function updateCartQuantity(itemId, delta) {
    const index = state.cart.findIndex(function(c) {
        return c.itemId === itemId;
    });
    if (index === -1) return;

    state.cart[index].quantity += delta;
    
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    }
    
    updateCartUI();
    renderCart();
}

function updateCartUI() {
    const count = state.cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);
    
    const tb = document.getElementById('top-cart-badge');
    const bb = document.getElementById('bottom-cart-badge');
    
    if (count > 0) {
        tb.innerText = count;
        bb.innerText = count;
        tb.classList.remove('hidden-badge');
        bb.classList.remove('hidden-badge');
    } else {
        tb.classList.add('hidden-badge');
        bb.classList.add('hidden-badge');
    }

    const total = state.cart.reduce(function(sum, cartItem) {
        const item = MENU_DATA.find(function(m) {
            return m.id === cartItem.itemId;
        });
        return sum + (item.price * cartItem.quantity);
    }, 0);
    document.getElementById('cart-total').innerText = total;
}

function renderCart() {
    const container = document.getElementById('cart-list');
    if (state.cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; margin-top:2rem; color:var(--text-muted);">Your cart is empty</p>`;
        return;
    }

    container.innerHTML = state.cart.map(function(cartItem) {
        const item = MENU_DATA.find(function(m) {
            return m.id === cartItem.itemId;
        });
        return `
            <div class="cart-item-card">
                <div class="cart-item-left">
                    <div class="item-img" style="width:50px; height:50px; font-size:1.5rem;">${item.img}</div>
                    <div>
                        <div class="item-name">${item.name[state.language]}</div>
                        <div class="item-price">${item.price} som</div>
                    </div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                    <span class="qty-num">${cartItem.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `;
    }).join('');
}

function clearCart() {
    state.cart = [];
    updateCartUI();
    renderCart();
}

function placeOrder() {
    if (state.cart.length === 0) return;
    
    const enrichedItems = state.cart.map(function(cartItem) {
        const item = MENU_DATA.find(function(m) {
            return m.id === cartItem.itemId;
        });
        return {
            name: item.name['en'],
            quantity: cartItem.quantity
        };
    });

    const total = state.cart.reduce(function(sum, cartItem) {
        const item = MENU_DATA.find(function(m) { return m.id === cartItem.itemId; });
        return sum + (item.price * cartItem.quantity);
    }, 0);

    const order = {
        id: Date.now().toString().slice(-4), 
        table: Math.floor(Math.random() * 10) + 1,
        items: enrichedItems,
        total: total,
        status: "new",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));
    
    clearCart();
    showScreen('screen-confirm');
}

function notifyStaff(type) {
    const msg = type === 'Waiter' ? "Waiter is coming!" : "Bill requested!";
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#1f2937; color:white; padding:12px 24px; border-radius:30px; z-index:1000; font-weight:600;";
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2000);
}

window.addEventListener('load', function() {
    updateCartUI();
});
