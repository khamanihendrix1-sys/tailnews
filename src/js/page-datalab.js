  (function() {
    // Check if user is authenticated (simulated via sessionStorage)
    function initializeMemberStatus() {
      const isMember = sessionStorage.getItem('md_member_session') === 'true';
      const memberStatus = document.getElementById('md-member-status');
      const accessMode = document.getElementById('md-access-mode');
      const memberOnlyElements = document.querySelectorAll('.md-member-only');
      const memberSections = document.querySelectorAll('.md-member-section');
      
      if (isMember) {
        // Update access mode badge
        if (accessMode) {
          accessMode.textContent = 'Premium Access';
          accessMode.className = 'px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full';
        }
        
        // Update header status to show member
        if (memberStatus) {
          memberStatus.innerHTML = `
            <div class="md-member-badge inline-block px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold">
              <span class="md-member-indicator">Member Access Active</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              Dashboard active | <a href="sign-in.html" class="text-green-300 hover:text-green-200 font-semibold">Manage Profile</a>
            </p>
          `;
        }
        
        // Enable member-only features
        memberOnlyElements.forEach(el => {
          el.style.opacity = '1';
          el.style.pointerEvents = 'auto';
          el.title = '';
        });
        
        // Update member sections
        memberSections.forEach(section => {
          section.style.opacity = '1';
          const header = section.querySelector('[class*="md-member-badge"]');
          if (header) {
            header.textContent = 'Premium Active';
          }
        });
        
        // Update live signal status
        const signalStatus = document.querySelector('[data-md-signal-status]');
        if (signalStatus) {
          signalStatus.textContent = 'Signal Engine: Connected (Live)';
          signalStatus.style.color = '#16a34a';
        }
        
      } else {
        // Disable member-only features
        memberOnlyElements.forEach(el => {
          el.style.opacity = '0.5';
          el.style.cursor = 'not-allowed';
          if (!el.title) {
            el.title = 'Sign in to access member features';
          }
        });
      }
    }
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initializeMemberStatus);
    
    // Update timestamp for last data refresh
    const lastUpdate = document.querySelector('[data-md-last-update]');
    if (lastUpdate) {
      const updateTime = () => {
        const now = new Date();
        const timeAgo = Math.floor((Date.now() - now) / 1000);
        if (timeAgo < 60) {
          lastUpdate.textContent = 'moments ago';
        } else if (timeAgo < 3600) {
          lastUpdate.textContent = Math.floor(timeAgo / 60) + ' min ago';
        } else {
          lastUpdate.textContent = Math.floor(timeAgo / 3600) + ' hr ago';
        }
      };
      updateTime();
      setInterval(updateTime, 30000);
    }
  })();
