// Data management using localStorage
const DataService = {
  // Initialize with some sample data if none exists
  init: function() {
    if (!localStorage.getItem('folders')) {
      const sampleData = {
        folders: [
          { id: 1, name: 'Development APIs' },
          { id: 2, name: 'Testing APIs' },
          { id: 3, name: 'Production APIs' }
        ],
        subfolders: [
          { id: 1, folderId: 1, name: 'Authentication' },
          { id: 2, folderId: 1, name: 'User Management' },
          { id: 3, folderId: 2, name: 'Mock Services' },
          { id: 4, folderId: 3, name: 'Payment Gateway' }
        ],
        apiEntries: [
          { 
            id: 1, 
            subfolderId: 1, 
            name: 'Login API', 
            url: 'https://api.example.com/login', 
            method: 'POST',
            description: 'Authenticates users and returns a JWT token'
          }
        ]
      };
      
      localStorage.setItem('folders', JSON.stringify(sampleData.folders));
      localStorage.setItem('subfolders', JSON.stringify(sampleData.subfolders));
      localStorage.setItem('apiEntries', JSON.stringify(sampleData.apiEntries));
    }
  },
  
  // Folders CRUD operations
  getFolders: function() {
    return JSON.parse(localStorage.getItem('folders') || '[]');
  },
  
  addFolder: function(name) {
    const folders = this.getFolders();
    const newFolder = {
      id: Date.now(),
      name: name
    };
    folders.push(newFolder);
    localStorage.setItem('folders', JSON.stringify(folders));
    return newFolder;
  },
  
  deleteFolder: function(folderId) {
    // Delete the folder
    const folders = this.getFolders();
    const updatedFolders = folders.filter(folder => folder.id !== folderId);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
    
    // Delete all subfolders belonging to this folder
    const subfolders = this.getSubfolders();
    const subfoldersToDelete = subfolders.filter(sf => sf.folderId === folderId);
    const updatedSubfolders = subfolders.filter(sf => sf.folderId !== folderId);
    localStorage.setItem('subfolders', JSON.stringify(updatedSubfolders));
    
    // Delete all API entries belonging to the deleted subfolders
    const apiEntries = this.getApiEntries();
    const subfoldersIds = subfoldersToDelete.map(sf => sf.id);
    const updatedApiEntries = apiEntries.filter(api => !subfoldersIds.includes(api.subfolderId));
    localStorage.setItem('apiEntries', JSON.stringify(updatedApiEntries));
  },
  
  // Subfolders CRUD operations
  getSubfolders: function(folderId) {
    const subfolders = JSON.parse(localStorage.getItem('subfolders') || '[]');
    return folderId ? subfolders.filter(sf => sf.folderId === folderId) : subfolders;
  },
  
  getSubfolderById: function(subfolderId) {
    const subfolders = this.getSubfolders();
    return subfolders.find(sf => sf.id === subfolderId);
  },
  
  addSubfolder: function(folderId, name) {
    const subfolders = this.getSubfolders();
    const newSubfolder = {
      id: Date.now(),
      folderId: folderId,
      name: name
    };
    subfolders.push(newSubfolder);
    localStorage.setItem('subfolders', JSON.stringify(subfolders));
    return newSubfolder;
  },
  
  deleteSubfolder: function(subfolderId) {
    // Delete the subfolder
    const subfolders = this.getSubfolders();
    const updatedSubfolders = subfolders.filter(sf => sf.id !== subfolderId);
    localStorage.setItem('subfolders', JSON.stringify(updatedSubfolders));
    
    // Delete all API entries belonging to this subfolder
    const apiEntries = this.getApiEntries();
    const updatedApiEntries = apiEntries.filter(api => api.subfolderId !== subfolderId);
    localStorage.setItem('apiEntries', JSON.stringify(updatedApiEntries));
  },
  
  // API Entries CRUD operations
  getApiEntries: function(subfolderId) {
    const apiEntries = JSON.parse(localStorage.getItem('apiEntries') || '[]');
    return subfolderId ? apiEntries.filter(api => api.subfolderId === subfolderId) : apiEntries;
  },
  
  getApiEntryById: function(apiId) {
    const apiEntries = this.getApiEntries();
    return apiEntries.find(api => api.id === apiId);
  },
  
  addApiEntry: function(subfolderId, apiData) {
    const apiEntries = this.getApiEntries();
    const newApiEntry = {
      id: Date.now(),
      subfolderId: subfolderId,
      name: apiData.name,
      url: apiData.url,
      method: apiData.method,
      description: apiData.description,
      headers: apiData.headers || []
    };
    apiEntries.push(newApiEntry);
    localStorage.setItem('apiEntries', JSON.stringify(apiEntries));
    return newApiEntry;
  },
  
  updateApiEntry: function(apiId, apiData) {
    const apiEntries = this.getApiEntries();
    const index = apiEntries.findIndex(api => api.id === apiId);
    
    if (index !== -1) {
      apiEntries[index] = {
        ...apiEntries[index],
        name: apiData.name,
        url: apiData.url,
        method: apiData.method,
        description: apiData.description,
        headers: apiData.headers || []
      };
      localStorage.setItem('apiEntries', JSON.stringify(apiEntries));
      return true;
    }
    return false;
  },
  
  deleteApiEntry: function(apiId) {
    const apiEntries = this.getApiEntries();
    const filteredEntries = apiEntries.filter(api => api.id !== apiId);
    localStorage.setItem('apiEntries', JSON.stringify(filteredEntries));
  }
};
