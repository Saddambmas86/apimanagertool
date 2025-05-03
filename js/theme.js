document.addEventListener('DOMContentLoaded', function() {
  // Get theme toggle button and icons
  const themeToggle = document.getElementById('themeToggle');
  const moonIcon = document.getElementById('moonIcon');
  const sunIcon = document.getElementById('sunIcon');
  
  // Check for saved theme preference or use default light theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update icons based on current theme
  updateIcons(savedTheme);
  
  // Add click event to theme toggle button
  themeToggle.addEventListener('click', function() {
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    // Toggle theme
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Set the new theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update icons
    updateIcons(newTheme);
  });
  
  // Function to update icons based on theme
  function updateIcons(theme) {
    if (theme === 'dark') {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
    }
  }
});