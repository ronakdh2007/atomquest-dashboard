import { supabase } from './supabase.js'

    window.login = async function() {
      let email = document.getElementById('emailInput').value.trim()
      let errorMsg = document.getElementById('errorMsg')

      if (!email) {
        errorMsg.innerText = 'Please enter your email.'
        errorMsg.classList.remove('hidden')
        return
      }

      // Look up user in database by email
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        errorMsg.innerText = 'Email not found. Please check and try again.'
        errorMsg.classList.remove('hidden')
        return
      }

      // Save user to localStorage so other pages know who is logged in
      localStorage.setItem('currentUser', JSON.stringify(data))

      // Redirect based on role
      if (data.role === 'employee') window.location.href = 'employee.html'
      if (data.role === 'manager')  window.location.href = 'manager.html'
      if (data.role === 'admin')    window.location.href = 'admin.html'
    }