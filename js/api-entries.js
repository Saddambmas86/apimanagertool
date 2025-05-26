document.addEventListener('DOMContentLoaded', function() {
  // Get subfolder ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const subfolderId = parseInt(urlParams.get('subfolderId'));
  
  console.log('Page loaded with subfolderId:', subfolderId);

  // Redirect if no subfolder ID
  if (!subfolderId) {
    console.log('No subfolderId found, redirecting to index.html');
    window.location.href = 'index.html';
    return;
  }
  
  // DOM elements
  const apiList = document.getElementById('apiList');
  const currentSubfolder = document.getElementById('currentSubfolder');
  const subfolderLink = document.getElementById('subfolderLink');
  const backToSubfoldersBtn = document.getElementById('backToSubfoldersBtn');
  const addApiBtn = document.getElementById('addApiBtn');
  const apiModal = document.getElementById('apiModal');
  const apiForm = document.getElementById('apiForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.querySelector('.modal-close');
  const apiIdInput = document.getElementById('apiId');
  const apiNameInput = document.getElementById('apiName');
  const apiUrlInput = document.getElementById('apiUrl');
  const apiMethodInput = document.getElementById('apiMethod');
  const apiDescriptionInput = document.getElementById('apiDescription');
  const apiBodyInput = document.getElementById('apiBody');
  const bodyContainer = document.getElementById('bodyContainer');
  const exportAllBtn = document.getElementById('exportAllBtn');
  const importAllBtn = document.getElementById('importAllBtn');
  
  // Show/hide body field based on method
  function toggleBodyField() {
    const method = apiMethodInput.value;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      bodyContainer.style.display = 'block';
    } else {
      bodyContainer.style.display = 'none';
    }
  }
  
  // Headers elements
  const headersContainer = document.getElementById('headersContainer');
  const addHeaderBtn = document.getElementById('addHeaderBtn');
  
  // Response panel elements
  const responsePanel = document.getElementById('responsePanel');
  const closeResponseBtn = document.getElementById('closeResponseBtn');
  const responseStatus = document.getElementById('responseStatus');
  const responseHeaders = document.getElementById('responseHeaders');
  const responseContent = document.getElementById('responseContent');
  
  // Add a header row to the form
  function addHeaderRow(key = '', value = '') {
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    headerRow.innerHTML = `
      <input type="text" class="header-key" placeholder="Header Name" value="${key}">
      <input type="text" class="header-value" placeholder="Header Value" value="${value}">
      <button type="button" class="remove-header">&times;</button>
    `;
    
    // Add event listener to remove button
    headerRow.querySelector('.remove-header').addEventListener('click', function() {
      headerRow.remove();
    });
    
    headersContainer.appendChild(headerRow);
  }
  
  // Get headers from form
  function getHeadersFromForm() {
    const headers = [];
    const headerRows = headersContainer.querySelectorAll('.header-row');
    
    headerRows.forEach(row => {
      const keyInput = row.querySelector('.header-key');
      const valueInput = row.querySelector('.header-value');
      
      if (keyInput && valueInput && keyInput.value.trim()) {
        headers.push({
          key: keyInput.value.trim(),
          value: valueInput.value.trim()
        });
      }
    });
    
    return headers;
  }
  
  // Set subfolder info and navigation
  function setSubfolderInfo() {
    const subfolders = DataService.getSubfolders();
    const subfolder = subfolders.find(sf => sf.id === subfolderId);
    
    if (subfolder) {
      currentSubfolder.textContent = subfolder.name;
      document.title = `API Manager - ${subfolder.name} APIs`;
      
      // Set up navigation
      const folders = DataService.getFolders();
      const parentFolder = folders.find(f => f.id === subfolder.folderId);
      
      if (parentFolder) {
        const folderUrl = `subfolder.html?folderId=${parentFolder.id}`;
        subfolderLink.textContent = parentFolder.name;
        subfolderLink.href = folderUrl;
        backToSubfoldersBtn.href = folderUrl;
      } else {
        backToSubfoldersBtn.href = 'index.html';
      }
    } else {
      window.location.href = 'index.html';
    }
  }
  
  // Format JSON for display
  function formatJSON(json) {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return json;
    }
  }
  
  // Display response in the panel
  function displayResponse(response, data) {
    // Show the response panel
    responsePanel.classList.remove('hidden');
    
    // Set status
    const statusCode = response.status;
    const isSuccess = statusCode >= 200 && statusCode < 300;
    responseStatus.textContent = `Status: ${statusCode} ${response.statusText}`;
    responseStatus.className = `response-status ${isSuccess ? 'status-success' : 'status-error'}`;
    
    // Set headers
    let headerHTML = '<h3>Headers:</h3><ul>';
    response.headers.forEach((value, key) => {
      headerHTML += `<li><strong>${key}:</strong> ${value}</li>`;
    });
    headerHTML += '</ul>';
    responseHeaders.innerHTML = headerHTML;
    
    // Set content
    if (data) {
      let formattedData;
      if (typeof data === 'object') {
        formattedData = formatJSON(data);
      } else {
        formattedData = data;
      }
      responseContent.innerHTML = `<pre>${formattedData}</pre>`;
    } else {
      responseContent.innerHTML = '<div class="response-empty">No response body</div>';
    }
  }
  
  // Test API endpoint
  async function testApiEndpoint(url, method, apiId) {
    try {
      // Get headers and body if apiId is provided
      let headers = {
        'Accept': 'application/json'
      };
      
      let body = null;
      
      if (apiId) {
        const api = DataService.getApiEntryById(parseInt(apiId));
        if (api) {
          // Add headers
          if (api.headers && api.headers.length > 0) {
            api.headers.forEach(header => {
              headers[header.key] = header.value;
            });
          }
          
          // Add body for POST, PUT, PATCH
          if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && api.body) {
            body = api.body;
            
            // Add Content-Type header if not present
            if (!headers['Content-Type']) {
              headers['Content-Type'] = 'application/json';
            }
          }
        }
      }
      
      // Make the fetch request with headers and body
      const fetchOptions = { 
        method: method,
        headers: headers
      };
      
      // Add body to request if present
      if (body) {
        fetchOptions.body = body;
      }
      
      const response = await fetch(url, fetchOptions);
      
      // Try to parse as JSON first
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Display the response
      displayResponse(response, data);
      
      // Return success/failure based on status code
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('API test failed:', error);
      
      // Create a mock response for the error
      const errorResponse = {
        status: 0,
        statusText: 'Connection Error',
        headers: new Map([['error', error.message]])
      };
      
      // Display the error
      displayResponse(errorResponse, { error: error.message });
      
      return false;
    }
  }
  // Update test result on the API card
  function updateTestResult(buttonElement, result) {
    buttonElement.textContent = result ? 'Pass' : 'Fail';
    buttonElement.className = result ? 
      'btn btn-success test-result' : 
      'btn btn-danger test-result';
    
    // Reset button after 3 seconds
    setTimeout(() => {
      buttonElement.textContent = 'Test';
      buttonElement.className = 'btn btn-info test-api';
    }, 3000);
  }
  
  // Load API entries - Make this function globally accessible
  window.loadApiEntries = function() {
    console.log('Loading API entries for subfolderId:', subfolderId);
    const apiEntries = DataService.getApiEntries(subfolderId);
    console.log('API entries retrieved:', apiEntries);
    apiList.innerHTML = '';
    
    if (apiEntries.length === 0) {
      console.log('No API entries found for this subfolder');
      apiList.innerHTML = '<p>No API entries found. Add your first API!</p>';
      return;
    }
    
    apiEntries.forEach(api => {
      // Format headers for display
      let headersHTML = '';
      if (api.headers && api.headers.length > 0) {
        headersHTML = `
          <div class="api-headers">
            <h4>Headers:</h4>
            <ul>
              ${api.headers.map(h => `<li><strong>${h.key}:</strong> ${h.value}</li>`).join('')}
            </ul>
          </div>
        `;
      } else {
        headersHTML = '<div class="api-headers no-headers">No custom headers</div>';
      }
      
      // Format body for display (for POST, PUT, PATCH methods)
      let bodyHTML = '';
      if ((api.method === 'POST' || api.method === 'PUT' || api.method === 'PATCH') && api.body) {
        bodyHTML = `
          <div class="api-body-container">
            <h4>Request Body:</h4>
            <pre class="api-body">${api.body}</pre>
          </div>
        `;
      }
      
      const li = document.createElement('li');
      li.className = 'api-item';
      li.innerHTML = `
        <div class="api-header">
          <h3>${api.name}</h3>
          <div>
            <span class="method-badge method-${api.method}">${api.method}</span>
            <button class="btn btn-info test-api" data-id="${api.id}" data-url="${api.url}" data-method="${api.method}">Test</button>
            <button class="btn btn-secondary edit-api" data-id="${api.id}">Edit</button>
            <button class="btn btn-danger delete-api" data-id="${api.id}">Delete</button>
            <button class="btn btn-export export-api" data-id="${api.id}">Export</button>
          </div>
        </div>
    <div class="api-details">
            <p><strong>URL:</strong> ${api.url}</p>
            ${api.description ? `<p><strong>Description:</strong> ${api.description}</p>` : ''}
          </div>
        </div>
      `;
      apiList.appendChild(li);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-api').forEach(btn => {
      btn.addEventListener('click', function() {
        const apiId = parseInt(this.getAttribute('data-id'));
        editApi(apiId);
      });
    });
    
    document.querySelectorAll('.delete-api').forEach(btn => {
      btn.addEventListener('click', function() {
        const apiId = parseInt(this.getAttribute('data-id'));
        if (confirm('Are you sure you want to delete this API?')) {
          DataService.deleteApiEntry(apiId);
          loadApiEntries();
        }
      });
    });
    
    // Add event listeners to test buttons
// Add event listeners to test buttons
document.querySelectorAll('.test-api').forEach(btn => {
  btn.addEventListener('click', async function() {
    const url = this.getAttribute('data-url');
    const method = this.getAttribute('data-method');
    const apiId = parseInt(this.getAttribute('data-id'));
    
    // Change button text while testing
    this.textContent = 'Testing...';
    this.disabled = true;
    
    // Test the API - now passing the apiId parameter
    const result = await testApiEndpoint(url, method, apiId);
    
    // Update button with result
    this.disabled = false;
    updateTestResult(this, result);
  });
});
    
    // Add event listeners to export buttons
    document.querySelectorAll('.export-api').forEach(btn => {
      btn.addEventListener('click', function() {
        const apiId = parseInt(this.getAttribute('data-id'));
        exportApi(apiId);
      });
    });
  };
  
  // Use the global function here too
  function importAllApis() {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.multiple = true; // Allow multiple file selection
    fileInput.style.position = 'absolute';
    fileInput.style.top = '-1000px'; // Position off-screen
    
    fileInput.addEventListener('change', function(e) {
      const files = e.target.files;
      if (!files || files.length === 0) {
        // Remove the file input if no file was selected
        if (document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
        return;
      }
      
      // Process each file independently
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          try {
            const importData = JSON.parse(event.target.result);
            
            // Check if this is a Postman collection
            if (importData.info && importData.item) {
              // This is a Postman collection format
              importPostmanCollection(importData);
            } else if (importData.apis && Array.isArray(importData.apis)) {
              // This is our standard format with apis array
              importStandardFormat(importData.apis);
            } else if (Array.isArray(importData)) {
              // This is an array of API objects
              importStandardFormat(importData);
            } else if (importData.name && importData.url && importData.method) {
              // This is a single API export
              importSingleApi(importData);
            } else {
              alert(`Invalid importing API: ${file.name}, not a valid format`);
            }
          } catch (error) {
            alert(`Error importing API ${file.name}: ${error.message}`);
            console.error('Import error:', error);
          }
        };
        
        reader.readAsText(file);
      });
      
      // Remove the file input from the DOM after processing all files
      if (document.body.contains(fileInput)) {
        document.body.removeChild(fileInput);
      }
    });
    
    // Add event listener to remove the input if the dialog is canceled
    window.addEventListener('focus', function onFocus() {
      // Short delay to ensure the file dialog has been handled
      setTimeout(() => {
        // If the file input still has no files, remove it
        if (fileInput.files.length === 0 && document.body.contains(fileInput)) {
          document.body.removeChild(fileInput);
        }
        // Remove this event listener
        window.removeEventListener('focus', onFocus);
      }, 300);
    }, { once: true });
    
    // Append to the document and click it
    document.body.appendChild(fileInput);
    fileInput.click();
  }
  
  // Import from Postman collection format
  function importPostmanCollection(collection) {
    try {
      const apis = [];
      
      // Process each item in the collection
      collection.item.forEach(item => {
        // Skip folders (items with subitems)
        if (item.item) return;
        
        if (item.request) {
          // Extract API details from Postman request
          const apiData = {
            name: item.name || 'Imported API',
            url: typeof item.request.url === 'object' ? 
                 item.request.url.raw || '' : 
                 item.request.url || '',
            method: item.request.method || 'GET',
            description: item.request.description || '',
            body: item.request.body,
            headers: [],
          };

          // Extract body for POST, PUT, PATCH methods
if ((apiData.method === 'POST' || apiData.method === 'PUT' || apiData.method === 'PATCH') && item.request.body) {
  // Handle different body modes
  if (item.request.body.mode === 'raw' && item.request.body.raw) {
    apiData.body = item.request.body.raw;
  } else if (item.request.body.mode === 'formdata' && Array.isArray(item.request.body.formdata)) {
    // Convert formdata to JSON
    const formData = {};
    item.request.body.formdata.forEach(item => {
      if (item.key && !item.disabled) {
        formData[item.key] = item.value || '';
      }
    });
    apiData.body = JSON.stringify(formData, null, 2);
  }
}
          
          // Extract headers
          if (item.request.header && Array.isArray(item.request.header)) {
            item.request.header.forEach(header => {
              if (header.key && !header.disabled) {
                apiData.headers.push({
                  key: header.key,
                  value: header.value || ''
                });
              }
            });
          }
          
          apis.push(apiData);
        }
      });
      
      if (apis.length === 0) {
        alert('No valid APIs found in the Postman collection');
        return;
      }
      
      // Import the extracted APIs
      const importCount = importApiArray(apis);
      alert(`Successfully imported ${importCount} APIs from Postman collection`);
      loadApiEntries();
      
    } catch (error) {
      console.error('Postman import error:', error);
      alert('Error importing Postman collection: ' + error.message);
    }
  }
  
  // Import standard format (array of API objects)
  function importStandardFormat(apiArray) {
    const importCount = importApiArray(apiArray);
    alert(`Successfully imported ${importCount} APIs`);
    loadApiEntries();
  }
  
  // Import a single API
  function importSingleApi(apiData) {
    DataService.addApiEntry(subfolderId, apiData);
    alert('Successfully imported 1 API');
    loadApiEntries();
  }
  
  // Common function to import an array of APIs
  function importApiArray(apiArray) {
    let importCount = 0;
    console.log('Importing API array with subfolderId:', subfolderId);
    
    // Generate a unique import batch ID
    const importBatchId = Date.now();
    
    apiArray.forEach((api, index) => {
      if (api.name && api.url && api.method) {
        // Create a unique ID for each API by adding the index to the timestamp
        const uniqueApiId = Date.now() + index;
        console.log('Date.now',Date.now())
        console.log('index',index);
        console.log('Adding API to subfolder:', subfolderId, 'API:', api.name);
        
        DataService.addApiEntry(subfolderId, {
          name: api.name,
          url: api.url,
          method: api.method,
          description: api.description || '',
          headers: api.headers || [],
          body: api.body || '',
          subfolderId: subfolderId, // Explicitly set the subfolderId
          importBatchId: importBatchId, // Batch ID to track which APIs were imported together
          uniqueId: uniqueApiId // Unique ID for each API
        });
        
        console.log('Imported API with ID:', uniqueApiId, 'Batch:', importBatchId);
        console.log('ImportedCount:', importCount);
        importCount++;
      } else {
        console.warn('Skipping invalid API entry:', api);
      }
    });
    
    return importCount;
  }
  
   
  // Reset form for adding a new API
  function resetForm() {
    modalTitle.textContent = 'Add New API';
    apiForm.reset();
    apiIdInput.value = '';
    
    // Clear headers container
    headersContainer.innerHTML = '';
    
    // Set initial body field visibility
    toggleBodyField();
  }
  
  // Event Listeners
  addApiBtn.addEventListener('click', function() {
    resetForm();
    apiModal.classList.add('active');
  });
  
  exportAllBtn.addEventListener('click', exportAllApis);
  
  importAllBtn.addEventListener('click', importAllApis);
  
  modalClose.addEventListener('click', function() {
    apiModal.classList.remove('active');
  });
  
  // Add event listener to method select
  apiMethodInput.addEventListener('change', toggleBodyField);
  
  apiForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Make sure apiIdInput is properly defined
    const apiIdField = document.getElementById('apiId');
    const apiId = apiIdField.value ? parseInt(apiIdField.value) : null;
    
    const name = apiNameInput.value.trim();
    const url = apiUrlInput.value.trim();
    const method = apiMethodInput.value;
    const description = apiDescriptionInput.value.trim();
    const headers = getHeadersFromForm();
    
    // Get body if method is POST, PUT or PATCH
    let body = null;
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      body = apiBodyInput.value.trim();
    }
    
    if (apiId) {
      // Update existing API
      DataService.updateApiEntry(apiId, {
        name,
        url,
        method,
        description,
        headers,
        body
      });
    } else {
      // Add new API
      DataService.addApiEntry(subfolderId, {
        name,
        url,
        method,
        description,
        headers,
        body
      });
    }
    
    apiModal.classList.remove('active');
    resetForm();
    loadApiEntries();
  });
  
  // Close response panel (now just clears content instead of hiding)
  closeResponseBtn.addEventListener('click', function() {
  // Clear the response content instead of hiding the panel
  responseStatus.textContent = '';
  responseStatus.className = 'response-status';
  responseHeaders.innerHTML = '';
  responseContent.innerHTML = '<div class="response-empty">No response data to display. Test an API to see the response.</div>';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target === apiModal) {
      apiModal.classList.remove('active');
    }
  });
  
  // Initial load
  setSubfolderInfo();
  loadApiEntries();
});



  // Export all APIs in the current subfolder
  // Declare subfolderId as a global variable
  let subfolderId;
  
  document.addEventListener('DOMContentLoaded', function() {
    // Set subfolderId from URL
    const urlParams = new URLSearchParams(window.location.search);
    subfolderId = parseInt(urlParams.get('subfolderId'));
    
    // Redirect if no subfolder ID
    if (!subfolderId) {
      window.location.href = 'index.html';
      return;
    }
  
    // Set subfolder info and navigation
    function setSubfolderInfo() {
      const subfolders = DataService.getSubfolders();
      const subfolder = subfolders.find(sf => sf.id === subfolderId);
      
      if (subfolder) {
        currentSubfolder.textContent = subfolder.name;
        document.title = `API Manager - ${subfolder.name} APIs`;
        
        // Set up navigation
        const folders = DataService.getFolders();
        const parentFolder = folders.find(f => f.id === subfolder.folderId);
        
        if (parentFolder) {
          const folderUrl = `subfolder.html?folderId=${parentFolder.id}`;
          subfolderLink.textContent = parentFolder.name;
          subfolderLink.href = folderUrl;
          backToSubfoldersBtn.href = folderUrl;
        } else {
          backToSubfoldersBtn.href = 'index.html';
        }
      } else {
        window.location.href = 'index.html';
      }
    }
    
    // Format JSON for display
    function formatJSON(json) {
      try {
        return JSON.stringify(json, null, 2);
      } catch (e) {
        return json;
      }
    }
    
    // Display response in the panel
    function displayResponse(response, data) {
      // Show the response panel
      responsePanel.classList.remove('hidden');
      
      // Set status
      const statusCode = response.status;
      const isSuccess = statusCode >= 200 && statusCode < 300;
      responseStatus.textContent = `Status: ${statusCode} ${response.statusText}`;
      responseStatus.className = `response-status ${isSuccess ? 'status-success' : 'status-error'}`;
      
      // Set headers
      let headerHTML = '<h3>Headers:</h3><ul>';
      response.headers.forEach((value, key) => {
        headerHTML += `<li><strong>${key}:</strong> ${value}</li>`;
      });
      headerHTML += '</ul>';
      responseHeaders.innerHTML = headerHTML;
      
      // Set content
      if (data) {
        let formattedData;
        if (typeof data === 'object') {
          formattedData = formatJSON(data);
        } else {
          formattedData = data;
        }
        responseContent.innerHTML = `<pre>${formattedData}</pre>`;
      } else {
        responseContent.innerHTML = '<div class="response-empty">No response body</div>';
      }
    }
    
    // Test API endpoint
    async function testApiEndpoint(url, method) {
      try {
        // Make the fetch request
        const response = await fetch(url, { 
          method: method,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        // Try to parse as JSON first
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        // Display the response
        displayResponse(response, data);
        
        // Return success/failure based on status code
        return response.status >= 200 && response.status < 300;
      } catch (error) {
        console.error('API test failed:', error);
        
        // Create a mock response for the error
        const errorResponse = {
          status: 0,
          statusText: 'Connection Error',
          headers: new Map([['error', error.message]])
        };
        
        // Display the error
        displayResponse(errorResponse, { error: error.message });
        
        return false;
      }
    }
    
    // Load API entries
    function loadApiEntries() {
      const apiEntries = DataService.getApiEntries(subfolderId);
      apiList.innerHTML = '';
      
      if (apiEntries.length === 0) {
        apiList.innerHTML = '<p>No API entries found. Add your first API!</p>';
        return;
      }

      // Create and append API cards to the DOM
      apiEntries.forEach(api => {
        const li = document.createElement('li');
        li.className = 'api-item';
        li.innerHTML = `
          <div class="api-header">
            <div>
              <h3>${api.name}</h3>
            </div>
            <div class="api-actions">
             <span class="method-badge method-${api.method}">${api.method}</span>
              <button class="btn btn-secondary test-api" data-id="${api.id}">Test</button>
              <button class="btn btn-secondary export-api" data-id="${api.id}">Export</button>
              <button class="btn edit-api" data-id="${api.id}">Edit</button>
              <button class="btn btn-danger delete-api" data-id="${api.id}">Delete</button>
            </div>
          </div>
          <div class="api-details">
            <p><strong>URL:</strong> ${api.url}</p>
            ${api.description ? `<p><strong>Description:</strong> ${api.description}</p>` : ''}
          </div>
        `;
        apiList.appendChild(li);
      });
      

      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-api').forEach(btn => {
        btn.addEventListener('click', function() {
          const apiId = parseInt(this.getAttribute('data-id'));
          editApi(apiId);
        });
      });
      
      document.querySelectorAll('.delete-api').forEach(btn => {
        btn.addEventListener('click', function() {
          const apiId = parseInt(this.getAttribute('data-id'));
          if (confirm('Are you sure you want to delete this API?')) {
            DataService.deleteApiEntry(apiId);
            loadApiEntries();
          }
        });
      });
      
      // Add event listeners to export buttons
      document.querySelectorAll('.export-api').forEach(btn => {
        btn.addEventListener('click', function() {
          const apiId = parseInt(this.getAttribute('data-id'));
          exportApi(apiId);
        });
      });
    }
    
      // Get headers container and add header button
      const headersContainer = document.getElementById('headersContainer');
      const addHeaderBtn = document.getElementById('addHeaderBtn');
      
      // Add event listener for the Add Header button
      addHeaderBtn.addEventListener('click', function() {
        addHeaderField();
      });
      
      // Function to add a new header field
      function addHeaderField(key = '', value = '') {
        const headerRow = document.createElement('div');
        headerRow.className = 'header-row';
        headerRow.innerHTML = `
          <div class="header-inputs">
            <input type="text" class="header-key" placeholder="Header Name" value="${key}">
            <input type="text" class="header-value" placeholder="Header Value" value="${value}">
          </div>
          <button type="button" class="btn btn-danger remove-header">Remove</button>
        `;
        
        // Add event listener to the remove button
        const removeBtn = headerRow.querySelector('.remove-header');
        removeBtn.addEventListener('click', function() {
          headerRow.remove();
        });
        
        headersContainer.appendChild(headerRow);
      }
      
      // Move this function outside of other functions to make it globally accessible
      function getHeadersFromForm() {
        
        const headers = [];
        const headerRows = headersContainer.querySelectorAll('.header-row');
        headerRows.forEach(row => {
          const keyInput = row.querySelector('.header-key');
          const valueInput = row.querySelector('.header-value');
          
          if (keyInput && valueInput && keyInput.value.trim()) {
            headers.push({
              key: keyInput.value.trim(),
              value: valueInput.value.trim()
            });
          }
        });
        
        return headers;
      }
      

//  // Open modal for editing an API
//  function editApi(apiId) {
//   const api = DataService.getApiEntryById(apiId);
//   if (api) {
//     modalTitle.textContent = 'Edit API';
//     apiIdInput.value = api.id;
//     apiNameInput.value = api.name;
//     apiUrlInput.value = api.url;
//     apiMethodInput.value = api.method;
//     apiDescriptionInput.value = api.description || '';
//     apiBodyInput.value = api.body || '';
    
//     toggleBodyField();
//     // Clear headers container
//     headersContainer.innerHTML = '';
    
//     // Add header rows
//     if (api.headers && api.headers.length > 0) {
//       api.headers.forEach(header => {
//         addHeaderRow(header.key, header.value);
//       });
//     }
    
//     // Set body field visibility based on method
//     toggleBodyField();
    
//     apiModal.classList.add('active');
//   }
// }


      // Modify the editApi function to populate headers
      function editApi(apiId) {
        const api = DataService.getApiEntryById(apiId);
        if (!api) return;
        
        // Clear existing headers
        headersContainer.innerHTML = '';
        
        // Set form values
        modalTitle.textContent = 'Edit API';
        apiIdInput.value = api.id;
        apiNameInput.value = api.name;
        apiUrlInput.value = api.url;
        apiMethodInput.value = api.method;
        apiDescriptionInput.value = api.description || '';
        
        // Add header fields if they exist
        if (api.headers && api.headers.length > 0) {
          api.headers.forEach(header => {
            addHeaderField(header.key, header.value);
          });
        }
        
        // Show modal
        apiModal.classList.add('active');
      }
      
      // // Event Listeners
      // addApiBtn.addEventListener('click', function() {
      //   resetForm();
      //   apiModal.classList.add('active');
      // });
      
      // exportAllBtn.addEventListener('click', exportAllApis);
      
      // importAllBtn.addEventListener('click', importAllApis);
      
      // modalClose.addEventListener('click', function() {
      //   apiModal.classList.remove('active');
      // });
      
      apiForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const apiId = apiIdInput.value ? parseInt(apiIdInput.value) : null;
        const apiData = {
          name: apiNameInput.value.trim(),
          url: apiUrlInput.value.trim(),
          method: apiMethodInput.value,
          description: apiDescriptionInput.value.trim(),
          headers: getHeadersFromForm() // Add headers to the API data
        };
        console.log("APIS",apiData);
        
        if (apiId) {
          // Update existing API
          DataService.updateApiEntry(apiId, apiData);
        } else {
          // Add new API
          DataService.addApiEntry(subfolderId, apiData);
        }
        
        // Reset form and close modal
        resetForm();
        apiModal.classList.remove('active');
        
        // Reload API entries
        loadApiEntries();
      });
      
      // Close response panel (now just clears content instead of hiding)
      closeResponseBtn.addEventListener('click', function() {
      // Clear the response content instead of hiding the panel
      responseStatus.textContent = '';
      responseStatus.className = 'response-status';
      responseHeaders.innerHTML = '';
      responseContent.innerHTML = '<div class="response-empty">No response data to display. Test an API to see the response.</div>';
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', function(e) {
        if (e.target === apiModal) {
          apiModal.classList.remove('active');
        }
      });
      
      // Initial load
      setSubfolderInfo();
      loadApiEntries();
    });
    
    
    // Function to export API details


    function exportApi(apiId) {
      const api = DataService.getApiEntryById(apiId);
      if (!api) return;
      
      // Create Postman collection format
const postmanCollection = {
    info: {
      _postman_id: generateUUID(),
      name: api.name,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: api.description || ""
    },
    item: [
      {
        name: api.name,
        request: {
          method: api.method,
          header: api.headers ? api.headers.map(h => ({
            key: h.key,
            value: h.value,
            type: "text"
          })) : [],
          url: {
            raw: api.url,
            protocol: api.url.startsWith("https") ? "https" : "http",
            host: api.url.replace(/^https?:\/\//, '').split('/')[0].split('.'),
            path: api.url.replace(/^https?:\/\/[^\/]+/, '').split('/').filter(p => p)
          },
          description: api.description || "",
          // Add body to the request if it exists and method supports it
          body: (api.method === 'POST' || api.method === 'PUT' || api.method === 'PATCH') && api.body ? {
            mode: "raw",
            raw: api.body,
            options: {
              raw: {
                language: "json"
              }
            }
          } : undefined
        },
        response: []
      }
    ]
  };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(postmanCollection, null, 2);
      
      // Create a blob with the JSON data
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element
      const a = document.createElement('a');
      a.href = url;
      a.download = `${api.name.replace(/\s+/g, '_')}_postman_collection.json`;
      
      // Append to the document, click it, and remove it
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
    
      // Export all APIs in the current subfolder
function exportAllApis() {
  const apiEntries = DataService.getApiEntries(subfolderId);
  if (apiEntries.length === 0) {
    alert('No APIs to export');
    return;
  }
  
  // Get subfolder name for the collection name
  const subfolders = DataService.getSubfolders();
  const subfolder = subfolders.find(sf => sf.id === subfolderId);
  const collectionName = subfolder ? subfolder.name : 'API Collection';
  
  // Create Postman collection format
  const postmanCollection = {
    info: {
      _postman_id: generateUUID(),
      name: collectionName,
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      description: `Exported from API Manager - ${collectionName}`
    },
    item: apiEntries.map(api => ({
      name: api.name,
      request: {
        method: api.method,
        header: api.headers ? api.headers.map(h => ({
          key: h.key,
          value: h.value,
          type: "text"
        })) : [],
        url: {
          raw: api.url,
          protocol: api.url.startsWith("https") ? "https" : "http",
          host: api.url.replace(/^https?:\/\//, '').split('/')[0].split('.'),
          path: api.url.replace(/^https?:\/\/[^\/]+/, '').split('/').filter(p => p)
        },
        description: api.description || "",
        // Add body to the request if it exists and method supports it
        body: (api.method === 'POST' || api.method === 'PUT' || api.method === 'PATCH') && api.body ? {
          mode: "raw",
          raw: api.body,
          options: {
            raw: {
              language: "json"
            }
          }
        } : undefined
      },
      response: []
    }))
  };

  // Convert to JSON string
  const jsonString = JSON.stringify(postmanCollection, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const a = document.createElement('a');
  a.href = url;
  a.download = `${collectionName.replace(/\s+/g, '_')}_postman_collection.json`;
  
  // Append to the document, click it, and remove it
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
      // Helper function to generate UUID for Postman collection
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function saveApiEntry(event) {
  event.preventDefault();
  
  // Get form values
  const name = apiNameInput.value.trim();
  const method = apiMethodInput.value;
  const url = apiUrlInput.value.trim();
  const description = apiDescriptionInput.value.trim();
  
  // Get body content if applicable
  let body = '';
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    body = apiBodyInput.value.trim();
  }
  
  // Get headers
  const headers = [];
  const headerRows = headersContainer.querySelectorAll('.header-row');
  headerRows.forEach(row => {
    const key = row.querySelector('.header-key').value.trim();
    const value = row.querySelector('.header-value').value.trim();
    if (key && value) {
      headers.push({ key, value });
    }
  });
  
  // Create or update API entry
  const apiEntry = {
    id: currentApiId || generateId(),
    name,
    method,
    url,
    description,
    headers,
    body, // Make sure body is included here
    subfolderId
  };
  
  // Save to data service
  DataService.saveApiEntry(apiEntry);
  
  // Refresh the list and close modal
  renderApiList();
  closeModal();
}
