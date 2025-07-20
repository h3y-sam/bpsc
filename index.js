// Toggle dropdown menu visibility
function toggleDropdown(dropdown, show = null) {
  const isVisible = show !== null ? show : !dropdown.classList.contains('active');
  const dropdownContent = dropdown.querySelector('.nav-dropdown-content');
  
  if (isVisible) {
    dropdown.classList.add('active');
    dropdownContent.classList.add('show');
    dropdown.setAttribute('aria-expanded', 'true');
    
    // Focus first item when opening
    const firstLink = dropdownContent.querySelector('a');
    if (firstLink) firstLink.focus();
  } else {
    dropdown.classList.remove('active');
    dropdownContent.classList.remove('show');
    dropdown.setAttribute('aria-expanded', 'false');
    
    // Focus the button when closing
    const button = dropdown.querySelector('.nav-dropbtn');
    if (button) button.focus();
  }
}

// Close all dropdowns except the one specified
function closeOtherDropdowns(currentDropdown) {
  document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
    if (dropdown !== currentDropdown && dropdown.classList.contains('active')) {
      toggleDropdown(dropdown, false);
    }
  });
}

// Handle click outside dropdown
function handleClickOutside(event) {
  if (!event.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
      toggleDropdown(dropdown, false);
    });
  }
}

