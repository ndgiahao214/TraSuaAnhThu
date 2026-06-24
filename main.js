function toggleMenu() {
  const navMenu = document.getElementById('nav-menu');
  navMenu.classList.toggle('active');
}

function toggleOptions(id) {
  const el = document.getElementById(id);
  if (el.style.display === "block") {
    el.style.display = "none";
  } else {
    el.style.display = "block";
  }
}

// DANH SÁCH GIỎ HÀNG
let cartList = [];

function updateCartCount() {
  const totalQuantity = cartList.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').innerText = totalQuantity;
}

function saveCartAndRender() {
  localStorage.setItem('trasua_cart', JSON.stringify(cartList));
  updateCartCount();
  // Chỉ render lại giỏ hàng nếu nó đang được mở
  if (document.getElementById('cart-modal').style.display === 'flex') {
    renderCart();
  }
}

function updateCartQuantity(index, change) {
  const item = cartList[index];
  if (item) {
    // Chỉ kiểm tra giới hạn khi khách hàng bấm nút "+"
    if (change > 0) {
      const totalQuantity = cartList.reduce((sum, i) => sum + i.quantity, 0);
      if (totalQuantity >= 100) {
        alert("Giỏ hàng đã đạt giới hạn 100 món. Vui lòng thanh toán hoặc xóa bớt để thêm món mới.");
        return; // Dừng hàm nếu đã đạt giới hạn
      }
    }

    item.quantity += change;
    if (item.quantity <= 0) {
      // Nếu số lượng về 0 hoặc âm, xóa sản phẩm khỏi giỏ hàng
      cartList.splice(index, 1);
    }
    saveCartAndRender();
  }
}

