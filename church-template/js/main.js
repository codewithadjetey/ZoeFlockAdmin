// Sidebar Toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden');
  }
}

// Sidebar Dropdown Toggle
function toggleSidebarDropdown(dropdownId) {
  console.log('Toggling dropdown:', dropdownId);
  const dropdown = document.getElementById(dropdownId + '-dropdown');
  const arrow = document.getElementById(dropdownId + '-arrow');
  
  console.log('Dropdown element:', dropdown);
  console.log('Arrow element:', arrow);
  
  if (dropdown) {
    const isHidden = dropdown.classList.contains('hidden');
    console.log('Is hidden:', isHidden);
    
    if (isHidden) {
      dropdown.classList.remove('hidden');
      if (arrow) {
        arrow.style.transform = 'rotate(180deg)';
      }
    } else {
      dropdown.classList.add('hidden');
      if (arrow) {
        arrow.style.transform = 'rotate(0deg)';
      }
    }
  }
}

// View Toggle for Members Page
function toggleView(viewType) {
  const gridView = document.getElementById('grid-view');
  const listView = document.getElementById('list-view');
  const gridBtn = document.getElementById('grid-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  
  if (viewType === 'grid') {
    gridView.classList.remove('hidden');
    listView.classList.add('hidden');
    gridBtn.classList.add('bg-blue-600', 'text-white');
    gridBtn.classList.remove('text-gray-600');
    listBtn.classList.remove('bg-blue-600', 'text-white');
    listBtn.classList.add('text-gray-600');
  } else {
    listView.classList.remove('hidden');
    gridView.classList.add('hidden');
    listBtn.classList.add('bg-blue-600', 'text-white');
    listBtn.classList.remove('text-gray-600');
    gridBtn.classList.remove('bg-blue-600', 'text-white');
    gridBtn.classList.add('text-gray-600');
  }
}

// Dropdown Toggle
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId + '-dropdown');
  const allDropdowns = document.querySelectorAll('[id$="-dropdown"]');
  
  // Close all other dropdowns
  allDropdowns.forEach(dd => {
    if (dd.id !== dropdownId + '-dropdown') {
      dd.classList.add('hidden');
    }
  });
  
  // Toggle the clicked dropdown
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  const dropdowns = document.querySelectorAll('[id$="-dropdown"]');
  const notificationBtn = event.target.closest('[onclick*="notifications"]');
  const profileBtn = event.target.closest('[onclick*="profile"]');
  
  if (!notificationBtn && !profileBtn) {
    dropdowns.forEach(dropdown => {
      dropdown.classList.add('hidden');
    });
  }
});

// Logout Function
function logout() {
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('userRole');
  window.location.href = 'index.html';
}

// Auth Check on Dashboard Load
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('dashboard.html')) {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      window.location.href = 'index.html';
    }
  }
  
  // Initialize Attendance Chart
  const ctx = document.getElementById('attendanceChart');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
        datasets: [{
          label: 'Sunday Service',
          data: [120, 135, 142, 138, 156, 148, 162, 175],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Wednesday Bible Study',
          data: [45, 52, 48, 55, 58, 62, 65, 68],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            }
          }
        }
      }
    });
  }
});

// Calendar functionality for events.html
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Sample events data
const eventsData = {
  '2024-04-07': { title: 'Sunday Service', type: 'service', color: 'blue' },
  '2024-04-18': { title: 'Youth Fellowship', type: 'special', color: 'yellow' },
  '2024-04-28': { title: 'Community Outreach', type: 'outreach', color: 'green' },
  '2024-05-05': { title: 'Sunday Service', type: 'service', color: 'blue' },
  '2024-05-12': { title: 'Sunday Service', type: 'service', color: 'blue' },
  '2024-05-19': { title: 'Sunday Service', type: 'service', color: 'blue' },
  '2024-05-26': { title: 'Sunday Service', type: 'service', color: 'blue' },
  '2024-05-15': { title: 'Bible Study', type: 'meeting', color: 'purple' },
  '2024-05-22': { title: 'Bible Study', type: 'meeting', color: 'purple' },
  '2024-05-29': { title: 'Bible Study', type: 'meeting', color: 'purple' }
};

function initializeCalendar() {
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('events.html')) {
    initializeCalendar();
  }
});

function renderCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const calendarTitle = document.getElementById('calendar-title');
  
  if (!calendarGrid || !calendarTitle) return;
  
  // Update title
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  
  // Clear grid
  calendarGrid.innerHTML = '';
  
  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  // Generate calendar days
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    // Check if it's today
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isCurrentMonth = date.getMonth() === currentMonth;
    
    if (isToday) {
      dayElement.classList.add('calendar-today');
    }
    
    if (!isCurrentMonth) {
      dayElement.classList.add('text-gray-400');
    }
    
    dayElement.textContent = date.getDate();
    
    // Add event indicator
    const dateString = date.toISOString().split('T')[0];
    if (eventsData[dateString]) {
      const eventDot = document.createElement('span');
      eventDot.className = 'calendar-event-dot';
      dayElement.appendChild(eventDot);
    }
    
    // Add click handler
    dayElement.addEventListener('click', () => {
      selectDate(date);
    });
    
    calendarGrid.appendChild(dayElement);
  }
}

function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

function today() {
  currentDate = new Date();
  currentMonth = currentDate.getMonth();
  currentYear = currentDate.getFullYear();
  renderCalendar();
}

function selectDate(date) {
  const dateString = date.toISOString().split('T')[0];
  const event = eventsData[dateString];
  
  if (event) {
    // Show event details modal
    alert(`Event: ${event.title}\nType: ${event.type}\nDate: ${date.toLocaleDateString()}`);
  } else {
    // Show create event modal
    openModal('create-event-modal');
  }
}
