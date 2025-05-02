document.addEventListener('DOMContentLoaded', function() {
  // Get folder ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const folderId = parseInt(urlParams.get('folderId'));
  
  // Redirect if no folder ID
  if (!folderId) {
    window.location.href = 'index.html';
    return;
  }
  
  // DOM elements
  const subfolderList = document.getElementById('subfolderList');
  const currentFolder = document.getElementById('currentFolder');
  const addSubfolderBtn = document.getElementById('addSubfolderBtn');
  const addSubfolderModal = document.getElementById('addSubfolderModal');
  const addSubfolderForm = document.getElementById('addSubfolderForm');
  const modalClose = document.querySelector('.modal-close');
  
  // Set current folder name
  function setFolderName() {
    const folders = DataService.getFolders();
    const folder = folders.find(f => f.id === folderId);
    
    if (folder) {
      currentFolder.textContent = folder.name;
      document.title = `API Manager - ${folder.name} Subfolders`;
    } else {
      window.location.href = 'index.html';
    }
  }
  
  // Load subfolders
  function loadSubfolders() {
    const subfolders = DataService.getSubfolders(folderId);
    subfolderList.innerHTML = '';
    
    if (subfolders.length === 0) {
      subfolderList.innerHTML = '<p>No subfolders found. Add your first subfolder!</p>';
      return;
    }
    
    subfolders.forEach(subfolder => {
      const li = document.createElement('li');
      li.className = 'subfolder-item';
      li.innerHTML = `
        <span>${subfolder.name}</span>
        <div>
          <a href="api-entries.html?subfolderId=${subfolder.id}" class="btn">View APIs</a>
          <button class="btn btn-danger delete-subfolder" data-id="${subfolder.id}">Delete</button>
        </div>
      `;
      subfolderList.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-subfolder').forEach(btn => {
      btn.addEventListener('click', function() {
        const subfolderId = parseInt(this.getAttribute('data-id'));
        if (confirm('Are you sure you want to delete this subfolder? All API entries inside will also be deleted.')) {
          DataService.deleteSubfolder(subfolderId);
          loadSubfolders();
        }
      });
    });
  }
  
  // Event Listeners
  addSubfolderBtn.addEventListener('click', function() {
    addSubfolderModal.classList.add('active');
  });
  
  modalClose.addEventListener('click', function() {
    addSubfolderModal.classList.remove('active');
  });
  
  addSubfolderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const subfolderName = document.getElementById('subfolderName').value.trim();
    
    if (subfolderName) {
      DataService.addSubfolder(folderId, subfolderName);
      addSubfolderForm.reset();
      addSubfolderModal.classList.remove('active');
      loadSubfolders();
    }
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === addSubfolderModal) {
      addSubfolderModal.classList.remove('active');
    }
  });
  
  // Initial load
  setFolderName();
  loadSubfolders();
});