function toggleCart() {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal.style.display === "flex") {
    cartModal.style.display = "none";
  } else {
    cartModal.style.display = "flex";
    renderCart();
  }
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalPrice = document.getElementById('cart-total-price');
  
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cartList.length === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">Giỏ hàng đang trống</p>';
    cartTotalPrice.innerText = '0đ';
    return;
  }

  cartList.forEach((item, index) => {
    total += item.price * item.quantity;
    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.description}</p>
          <div class="cart-item-quantity">
            <button onclick="updateCartQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateCartQuantity(${index}, 1)">+</button>
          </div>
        </div>
        <div class="cart-item-price">
          ${(item.price * item.quantity).toLocaleString('vi-VN')}đ
          <br>
          <button class="btn-remove" onclick="removeFromCart(${index})">Xóa</button>
        </div>
      </div>
    `;
  });
  cartTotalPrice.innerText = total.toLocaleString('vi-VN') + 'đ';
}

function handleCheckout(event) {
  event.preventDefault();
  if (cartList.length === 0) {
    alert("Giỏ hàng của bạn đang trống!");
    return;
  }
  // Lấy số lượng đơn hàng đã đặt trước đó từ Local Storage
  const pastOrderCount = parseInt(localStorage.getItem('trasua_order_count') || '0');
  // Lấy tổng số lượng của tất cả các món đang có trong giỏ hàng hiện tại
  const currentCartTotalQuantity = cartList.reduce((sum, item) => sum + item.quantity, 0);
  
  if (pastOrderCount > 25 || currentCartTotalQuantity > 25) {
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('vip-order-modal').style.display = 'flex';
  } else {
    document.getElementById('cart-modal').style.display = 'none';
    document.getElementById('pickup-order-modal').style.display = 'flex';
  }
}

async function submitPickupOrder(event) {
  event.preventDefault();
  const name = document.getElementById('pickupName').value;
  const phone = document.getElementById('pickupPhone').value;
  const time = document.getElementById('pickupTime').value;

  const orderData = {
    type: 'pickup',
    customer: { name, phone, time },
    cart: cartList
  };

  try {
    // Thay 'http://localhost:3000' bằng URL máy chủ của bạn
    const response = await fetch('/api/new-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) throw new Error('Network response was not ok.');

    alert(`Cảm ơn ${name}! Đơn hàng của bạn đã được xác nhận và sẽ được chuẩn bị ngay. Vui lòng đến quán để nhận hàng nhé!`);
    document.getElementById('pickupOrderForm').reset();
    document.getElementById('pickup-order-modal').style.display = 'none';
    cartList = [];
    saveCartAndRender();
  } catch (error) {
    console.error('Failed to submit order:', error);
    alert('Đã có lỗi xảy ra khi gửi đơn hàng. Vui lòng thử lại hoặc liên hệ trực tiếp với quán!');
  }
}

async function submitVipOrder(event) {
  event.preventDefault();
  const name = document.getElementById('vipName').value;
  const phone = document.getElementById('vipPhone').value;
  const address = document.getElementById('vipAddress').value;

  const orderData = {
    type: 'vip',
    customer: { name, phone, address },
    cart: cartList
  };

  try {
    // Thay 'http://localhost:3000' bằng URL máy chủ của bạn
    const response = await fetch('/api/new-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    if (!response.ok) throw new Error('Network response was not ok.');
    alert('Đặt hàng VIP thành công! Đơn hàng của bạn đang được chuẩn bị và giao đi.');
    document.getElementById('vipOrderForm').reset();
    document.getElementById('vip-order-modal').style.display = 'none';
    cartList = [];
    saveCartAndRender();
  } catch (error) {
    console.error('Failed to submit VIP order:', error);
    alert('Đã có lỗi xảy ra khi gửi đơn hàng VIP. Vui lòng thử lại hoặc liên hệ trực tiếp với quán!');
  }
}

function searchProducts() {
  // 1. Lấy giá trị nhập vào và chuyển thành chữ hoa để tìm kiếm không phân biệt chữ hoa/thường
  const input = document.getElementById('search-input');
  const filter = input.value.toUpperCase();

  // 2. Lấy tất cả các thẻ sản phẩm
  const cards = document.querySelectorAll('.menu-grid .menu-card');

  // 3. Lặp qua tất cả các thẻ và ẩn những thẻ không khớp với từ khóa tìm kiếm
  cards.forEach(card => {
    const titleElement = card.querySelector("h3");
    if (titleElement) {
      const titleText = titleElement.textContent || titleElement.innerText;
      if (titleText.toUpperCase().indexOf(filter) > -1) {
        card.style.display = ""; // Hiện thẻ nếu khớp
      } else {
        card.style.display = "none"; // Ẩn thẻ nếu không khớp
      }
    }
  });

  // 4. Xử lý ẩn/hiện tiêu đề danh mục (Nước uống, Đồ ăn vặt)
  const categoryTitles = document.querySelectorAll('.category-title');
  categoryTitles.forEach(title => {
    const grid = title.nextElementSibling;
    if (grid && grid.classList.contains('menu-grid')) {
      // Kiểm tra xem có sản phẩm nào trong danh mục này đang được hiển thị không
      const visibleCards = grid.querySelectorAll('.menu-card:not([style*="display: none"])');
      if (visibleCards.length > 0) {
        title.style.display = ""; // Hiện tiêu đề nếu có sản phẩm
      } else {
        title.style.display = "none"; // Ẩn tiêu đề nếu không có sản phẩm nào
      }
    }
  });
}

function removeFromCart(index) {
  cartList.splice(index, 1);
  saveCartAndRender();
}

function clearCart() {
  if (cartList.length === 0) return;
  if (confirm("Bạn có chắc chắn muốn xóa tất cả các món trong giỏ hàng không?")) {
    cartList = [];
    saveCartAndRender();
    showToast("Đã xóa toàn bộ giỏ hàng!");
  }
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function addToCart(event) {
  event.preventDefault();
  event.stopPropagation();

  // --- START: Kiểm tra giới hạn giỏ hàng ---
  const totalQuantity = cartList.reduce((sum, item) => sum + item.quantity, 0);
  if (totalQuantity >= 100) {
    alert("Giỏ hàng đã đạt giới hạn 100 món. Vui lòng thanh toán hoặc xóa bớt để thêm món mới.");
    return; // Dừng, không cho thêm món
  }
  // --- END: Kiểm tra giới hạn giỏ hàng ---

  const button = event.target;
  const card = button.closest('.menu-card');
  const img = card.querySelector('img');
  let name = card.querySelector('h3').innerText;

  // Xử lý thêm vị cho các món Mix
  const flavorSelect = card.querySelector('.flavor-select');
  if (flavorSelect) {
    name += ' (' + flavorSelect.value + ')';
  }
  
  // Lấy size, topping và tính giá từ Radio Button được chọn (hoặc giá mặc định nếu không có size)
  const selectedSize = card.querySelector('input[type="radio"][name^="size_"]:checked');
  const selectedTopping = card.querySelector('input[type="radio"][name^="topping_"]:checked');
  
  let size = 'Mặc định';
  let basePrice = 0;
  let toppingPrice = 0;
  let toppingValue = '';
  
  if (selectedSize) {
    size = selectedSize.value;
    const sizeText = selectedSize.parentElement.textContent.split('-')[1];
    if (sizeText) basePrice = parseInt(sizeText.replace(/[^0-9]/g, ''));
  } else {
    const priceElem = card.querySelector('.price');
    if (priceElem) basePrice = parseInt(priceElem.innerText.replace(/[^0-9]/g, ''));
  }

  if (selectedTopping) {
    toppingValue = selectedTopping.value;
    const topText = selectedTopping.parentElement.textContent;
    if (topText.includes('+')) {
      toppingPrice = parseInt(topText.split('+')[1].replace(/[^0-9]/g, '')) || 0;
    }
  }

  const price = basePrice + toppingPrice;

  // Tạo ID duy nhất cho sản phẩm dựa trên tên, size và topping
  const itemId = name + '_' + size + '_' + toppingValue;

  // Logic cho giỏ hàng cá nhân
  const existingItem = cartList.find(item => item.id === itemId);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    let description = `Size: ${size}`;
    if (toppingValue) description += ` (${toppingValue} Topping)`;
    cartList.push({ id: itemId, name, description, price, priceText: price.toLocaleString('vi-VN') + 'đ', quantity: 1 });
  }
  saveCartAndRender();

  // --- START: Hiển thị thông báo ---
  const toast = document.getElementById('toast-notification');
  toast.textContent = `Đã thêm "${name}" vào giỏ hàng!`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000); // Ẩn sau 3 giây
  // --- END: Hiển thị thông báo ---
  
  // --- Hiệu ứng hình ảnh bay vào giỏ hàng và rung giỏ hàng ---
  (function playFlyToCartAnimation(imgElement) {
    const imgRect = imgElement.getBoundingClientRect();
    const cartIconWrapper = document.getElementById('cart-icon-wrapper');
    const cartRect = cartIconWrapper.getBoundingClientRect();
    const clone = imgElement.cloneNode();
    clone.classList.add('flying-img');
    clone.style.top = imgRect.top + 'px'; clone.style.left = imgRect.left + 'px';
    clone.style.width = imgRect.width + 'px'; clone.style.height = imgRect.height + 'px';
    document.body.appendChild(clone);
    void clone.offsetWidth;
    clone.style.top = (cartRect.top + cartRect.height / 2 - 15) + 'px';
    clone.style.left = (cartRect.left + cartRect.width / 2 - 15) + 'px';
    clone.style.width = '30px'; clone.style.height = '30px'; clone.style.opacity = '0';
    clone.style.transform = 'scale(0.2) rotate(360deg)';
    setTimeout(() => {
      clone.remove();
      const cartIcon = document.getElementById('cart-icon');
      cartIcon.classList.add('cart-jiggle');
      setTimeout(() => cartIcon.classList.remove('cart-jiggle'), 500);
    }, 800);
  })(img);
}

function rateProduct(event, value) {
  event.preventDefault();
  event.stopPropagation(); // Ngăn sự kiện click ảnh hưởng đến card sản phẩm
  const container = event.target.closest('.interactive-rating');
  const stars = container.querySelectorAll('.star');
  const text = container.querySelector('.rating-text');

  stars.forEach(star => {
    if (parseInt(star.getAttribute('data-value')) <= value) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  
  text.innerText = `(Đã đánh giá ${value} sao)`;

  // Lưu số sao vào Local Storage với key là tên món
  const card = event.target.closest('.menu-card');
  const productName = card.querySelector('h3').innerText;
  localStorage.setItem('rating_' + productName, value);
}

// XỬ LÝ LƯU VÀ HIỂN THỊ GÓP Ý
function submitFeedback(event) {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const message = document.getElementById('message').value;
  
  // Lấy ngày giờ hiện tại
  const today = new Date();
  const date = today.toLocaleDateString('vi-VN') + ' lúc ' + today.toLocaleTimeString('vi-VN');

  const feedback = { name, message, date };
  
  // Lấy danh sách cũ hoặc tạo mới nếu chưa có
  let feedbacks = JSON.parse(localStorage.getItem('trasua_feedbacks')) || [];
  feedbacks.unshift(feedback); // Đưa góp ý mới nhất lên đầu danh sách
  localStorage.setItem('trasua_feedbacks', JSON.stringify(feedbacks));

  alert('Cảm ơn bạn đã góp ý! Trà Sữa Anh Thư đã ghi nhận thông tin của bạn.');
  document.getElementById('feedbackForm').reset(); // Xoá sạch form
  renderFeedbacks(); // Cập nhật lại danh sách hiển thị
}

function renderFeedbacks() {
  const list = document.getElementById('feedback-list');
  const feedbacks = JSON.parse(localStorage.getItem('trasua_feedbacks')) || [];
  
  if (feedbacks.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-light); font-style: italic;">Chưa có góp ý nào. Hãy là người đầu tiên!</p>';
    return;
  }

  list.innerHTML = '';
  feedbacks.forEach(fb => {
    list.innerHTML += `
      <div class="feedback-item">
        <h4>${fb.name} <span>- ${fb.date}</span></h4>
        <p>${fb.message}</p>
      </div>
    `;
  });
}

function toggleDarkMode(event) {
  if (event) event.preventDefault();
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('trasua_dark_mode', isDark);
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

function toggleTeam(headerElement) {
  const category = headerElement.parentElement;
  
  if (category.classList.contains('active')) {
    category.classList.remove('active');
  } else {
    // Đóng các mục khác để giao diện luôn gọn gàng (chỉ mở 1 mục)
    document.querySelectorAll('.team-category').forEach(cat => {
      cat.classList.remove('active');
    });
    
    category.classList.add('active');
  }
}

// HÀM CHO LIGHTBOX PHÓNG TO ẢNH
function openImageModal(src) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  modal.style.display = "block";
  modalImg.src = src;
}

function closeImageModal() {
  const modal = document.getElementById('imageModal');
  modal.style.display = "none";
}


// Để có thể sử dụng các hàm trong DOM như onclick, onsubmit... 
// từ file JS riêng biệt, chúng ta cần gắn chúng vào window object
window.toggleMenu = toggleMenu;
window.toggleOptions = toggleOptions;
window.updateCartCount = updateCartCount;
window.saveCartAndRender = saveCartAndRender;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.renderCart = renderCart;
window.handleCheckout = handleCheckout;
window.submitPickupOrder = submitPickupOrder;
window.submitVipOrder = submitVipOrder;
window.searchProducts = searchProducts;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.showToast = showToast;
window.addToCart = addToCart;
window.rateProduct = rateProduct;
window.submitFeedback = submitFeedback;
window.renderFeedbacks = renderFeedbacks;
window.toggleDarkMode = toggleDarkMode;
window.toggleTeam = toggleTeam;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.showConfirmationModal = showConfirmationModal;
window.closeConfirmationModal = closeConfirmationModal;

// Tự động tải lại số sao đã đánh giá khi mở trang web
document.addEventListener('DOMContentLoaded', () => {
  // Tải giỏ hàng từ localStorage khi trang được tải
  const savedCart = localStorage.getItem('trasua_cart');
  if (savedCart) {
    cartList = JSON.parse(savedCart);
    updateCartCount();
  }

  // Phục hồi trạng thái Dark Mode
  const savedDarkMode = localStorage.getItem('trasua_dark_mode');
  if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) toggleBtn.innerHTML = '☀️ Light Mode';
  }

  // Ẩn menu mobile khi click vào các liên kết
  document.querySelectorAll('#nav-menu a, #cart-icon').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 991) {
        document.getElementById('nav-menu').classList.remove('active');
      }
    });
  });

  // Xử lý đổi màu menu khi click
  const navLinks = document.querySelectorAll('#nav-menu a:not(.btn-nav):not(#dark-mode-toggle)');
  
  // Tự động nhận diện mục menu dựa trên đường dẫn (#hash) khi tải trang
  const currentHash = window.location.hash;
  if (currentHash && !window.location.pathname.includes('about.html')) {
    navLinks.forEach(l => l.classList.remove('active-nav'));
    const activeLink = document.querySelector(`#nav-menu a[href="${currentHash}"]`);
    if (activeLink) activeLink.classList.add('active-nav');
  }

  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Chỉ chuyển màu cho những liên kết hướng xuống các mục trong cùng trang (bắt đầu bằng #)
      if (this.getAttribute('href').startsWith('#')) {
        navLinks.forEach(l => l.classList.remove('active-nav'));
        this.classList.add('active-nav');
      }
    });
  });

  renderFeedbacks(); // Tải danh sách góp ý

  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    const productName = card.querySelector('h3').innerText;
    const savedRating = localStorage.getItem('rating_' + productName);
    
    if (savedRating) {
      const container = card.querySelector('.interactive-rating');
      if (container) {
        const stars = container.querySelectorAll('.star');
        const text = container.querySelector('.rating-text');
        
        stars.forEach(star => {
          if (parseInt(star.getAttribute('data-value')) <= savedRating) {
            star.classList.add('active');
          }
        });
        text.innerText = `(Đã đánh giá ${savedRating} sao)`;
      }
    }
  });
});