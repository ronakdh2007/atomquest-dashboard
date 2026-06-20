import { supabase } from './supabase.js'

  let currentUser = null

  async function init() {
    let stored = localStorage.getItem('currentUser')

    if (!stored) {
      window.location.href = 'index.html'
      return
    }

    currentUser = JSON.parse(stored)
    document.getElementById('adminName').innerText = currentUser.name

    if (currentUser.role !== 'admin') {
      window.location.href = 'index.html'
      return
    }

    loadOverview()
  }

  async function loadOverview() {
    // Get counts for summary cards
    let { data: users }   = await supabase.from('users').select('*').eq('role', 'employee')
    let { data: submitted } = await supabase.from('goals').select('*').eq('status', 'submitted')
    let { data: approved }  = await supabase.from('goals').select('*').eq('status', 'approved')

    document.getElementById('totalEmployees').innerText = users ? users.length : 0
    document.getElementById('goalsSubmitted').innerText = submitted ? submitted.length : 0
    document.getElementById('pendingApproval').innerText = submitted ? submitted.length : 0

    // Load completion status table
    let { data: allUsers } = await supabase.from('users').select('*').eq('role', 'employee')
    let { data: managers } = await supabase.from('users').select('*').eq('role', 'manager')
    let { data: checkins } = await supabase.from('checkins').select('*')

    let tbody = document.getElementById('completionTableBody')
    tbody.innerHTML = ''

    if (!allUsers || allUsers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="border p-2 text-gray-400">No employees found.</td></tr>'
      return
    }

    allUsers.forEach(employee => {
      let manager = managers ? managers.find(m => m.id === employee.manager_id) : null

      // Check which quarters have checkins for this employee
      let quarters = ['Q1', 'Q2', 'Q3', 'Q4']
      let quarterCells = quarters.map(q => {
        let hasCheckin = checkins && checkins.some(c => {
          return c.quarter === q
        })
        if (q === 'Q1' && hasCheckin) {
          return `<td class="border p-2"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">Done</span></td>`
        } else if (q === 'Q1') {
          return `<td class="border p-2"><span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-sm">Pending</span></td>`
        } else {
          return `<td class="border p-2"><span class="bg-gray-100 text-gray-500 px-2 py-1 rounded text-sm">Not Open</span></td>`
        }
      }).join('')

      tbody.innerHTML += `
        <tr>
          <td class="border p-2">${employee.name}</td>
          <td class="border p-2">${manager ? manager.name : 'N/A'}</td>
          ${quarterCells}
        </tr>
      `
    })
  }

  async function loadUnlockGoals() {
    let { data: goals, error } = await supabase
      .from('goals')
      .select('*, users(name)')
      .eq('status', 'approved')

    let tbody = document.getElementById('unlockTableBody')
    tbody.innerHTML = ''

    if (error || !goals || goals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="border p-2 text-gray-400">No approved goals found.</td></tr>'
      return
    }

    goals.forEach(goal => {
      let lockLabel = goal.is_locked ? 'Locked' : 'Unlocked'
      let lockColor = goal.is_locked 
        ? 'bg-green-100 text-green-700' 
        : 'bg-orange-100 text-orange-700'
      let buttonLabel = goal.is_locked ? 'Unlock' : 'Re-lock'
      let buttonColor = goal.is_locked 
        ? 'bg-orange-500 hover:bg-orange-600' 
        : 'bg-green-500 hover:bg-green-600'

      tbody.innerHTML += `
        <tr id="goalrow_${goal.id}">
          <td class="border p-2">${goal.users ? goal.users.name : 'Unknown'}</td>
          <td class="border p-2">${goal.title}</td>
          <td class="border p-2">${new Date(goal.created_at).toLocaleDateString()}</td>
          <td class="border p-2" id="lockstatus_${goal.id}">
            <span class="px-2 py-1 rounded text-sm ${lockColor}">${lockLabel}</span>
          </td>
          <td class="border p-2">
            <button onclick="toggleLock('${goal.id}', ${goal.is_locked})"
              id="lockbtn_${goal.id}"
              class="${buttonColor} text-white px-3 py-1 rounded text-sm">
              ${buttonLabel}
            </button>
          </td>
        </tr>
      `
    })
  }

  async function loadAuditLog() {
    let { data: logs, error } = await supabase
      .from('audit_log')
      .select('*, users(name)')
      .order('changed_at', { ascending: false })

    let tbody = document.getElementById('auditTableBody')
    tbody.innerHTML = ''

    if (error || !logs || logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="border p-2 text-gray-400">No changes recorded yet.</td></tr>'
      return
    }

    logs.forEach(log => {
      tbody.innerHTML += `
        <tr>
          <td class="border p-2 text-sm">${new Date(new Date(log.changed_at).getTime() + (5.5 * 60 * 60 * 1000)).toLocaleString('en-IN')}</td>
          <td class="border p-2 text-sm">${log.users ? log.users.name : 'Unknown'}</td>
          <td class="border p-2 text-sm">N/A</td>
          <td class="border p-2 text-sm">${log.change_description}</td>
        </tr>
      `
    })
  }

  async function loadCycles() {
    let { data: cycles, error } = await supabase
      .from('cycles')
      .select('*')

    let container = document.getElementById('cyclesList')
    container.innerHTML = ''

    if (error || !cycles) {
      container.innerHTML = '<p class="text-gray-400">Error loading cycles.</p>'
      return
    }

    cycles.forEach(cycle => {
      let isOpen = cycle.is_open
      let statusColor = isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      let statusLabel = isOpen ? 'Open' : 'Closed'
      let buttonLabel = isOpen ? 'Close Window' : 'Open Window'
      let buttonColor = isOpen 
        ? 'bg-red-500 hover:bg-red-600' 
        : 'bg-green-500 hover:bg-green-600'

      container.innerHTML += `
        <div class="flex items-center justify-between border rounded p-4 mb-3">
          <div>
            <p class="font-semibold">${cycle.period.replace('_', ' ').toUpperCase()}</p>
            <span class="px-2 py-1 rounded text-sm ${statusColor}">${statusLabel}</span>
          </div>
          <button onclick="toggleCycle('${cycle.id}', ${cycle.is_open})"
            class="${buttonColor} text-white px-4 py-2 rounded text-sm font-semibold">
            ${buttonLabel}
          </button>
        </div>
      `
    })
  }

  window.toggleLock = async function(goalId, isCurrentlyLocked) {
    let newLockState = !isCurrentlyLocked

    let { error } = await supabase
      .from('goals')
      .update({ is_locked: newLockState })
      .eq('id', goalId)

    if (error) {
      alert('Error updating lock: ' + error.message)
      return
    }

    // Add to audit log
    await supabase.from('audit_log').insert({
      goal_id:            goalId,
      changed_by:         currentUser.id,
      change_description: newLockState ? 'Goal re-locked by admin' : 'Goal unlocked by admin'
    })

    // Reload the table to reflect changes
    loadUnlockGoals()
    loadAuditLog()
  }

  window.toggleCycle = async function(cycleId, isCurrentlyOpen) {
    let { error } = await supabase
      .from('cycles')
      .update({ is_open: !isCurrentlyOpen })
      .eq('id', cycleId)

    if (error) {
      alert('Error updating cycle: ' + error.message)
      return
    }

    loadCycles()
  }

  async function exportCSV() {
    let { data: goals } = await supabase
      .from('goals')
      .select('*, users(name)')

    if (!goals || goals.length === 0) {
      alert('No data to export.')
      return
    }

    let goalIds = goals.map(g => g.id)
    let { data: checkins } = await supabase
      .from('checkins')
      .select('*')
      .in('goal_id', goalIds)

    let csvContent = 'Employee,Goal,UoM,Target,Actual,Status,Score\n'

    goals.forEach(goal => {
      let checkin = checkins ? checkins.find(c => c.goal_id === goal.id) : null
      let actual = checkin ? checkin.actual_achievement || 'N/A' : 'N/A'
      let status = checkin ? checkin.status : 'not_started'
      let score = 'N/A'

      if (checkin && checkin.actual_achievement) {
        let t = parseFloat(goal.target)
        let a = parseFloat(checkin.actual_achievement)
        if (!isNaN(t) && !isNaN(a)) {
          if (goal.uom_type === 'min')  score = Math.round((a / t) * 100) + '%'
          if (goal.uom_type === 'max')  score = Math.round((t / a) * 100) + '%'
          if (goal.uom_type === 'zero') score = a === 0 ? '100%' : '0%'
        }
      }

      csvContent += `${goal.users ? goal.users.name : 'Unknown'},${goal.title},${goal.uom_type},${goal.target},${actual},${status},${score}\n`
    })

    let blob = new Blob([csvContent], { type: 'text/csv' })
    let url  = URL.createObjectURL(blob)
    let a    = document.createElement('a')
    a.href     = url
    a.download = 'achievement_report.csv'
    a.click()
  }

  window.showSection = function(sectionName) {
    document.getElementById('overview').classList.add('hidden')
    document.getElementById('unlockGoals').classList.add('hidden')
    document.getElementById('auditLog').classList.add('hidden')
    document.getElementById('exportReport').classList.add('hidden')
    document.getElementById('cycleManagement').classList.add('hidden')
    document.getElementById('analytics').classList.add('hidden')
    document.getElementById(sectionName).classList.remove('hidden')

    document.querySelectorAll('.section-btn').forEach(btn => {
      btn.className = 'section-btn bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50'
    })
    document.getElementById('btn_' + sectionName).className = 
      'section-btn bg-[#FDBD13] text-black px-4 py-2 rounded-lg text-sm font-semibold'

    if (sectionName === 'overview')         loadOverview()
    if (sectionName === 'unlockGoals')      loadUnlockGoals()
    if (sectionName === 'auditLog')         loadAuditLog()
    if (sectionName === 'cycleManagement')  loadCycles()
    if (sectionName === 'analytics')        loadAnalytics()
  }

  window.exportCSV = exportCSV

  async function loadAnalytics() {
    let { data: goals } = await supabase
      .from('goals')
      .select('*, users(name)')

    let { data: checkins } = await supabase
      .from('checkins')
      .select('*')

    if (!goals || goals.length === 0) return

    // Destroy existing charts if any to prevent duplicates
    ['achievementChart', 'statusChart', 'thrustChart', 'uomChart'].forEach(id => {
      let existing = Chart.getChart(id)
      if (existing) existing.destroy()
    })

    // CHART 1: Achievement Scores per employee
    let employeeScores = {}
    goals.forEach(goal => {
      let name = goal.users ? goal.users.name : 'Unknown'
      let checkin = checkins ? checkins.find(c => c.goal_id === goal.id) : null
      if (!employeeScores[name]) employeeScores[name] = []

      if (checkin && checkin.actual_achievement) {
        let t = parseFloat(goal.target)
        let a = parseFloat(checkin.actual_achievement)
        if (!isNaN(t) && !isNaN(a) && t > 0) {
          let score = goal.uom_type === 'min' ? (a/t)*100 :
                      goal.uom_type === 'max' ? (t/a)*100 :
                      goal.uom_type === 'zero' ? (a === 0 ? 100 : 0) : 0
          employeeScores[name].push(score)
        }
      }
    })

    let empNames = Object.keys(employeeScores)
    let empAvgScores = empNames.map(name => {
      let scores = employeeScores[name]
      return scores.length > 0
        ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length)
        : 0
    })

    new Chart(document.getElementById('achievementChart'), {
      type: 'bar',
      data: {
        labels: empNames,
        datasets: [{
          label: 'Avg Achievement Score (%)',
          data: empAvgScores,
          backgroundColor: '#FDBD13',
          borderRadius: 6
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, max: 100 } },
        plugins: { legend: { display: false } }
      }
    })

    // CHART 2: Goal Status Distribution
    let statusCounts = { draft: 0, submitted: 0, approved: 0, rejected: 0 }
    goals.forEach(g => { if (statusCounts[g.status] !== undefined) statusCounts[g.status]++ })

    new Chart(document.getElementById('statusChart'), {
      type: 'doughnut',
      data: {
        labels: ['Draft', 'Submitted', 'Approved', 'Rejected'],
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#e5e7eb', '#FDBD13', '#22c55e', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    })

    // CHART 3: Goals by Thrust Area
    let thrustCounts = {}
    goals.forEach(g => {
      thrustCounts[g.thrust_area] = (thrustCounts[g.thrust_area] || 0) + 1
    })

    new Chart(document.getElementById('thrustChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(thrustCounts),
        datasets: [{
          label: 'Number of Goals',
          data: Object.values(thrustCounts),
          backgroundColor: '#FDBD13',
          borderRadius: 6
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: false } }
      }
    })

    // CHART 4: Goals by UoM Type
    let uomCounts = { min: 0, max: 0, timeline: 0, zero: 0 }
    goals.forEach(g => { if (uomCounts[g.uom_type] !== undefined) uomCounts[g.uom_type]++ })

    new Chart(document.getElementById('uomChart'), {
      type: 'doughnut',
      data: {
        labels: ['Higher is Better', 'Lower is Better', 'Timeline', 'Zero-based'],
        datasets: [{
          data: Object.values(uomCounts),
          backgroundColor: ['#FDBD13', '#1e293b', '#94a3b8', '#e5e7eb'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    })
  }

  init()