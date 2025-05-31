document.addEventListener('DOMContentLoaded', function() {
  // Initialize data
  DataService.init();
  
  // DOM elements
  const folderList = document.getElementById('folderList');
  const addFolderBtn = document.getElementById('addFolderBtn');
  const addFolderModal = document.getElementById('addFolderModal');
  const addFolderForm = document.getElementById('addFolderForm');
  const modalClose = document.querySelector('.modal-close');
  
  // Load folders
  function loadFolders() {
    const folders = DataService.getFolders();
    folderList.innerHTML = '';
    
    if (folders.length === 0) {
      folderList.innerHTML = '<p>No folders found. Create your first folder!</p>';
      return;
    }
    
    folders.forEach(folder => {
      const li = document.createElement('li');
      li.className = 'folder-item';
      li.innerHTML = `
        <span>${folder.name}</span>
        <div>
          <a href="subfolder.html?folderId=${folder.id}" class="btn">View Subfolders</a>
          <button class="btn btn-danger delete-folder" data-id="${folder.id}">Delete</button>
        </div>
      `;
      folderList.appendChild(li);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-folder').forEach(btn => {
      btn.addEventListener('click', function() {
        const folderId = parseInt(this.getAttribute('data-id'));
        if (confirm('Are you sure you want to delete this folder? All subfolders and API entries inside will also be deleted.')) {
          DataService.deleteFolder(folderId);
          loadFolders();
        }
      });
    });
  }
  
  // Event Listeners
  addFolderBtn.addEventListener('click', function() {
    addFolderModal.classList.add('active');
  });
  
  modalClose.addEventListener('click', function() {
    addFolderModal.classList.remove('active');
  });
  
  addFolderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const folderName = document.getElementById('folderName').value.trim();
    
    if (folderName) {
      DataService.addFolder(folderName);
      addFolderForm.reset();
      addFolderModal.classList.remove('active');
      loadFolders();
    }
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === addFolderModal) {
      addFolderModal.classList.remove('active');
    }
  });
  
  // Initial load
  loadFolders();

});
