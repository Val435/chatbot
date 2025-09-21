import { API, USE_MOCK, requestJSON, notify } from './common.js';

const userEl = document.getElementById('username');
const passEl = document.getElementById('password');
const btn    = document.getElementById('loginBtn');
const errEl  = document.getElementById('loginError');
const loading= document.getElementById('loginLoading');

function setLoading(v){
  if(v){ 
    btn.disabled = true; 
    loading.classList.remove('d-none'); 
  } else { 
    btn.disabled = false; 
    loading.classList.add('d-none'); 
  }
}

async function doLogin(){
  const username = (userEl.value || '').trim();
  const password = (passEl.value || '').trim();
  errEl.classList.add('d-none'); 
  errEl.textContent = '';

  if(!username || !password){
    const errorMsg = 'Completa usuario y contraseña.';
    errEl.textContent = errorMsg;
    errEl.classList.remove('d-none');
    notify(errorMsg, 'err');
    return;
  }

  try{
    setLoading(true);
    const res = await requestJSON(API.login, 'POST', { username, password });
    setLoading(false);

    if(res?.status === 'ok'){
      // Guardar información del usuario en sessionStorage/localStorage si deseas
      sessionStorage.setItem('user', JSON.stringify(res.user));
      notify('¡Inicio de sesión exitoso! Redirigiendo...', 'ok');
      // Redirigir al admin después de un breve delay para mostrar la notificación
      setTimeout(() => {
        window.location.href = './trainer.html';
      }, 1000);
    }else{
      const errorMsg = res?.message || 'Credenciales inválidas';
      errEl.textContent = errorMsg;
      errEl.classList.remove('d-none');
      notify(errorMsg, 'err');
    }
  }catch(e){
    setLoading(false);
    const errorMsg = 'Error de red. Intenta de nuevo.';
    errEl.textContent = errorMsg;
    errEl.classList.remove('d-none');
    notify(errorMsg, 'err');
  }
}

// Hacer login con clic o presionando Enter
btn.addEventListener('click', doLogin);
passEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
userEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