// Initialize dropdowns
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('.nav-dropdown > .nav-dropbtn');
    const dropdownContent = dropdown.querySelector('.nav-dropdown-content');
    
    // Set initial ARIA attributes
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    dropdownContent.setAttribute('role', 'menu');
    
    // Toggle dropdown on button click
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('active');
      closeOtherDropdowns(dropdown);
      toggleDropdown(dropdown, !isOpen);
    });
    
    // Handle keyboard navigation
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        closeOtherDropdowns(dropdown);
        toggleDropdown(dropdown, true);
      } else if (e.key === 'Escape' && dropdown.classList.contains('active')) {
        e.preventDefault();
        toggleDropdown(dropdown, false);
      }
    });
    
    // Handle keyboard navigation in dropdown menu
    const menuItems = dropdownContent.querySelectorAll('a');
    const firstItem = menuItems[0];
    const lastItem = menuItems[menuItems.length - 1];
    
    menuItems.forEach((item, index) => {
      item.setAttribute('role', 'menuitem');
      item.setAttribute('tabindex', '-1');
      
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          toggleDropdown(dropdown, false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextItem = menuItems[index + 1] || firstItem;
          nextItem.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevItem = menuItems[index - 1] || lastItem;
          prevItem.focus();
        } else if (e.key === 'Tab' && !e.shiftKey && index === menuItems.length - 1) {
          // Close dropdown when tabbing out of last item
          e.preventDefault();
          toggleDropdown(dropdown, false);
        } else if (e.key === 'Tab' && e.shiftKey && index === 0) {
          // Close dropdown when shift+tabbing from first item
          e.preventDefault();
          toggleDropdown(dropdown, false);
        }
      });
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', handleClickOutside);
  
  // Close dropdowns when window loses focus
  window.addEventListener('blur', () => {
    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
      toggleDropdown(dropdown, false);
    });
  });
  
  // Handle window resize for mobile menu
  let resizeTimer;
  window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove('resize-animation-stopper');
    }, 100);
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const mobileMenuBtn = document.createElement('button');
  mobileMenuBtn.className = 'mobile-menu-btn';
  mobileMenuBtn.setAttribute('aria-label', 'Toggle menu');
  mobileMenuBtn.innerHTML = '☰';
  
  const nav = document.querySelector('.main-nav');
  nav.insertBefore(mobileMenuBtn, nav.firstChild);
  
  mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('collapsed');
    mobileMenuBtn.setAttribute('aria-expanded', 
      mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
    mobileMenuBtn.innerHTML = nav.classList.contains('collapsed') ? '☰' : '✕';
  });
  
  // Close menu when clicking on a link on mobile
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && window.innerWidth <= 768) {
      nav.classList.add('collapsed');
      mobileMenuBtn.innerHTML = '☰';
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Show/hide sections
function showSection(section) {
  document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
  const sectionElement = document.getElementById(section + '-section');
  if (sectionElement) {
    sectionElement.style.display = '';
    
    // Close all dropdowns when changing sections
    document.querySelectorAll('.nav-dropdown.active').forEach(dropdown => {
      toggleDropdown(dropdown, false);
    });
    
    // Scroll to top of the section
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// PDF Viewer functionality
function initPdfViewer() {
  const modal = document.getElementById('pdfViewerModal');
  const closeButtons = [
    document.getElementById('closePdfViewer'),
    document.getElementById('closePdfViewerBtn')
  ];
  const downloadBtn = document.getElementById('downloadPdfBtn');
  const pdfViewer = document.getElementById('pdfViewer');
  const pdfTitle = document.getElementById('pdfTitle');
  const pdfError = document.getElementById('pdfViewerError');
  
  let currentPdfUrl = '';
  
  // Function to get the best URL for embedding PDFs from different sources
  function getEmbeddablePdfUrl(url) {
    // Handle Google Drive URLs
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/[\w-]{25,}/);
      if (fileId) {
        return {
          url: `https://drive.google.com/file/d/${fileId[0]}/preview`,
          type: 'iframe'
        };
      }
    }
    
    // Handle direct PDF links
    if (url.toLowerCase().endsWith('.pdf')) {
      // For studyiq.com PDFs, use Google Docs viewer
      if (url.includes('studyiq.com')) {
        return {
          url: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
          type: 'iframe'
        };
      }
      
      // Try direct PDF embedding first with viewer parameters
      return {
        url: url,
        type: 'object',
        params: 'toolbar=0&navpanes=1&scrollbar=1'
      };
    }
    
    // For any other URL, try to use Google Docs viewer as fallback
    return {
      url: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`,
      type: 'iframe'
    };
  }
  
  // Function to create a PDF viewer element based on the URL type
  function createPdfViewerElement(embedInfo) {
    if (embedInfo.type === 'object') {
      // Use <object> tag for direct PDF embedding
      const object = document.createElement('object');
      object.style.width = '100%';
      object.style.height = '100%';
      object.type = 'application/pdf';
      object.data = embedInfo.params ? 
        `${embedInfo.url}${embedInfo.url.includes('?') ? '&' : '?'}${embedInfo.params}` : 
        embedInfo.url;
      return object;
    } else {
      // Use <iframe> for web viewers
      const iframe = document.createElement('iframe');
      iframe.id = 'pdfViewerIframe';
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow', 'fullscreen');
      iframe.src = embedInfo.url;
      return iframe;
    }
  }

  // Function to open PDF in the viewer
  window.openPdfViewer = function(pdfUrl, title = 'Document') {
    currentPdfUrl = pdfUrl;
    pdfTitle.textContent = title;
    
    // Show loading state
    const container = document.querySelector('.pdf-viewer-container');
    const loadingElement = container.querySelector('.pdf-loading');
    const errorElement = container.querySelector('.pdf-error');
    
    // Clear previous content
    container.innerHTML = '';
    container.appendChild(loadingElement);
    container.appendChild(errorElement);
    
    // Show loading state
    pdfError.style.display = 'none';
    modal.classList.add('loading');
    
    // Set up download button
    downloadBtn.href = pdfUrl;
    downloadBtn.download = (title.endsWith('.pdf') ? title : `${title}.pdf`).replace(/[^\w\d.-]/g, '_');
    
    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Get the embeddable URL based on the source
    const embedInfo = getEmbeddablePdfUrl(pdfUrl);
    
    // Create the appropriate viewer element
    const viewerElement = createPdfViewerElement(embedInfo);
    
    // Set up error handling
    let loadTimeout = setTimeout(() => {
      if (viewerElement.contentWindow && viewerElement.contentWindow.length === 0) {
        showPdfError(pdfUrl);
      }
    }, 10000); // 10 second timeout
    
    viewerElement.onload = function() {
      clearTimeout(loadTimeout);
      modal.classList.remove('loading');
    };
    
    viewerElement.onerror = function() {
      clearTimeout(loadTimeout);
      showPdfError(pdfUrl);
    };
    
    // Add the viewer to the container
    container.insertBefore(viewerElement, loadingElement);
    
    // Focus management for accessibility
    setTimeout(() => {
      modal.focus();
    }, 100);
    
    // Helper function to show PDF error
    function showPdfError(url) {
      modal.classList.remove('loading');
      pdfError.style.display = 'block';
      pdfError.innerHTML = `
        <p>Unable to load the PDF viewer. This might be due to server restrictions.</p>
        <div class="pdf-error-actions">
          <a href="${url}" class="btn download-btn" download>
            <span class="btn-icon">⬇️</span> Download PDF
          </a>
          <a href="${url}" class="btn" target="_blank" style="margin-left: 10px; background: #4f46e5; color: white;">
            <span class="btn-icon">↗️</span> Open in New Tab
          </a>
        </div>
      `;
    }
  };
  
  // Close modal function
  function closePdfViewer() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    pdfViewer.src = '';
  }
  
  // Close modal when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePdfViewer();
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closePdfViewer();
    }
  });
  
  // Add click handlers for close buttons
  closeButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', closePdfViewer);
    }
  });
}

// Function to enhance PDF links with view and download buttons
function enhancePdfLinks() {
  // Find all elements with class 'download-btn' that link to PDFs
  document.querySelectorAll('a[href$=".pdf"]').forEach(link => {
    // Skip if already enhanced
    if (link.closest('.pdf-buttons')) return;
    
    const pdfUrl = link.getAttribute('href');
    const pdfName = pdfUrl.split('/').pop().replace(/\.pdf$/i, '');
    const parent = link.parentElement;
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'pdf-buttons';
    
    // Create view button
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn view-pdf-btn';
    viewBtn.innerHTML = '<span class="btn-icon">👁️</span> View';
    viewBtn.onclick = (e) => {
      e.preventDefault();
      window.openPdfViewer(pdfUrl, pdfName);
    };
    
    // Create download button
    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'btn download-pdf-btn';
    downloadBtn.href = pdfUrl;
    downloadBtn.download = pdfUrl.split('/').pop();
    downloadBtn.innerHTML = '<span class="btn-icon">⬇️</span> Download';
    
    // Add buttons to container
    buttonsContainer.appendChild(viewBtn);
    buttonsContainer.appendChild(downloadBtn);
    
    // Replace original link with buttons
    parent.appendChild(buttonsContainer);
    
    // Remove the original download link if it's the only content
    if (parent.childNodes.length === 1 && parent.textContent.trim() === link.textContent.trim()) {
      parent.removeChild(link);
    } else {
      link.style.display = 'none'; // Hide the original link
    }
  });
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();
  initMobileMenu();
  initPdfViewer();
  enhancePdfLinks();
  
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
