// --- STATE ---
let currentTab = 'new';
let autoRefreshInterval = null;

// --- INITIALIZATION ---
window.addEventListener('load', function() {
    renderOrders();
    startAutoRefresh();
});

// --- CORE FUNCTIONS ---
function getOrders() {
    const data = localStorage.getItem('orders');
    return data ? JSON.parse(data) : [];
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function setTab(tabName) {
    currentTab = tabName;
    
    // Update active tab styling
    document.querySelectorAll('.tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById('tab-' + tabName);
    if(targetTab) targetTab.classList.add('active');
    
    const titles = {
        'new': 'New Orders',
        'preparing': 'Preparing',
        'ready': 'Ready for Pickup',
        'completed': 'Completed'
    };
    document.getElementById('section-title').innerText = titles[tabName] || 'Orders';
    
    renderOrders();
}

function updateTabCounts(orders) {
    const counts = { 'new': 0, 'preparing': 0, 'ready': 0 };
    orders.forEach(function(order) {
        if(counts[order.status] !== undefined) {
            counts[order.status]++;
        }
    });

    document.getElementById('tab-new').innerText = 'New (' + counts['new'] + ')';
    document.getElementById('tab-preparing').innerText = 'Preparing (' + counts['preparing'] + ')';
    document.getElementById('tab-ready').innerText = 'Ready (' + counts['ready'] + ')';
}

function renderOrders() {
    const orders = getOrders();
    updateTabCounts(orders);

    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-state');
    
    const filteredOrders = orders.filter(function(order) {
        return order.status === currentTab;
    });
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    container.innerHTML = filteredOrders.map(function(order) {
        let actionButton = '';
        
        if (order.status === 'new') {
            actionButton = `<button class="btn btn-accept" onclick="updateOrderStatus('${order.id}', 'preparing')">Accept Order</button>`;
        } else if (order.status === 'preparing') {
            actionButton = `<button class="btn btn-ready" onclick="updateOrderStatus('${order.id}', 'ready')">Mark as Ready</button>`;
        } else if (order.status === 'ready') {
            actionButton = `<button class="btn btn-accept" onclick="updateOrderStatus('${order.id}', 'completed')">Complete</button>`;
        }
        
        const itemsHtml = order.items.map(function(item) {
            return `
                <div class="item-row">
                    <span class="item-name">${item.name} x${item.quantity}</span>
                    <span class="item-price"></span>
                </div>
            `;
        }).join('');
        
        return `
            <div class="order-row">
                <div class="col-1">
                    <div class="order-id">#${order.id}</div>
                    <div class="badge ${order.status}">${order.status}</div>
                </div>
                
                <div class="col-2">
                    <div class="table-num">Table ${order.table}</div>
                    <div class="items-list">
                        ${itemsHtml}
                    </div>
                </div>
                
                <div class="col-3">
                    <div class="order-time">${order.time}</div>
                    <div class="order-total">Total: ${order.total} som</div>
                    ${actionButton}
                </div>
            </div>
        `;
    }).join('');
}

function updateOrderStatus(orderId, newStatus) {
    const orders = getOrders();
    for (let i = 0; i < orders.length; i++) {
        // String cast to ensure type match because IDs are strings now (#1023 -> 1023)
        if (orders[i].id === orderId || orders[i].id === parseInt(orderId) || orders[i].id.toString() === orderId.toString()) {
            orders[i].status = newStatus;
            break;
        }
    }
    saveOrders(orders);
    renderOrders();
}

function startAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    autoRefreshInterval = setInterval(function() {
        renderOrders();
    }, 2000);
}
