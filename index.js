(function() {
  const CATEGORIES = ['Tech', 'Motorcycle', 'Home', 'Lifestyle', 'Other'];
  let items = JSON.parse(localStorage.getItem('lukas_data')) || [];
  let searchQuery = '';
  let editingItemId = null;

  // Existing Elements
  const itemsGrid = document.getElementById('items-grid');
  const emptyState = document.getElementById('empty-state');
  const wishModal = document.getElementById('wish-modal');
  const wishForm = document.getElementById('wish-form');
  const openModalBtn = document.getElementById('open-modal-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = wishModal.querySelector('h2');
  const submitBtn = wishForm.querySelector('button[type="submit"]');
  const searchInput = document.getElementById('search-input');
  const suggestionsDropdown = document.getElementById('suggestions-dropdown');

  // Custom Dropdown Elements
  const categoryTrigger = document.getElementById('category-trigger');
  const categoryOptions = document.getElementById('category-options');
  const categoryInput = document.getElementById('item-category');
  const categoryText = document.getElementById('selected-category-text');

  function init() {
    renderItems();
    attachListeners();
  }

  function attachListeners() {
    openModalBtn.addEventListener('click', () => {
      openModal();
    });

    closeModalBtn.addEventListener('click', () => {
      closeModal();
    });

    wishModal.addEventListener('click', (e) => {
      if (e.target === wishModal) closeModal();
    });

    // Custom Category Dropdown Logic
    categoryTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      categoryOptions.classList.toggle('hidden');
      categoryTrigger.querySelector('svg').classList.toggle('rotate-180');
    });

    document.querySelectorAll('.category-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-value');
        categoryInput.value = val;
        categoryText.innerText = val;
        categoryOptions.classList.add('hidden');
        categoryTrigger.querySelector('svg').classList.remove('rotate-180');
      });
    });

    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const itemData = {
        url: document.getElementById('item-url').value,
        title: document.getElementById('item-title').value,
        price: document.getElementById('item-price').value,
        imageUrl: document.getElementById('item-image').value,
        category: categoryInput.value // Uses the hidden input updated by custom dropdown
      };

      if (editingItemId) {
        items = items.map(item => 
          item.id === editingItemId 
            ? { ...item, ...itemData } 
            : item
        );
      } else {
        const newItem = {
          ...itemData,
          id: Date.now(),
          date: Date.now()
        };
        items = [newItem, ...items];
      }

      saveData();
      renderItems();
      closeModal();
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderItems();
      showSuggestions();
    });

    document.addEventListener('click', (e) => {
      // Close search suggestions
      if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
        suggestionsDropdown.classList.add('hidden');
      }
      // Close custom category dropdown
      if (categoryTrigger && !categoryTrigger.contains(e.target) && !categoryOptions.contains(e.target)) {
        categoryOptions.classList.add('hidden');
        categoryTrigger.querySelector('svg').classList.remove('rotate-180');
      }
    });

    searchInput.addEventListener('focus', () => {
      showSuggestions();
    });
  }

  function showSuggestions() {
    const value = searchInput.value.toLowerCase();
    if (!value) {
      suggestionsDropdown.classList.add('hidden');
      return;
    }

    const suggestions = new Set();
    
    CATEGORIES.forEach(cat => {
      if (cat.toLowerCase().includes(value)) suggestions.add(cat);
    });

    items.forEach(item => {
      if (item.title.toLowerCase().includes(value)) {
        suggestions.add(item.title);
      }
    });

    const suggestionList = Array.from(suggestions).slice(0, 6);

    if (suggestionList.length === 0) {
      suggestionsDropdown.classList.add('hidden');
      return;
    }

    suggestionsDropdown.innerHTML = suggestionList.map(s => `
      <div class="suggestion-item px-8 py-4 cursor-pointer text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center justify-between">
        <span>${s}</span>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="opacity-20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
    `).join('');

    suggestionsDropdown.classList.remove('hidden');

    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = item.querySelector('span').innerText;
        searchQuery = searchInput.value.toLowerCase();
        renderItems();
        suggestionsDropdown.classList.add('hidden');
      });
    });
  }

  function openModal(item = null) {
    if (item) {
      editingItemId = item.id;
      modalTitle.textContent = "Refine Archive.";
      submitBtn.textContent = "Update Archive";
      
      document.getElementById('item-url').value = item.url || '';
      document.getElementById('item-title').value = item.title || '';
      document.getElementById('item-price').value = item.price || '';
      document.getElementById('item-image').value = item.imageUrl || '';
      
      // Update custom dropdown UI for editing
      categoryInput.value = item.category || 'Other';
      categoryText.innerText = item.category || 'Other';
    } else {
      editingItemId = null;
      modalTitle.textContent = "Archive Desire.";
      submitBtn.textContent = "Add to Archive";
      wishForm.reset();
      
      // Reset custom dropdown UI for new items
      categoryInput.value = 'Other';
      categoryText.innerText = 'Select Category';
    }
    wishModal.classList.remove('modal-hidden');
  }

  function closeModal() {
    wishModal.classList.add('modal-hidden');
    wishForm.reset();
    editingItemId = null;
    categoryOptions.classList.add('hidden');
    categoryTrigger.querySelector('svg').classList.remove('rotate-180');
  }

  function renderItems() {
    const filtered = items.filter(i => 
      i.title.toLowerCase().includes(searchQuery) || 
      i.category.toLowerCase().includes(searchQuery)
    );

    if (filtered.length === 0) {
      itemsGrid.innerHTML = '';
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');
    itemsGrid.innerHTML = filtered.map(item => `
      <div class="item-card liquid-glass rounded-[2.5rem] p-6 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) cursor-pointer group hover:scale-[1.02] hover:border-white/30 flex flex-col h-full fade-in">
        <div class="relative aspect-[4/5] rounded-[1.8rem] mb-8 overflow-hidden bg-zinc-900 gloss-reflection">
          <img src="${item.imageUrl}" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'">
          <div class="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
            <span class="text-[8px] uppercase tracking-[0.2em] font-bold opacity-70 text-white">${item.category}</span>
          </div>
          <div class="absolute bottom-6 right-6 flex gap-2">
            <button data-edit="${item.id}" class="edit-btn w-10 h-10 rounded-full bg-black/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white">
              <div class="flex items-center justify-center h-full">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
            </button>
            <button data-delete="${item.id}" class="delete-btn w-10 h-10 rounded-full bg-black/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white">
              <div class="flex items-center justify-center h-full">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
            </button>
          </div>
        </div>
        
        <div class="px-2 flex flex-col flex-grow text-white">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-light tracking-tight truncate max-w-[70%]">${item.title}</h3>
            <span class="text-sm font-medium tracking-tighter opacity-70">${item.price || ''}</span>
          </div>
          <p class="text-[10px] text-white/30 uppercase tracking-widest mt-auto pt-6 pb-2 border-t border-white/5">
            ${new Date(item.date).toLocaleDateString()}
          </p>
        </div>

        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="mt-4 w-full text-center py-4 rounded-2xl border border-white/10 text-[9px] uppercase tracking-[0.4em] font-medium text-white hover:bg-white hover:text-black transition-all duration-500">
          Explore
        </a>
      </div>
    `).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(e.currentTarget.getAttribute('data-edit'));
        const item = items.find(i => i.id === id);
        if (item) openModal(item);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(e.currentTarget.getAttribute('data-delete'));
        if (confirm('Erase this archival entry?')) {
          items = items.filter(i => i.id !== id);
          saveData();
          renderItems();
        }
      });
    });
  }

  function saveData() {
    localStorage.setItem('lukas_data', JSON.stringify(items));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();