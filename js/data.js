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

        if (!localStorage.getItem('storageConfig')) {
          localStorage.setItem('storageConfig', JSON.stringify(this.storageConfig));
        }
        if (!localStorage.getItem('backups')) {
          localStorage.setItem('backups', JSON.stringify([]));
        }

      // Setup auto-save if enabled
    if (this.autoSaveConfig.enabled) {
      this.setupAutoSave();
    }}
  },
  
  // Folders CRUD operations
  getFolders: function() {
    return JSON.parse(localStorage.getItem('folders') || '[]');
  },

  autoSaveToFile: async function(data) {
    try {
      // Create a complete data object
      const completeData = {
        folders: this.getFolders(),
        subfolders: this.getSubfolders(),
        apiEntries: this.getApiEntries(),
        lastUpdated: new Date().toISOString()
      };

      // Save to localStorage as backup
      localStorage.setItem('lastSavedData', JSON.stringify(completeData));

      // Save to file using fetch
      const response = await fetch('api_manager_data.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeData, null, 2)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving to file:', error);
      return false;
    }
  },
  
  addFolder: function(name) {
    const folders = this.getFolders();
    const newFolder = {
      id: Date.now(),
      name: name
    };
    folders.push(newFolder);
    localStorage.setItem('folders', JSON.stringify(folders));
    this.autoSaveToFile({
      folders: folders,
      subfolders: this.getSubfolders(),
      apiEntries: this.getApiEntries()
    });
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

    this.autoSaveToFile({
      folders: updatedFolders,
      subfolders: updatedSubfolders,
      apiEntries: updatedApiEntries
    });
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
  this.autoSaveToFile({
    folders: this.getFolders(),
    subfolders: this.getSubfolders(),
    apiEntries: apiEntries
  });
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
  },


  autoSaveConfig: {
    enabled: true,
    debounceDelay: 2000, // Wait 2 seconds after last change before saving
    lastSaved: null
  },

  // File storage operations
  fileStorage: {
    fileName: 'api_manager_data.json',

    // Save data to file
    saveToFile: function() {
      const data = {
        folders: JSON.parse(localStorage.getItem('folders') || '[]'),
        subfolders: JSON.parse(localStorage.getItem('subfolders') || '[]'),
        apiEntries: JSON.parse(localStorage.getItem('apiEntries') || '[]'),
        lastSaved: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = this.fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    },

    // Load data from file
    loadFromFile: function() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (data.folders && data.subfolders && data.apiEntries) {
              localStorage.setItem('folders', JSON.stringify(data.folders));
              localStorage.setItem('subfolders', JSON.stringify(data.subfolders));
              localStorage.setItem('apiEntries', JSON.stringify(data.apiEntries));
              
              // Refresh the page to show loaded data
              window.location.reload();
              alert('file uploaded Successfully')
            } else {
              alert('Invalid data file format');
            }
          } catch (error) {
            console.error('Error loading data:', error);
            alert('Error loading data file');
          }
        };
        reader.readAsText(file);
      };

      input.click();
    }
  },


  storageConfig: {
    autoSaveInterval: 5000, // Auto-save every 5 seconds
    maxBackups: 5, // Maximum number of backups to keep
    lastAutoSave: null
  },

  loadSavedData: async function() {
    try {
      const response = await fetch('api_manager_data.json');
      if (response.ok) {
        const data = await response.json();
        
        // Update localStorage with loaded data
        localStorage.setItem('folders', JSON.stringify(data.folders));
        localStorage.setItem('subfolders', JSON.stringify(data.subfolders));
        localStorage.setItem('apiEntries', JSON.stringify(data.apiEntries));
        
        console.log('Saved data loaded successfully');
        return true;
      }
    } catch (error) {
      console.log('No saved data found or error loading data');
      return false;
    }
  },

    // Auto-save functionality
    startAutoSave: function() {
      setInterval(() => {
        this.createBackup();
        this.storageConfig.lastAutoSave = new Date().toISOString();
        localStorage.setItem('storageConfig', JSON.stringify(this.storageConfig));
      }, this.storageConfig.autoSaveInterval);
    },


// Create a backup of current data
createBackup: function() {
  const currentData = {
    timestamp: new Date().toISOString(),
    folders: this.getFolders(),
    subfolders: this.getSubfolders(),
    apiEntries: this.getApiEntries()
  };

  let backups = JSON.parse(localStorage.getItem('backups') || '[]');
  backups.unshift(currentData);

  // Keep only the specified number of backups
  if (backups.length > this.storageConfig.maxBackups) {
    backups = backups.slice(0, this.storageConfig.maxBackups);
  }

  localStorage.setItem('backups', JSON.stringify(backups));
},


  // Restore from a backup
  restoreFromBackup: function(timestamp) {
    const backups = JSON.parse(localStorage.getItem('backups') || '[]');
    const backup = backups.find(b => b.timestamp === timestamp);

    if (backup) {
      localStorage.setItem('folders', JSON.stringify(backup.folders));
      localStorage.setItem('subfolders', JSON.stringify(backup.subfolders));
      localStorage.setItem('apiEntries', JSON.stringify(backup.apiEntries));
      return true;
    }
    return false;
  },

  // Get available backups
  getBackups: function() {
    return JSON.parse(localStorage.getItem('backups') || '[]');
  },

  // Clear old backups
  clearBackups: function() {
    localStorage.setItem('backups', JSON.stringify([]));
  },

  setupAutoSave: function() {
    let saveTimeout = null;

    // Function to save data to file
    const saveData = async () => {
      const data = {
        folders: this.getFolders(),
        subfolders: this.getSubfolders(),
        apiEntries: this.getApiEntries(),
        lastSaved: new Date().toISOString()
      };

      try {
        // Save to file using the Fetch API
        const response = await fetch('api_manager_data.json', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data, null, 2)
        });

        if (response.ok) {
          this.autoSaveConfig.lastSaved = new Date().toISOString();
          console.log('Data auto-saved successfully');
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    };

    // Modify all data modification methods to trigger auto-save
    const originalMethods = {
      addFolder: this.addFolder,
      deleteFolder: this.deleteFolder,
      addSubfolder: this.addSubfolder,
      deleteSubfolder: this.deleteSubfolder,
      addApiEntry: this.addApiEntry,
      updateApiEntry: this.updateApiEntry,
      deleteApiEntry: this.deleteApiEntry,
      saveApiEntry: this.saveApiEntry
    };

    // Wrap each method with auto-save functionality
    Object.keys(originalMethods).forEach(methodName => {
      this[methodName] = (...args) => {
        const result = originalMethods[methodName].apply(this, args);

        // Clear existing timeout and set a new one
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(saveData, this.autoSaveConfig.debounceDelay);

        return result;
      };
    });
  }


};


document.addEventListener('DOMContentLoaded', async () => {

      // Save button
      const saveBtn = document.getElementById('addsave');
      saveBtn.onclick = () => DataService.fileStorage.saveToFile();
      
      // Load button
      const loadBtn = document.getElementById('addload');
      loadBtn.onclick = () => DataService.fileStorage.loadFromFile();
});
