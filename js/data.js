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
        // apiEntries: [
        //   { 
        //     id: 1, 
        //     subfolderId: 1, 
        //     name: 'Login API', 
        //     url: 'https://api.example.com/login', 
        //     method: 'POST',
        //     description: 'Authenticates users and returns a JWT token'
        //   }
        // ]
      };
      
      localStorage.setItem('folders', JSON.stringify(sampleData.folders));
      localStorage.setItem('subfolders', JSON.stringify(sampleData.subfolders));
      // localStorage.setItem('apiEntries', JSON.stringify(sampleData.apiEntries));
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
    console.log('All API entries from localStorage:', apiEntries);
    
    // If subfolderId is provided, filter by it
    if (subfolderId) {
      console.log('Filtering by subfolderId:', subfolderId);
      const filteredEntries = apiEntries.filter(api => {
        console.log('API entry subfolderId:', api.subfolderId, 'comparing with:', subfolderId, 'result:', api.subfolderId === subfolderId);
        return api.subfolderId === subfolderId;
      });
      console.log('Filtered API entries:', filteredEntries);
      return filteredEntries;
    }
    
    return apiEntries;
  },
  
  getApiEntryById: function(apiId) {
    const apiEntries = this.getApiEntries();
    return apiEntries.find(api => api.id === apiId);
  },
  
  addApiEntry: function(subfolderId, apiData) {
    console.log('Adding API entry with subfolderId:', subfolderId);
    console.log('API data:', apiData);

    const apiEntries = this.getApiEntries();
    const newApiEntry = {
      id: Date.now(),
      subfolderId: subfolderId, // Make sure this is set correctly
      name: apiData.name,
      url: apiData.url,
      method: apiData.method,
      description: apiData.description,
      headers: apiData.headers || [],
      body: apiData.body || '',
      importBatchId: apiData.importBatchId || null
    };

    console.log('New API entry to be added:', newApiEntry);
    apiEntries.push(newApiEntry);
    localStorage.setItem('apiEntries', JSON.stringify(apiEntries));

    // Verify the entry was added correctly
  const updatedEntries = JSON.parse(localStorage.getItem('apiEntries') || '[]');
  console.log('Updated API entries in localStorage:', updatedEntries);
  
    return newApiEntry;
  },
  
  updateApiEntry: function(apiId, apiData) {
    const apiEntries = this.getApiEntries();
    const index = apiEntries.findIndex(api => api.id === apiId);
    
    if (index !== -1) {

       // Preserve the subfolderId from the original entry
    const subfolderId = apiEntries[index].subfolderId;

    apiEntries[index] = {
      ...apiEntries[index],
      ...apiData,
      subfolderId: subfolderId, // Ensure subfolderId is preserved
      id: apiId // Ensure ID is preserved
    };
    console.log("API DATA:-----",JSON.stringify(apiEntries));
      localStorage.setItem('apiEntries', JSON.stringify(apiEntries));
      return true;
    }
    return false;
  },
  
  deleteApiEntry: function(apiId) {
    const apiEntries = this.getApiEntries();
    // Make sure we're comparing the same type (number to number)
    apiId = parseInt(apiId);
    
    // Log the API being deleted and its ID
    console.log('Deleting API with ID:', apiId);
    
    // Filter out only the API with the exact matching ID
    const updatedApiEntries = apiEntries.filter(api => {
      // Convert api.id to number if it's a string
      const currentApiId = typeof api.id === 'string' ? parseInt(api.id) : api.id;
      console.log('currentApiId===',currentApiId)
      return currentApiId !== apiId;
    });
    
    console.log('APIs before deletion:', apiEntries.length);
    console.log('APIs after deletion:', updatedApiEntries.length);
    
    localStorage.setItem('apiEntries', JSON.stringify(updatedApiEntries));
  },

  saveApiEntry: function(apiEntry) {
    const apiEntries = this.getApiEntries();
    const existingIndex = apiEntries.findIndex(api => api.id === apiEntry.id);
    
    if (existingIndex !== -1) {
      // Update existing entry
      apiEntries[existingIndex] = apiEntry;
    } else {
      // Add new entry
      apiEntries.push(apiEntry);
    }
    
    localStorage.setItem('apiEntries', JSON.stringify(apiEntries));
    return apiEntry;
  }






};
