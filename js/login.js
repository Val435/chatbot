import { API, USE_MOCK, requestJSON } from './common.js';

const userEl = document.getElementById('username');
const passEl = document.getElementById('password');
const btn    = document.getElementById('loginBtn');
const errEl  = document.getElementById('loginError');
const loading= document.getElementById('loginLoading');

function setLoading(v){
  if(v){ btn.disabled = true; loading.classList.remove('d-none'); }
  else { btn.disabled = false; loading.classList.add('d-none'); }
}

async function doLogin(){
  const username = (userEl.value || '').trim();
  const password = (passEl.value || '').trim();
  errEl.classList.add('d-none'); errEl.textContent = '';

  if(!username || !password){
    errEl.textContent = 'Completa usuario y contraseña.';
    errEl.classList.remove('d-none');
    return;
  }

  try{
    setLoading(true);
    const res = await requestJSON(API.login, 'POST', { username, password });
    setLoading(false);

    if(res?.status === 'ok'){
      // Redirigir al admin pagina principal 
      window.location.href = './trainer.html';
    }else{
      errEl.textContent = res?.message || 'Credenciales inválidas';
      errEl.classList.remove('d-none');
    }
  }catch(e){
    setLoading(false);
    errEl.textContent = 'Error de red. Intenta de nuevo.';
    errEl.classList.remove('d-none');
  }
}

btn.addEventListener('click', doLogin);
passEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
userEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
