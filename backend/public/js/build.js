// public/js/build.js
import { fetchProductsByConfig } from './components.js';

document.addEventListener('DOMContentLoaded', () => {
  const configSelect = document.getElementById('configSelect');
  const saveStatus   = document.getElementById('saveStatus');
  const saveBtn      = document.getElementById('saveBtn');
  const overlay      = document.getElementById('quickAddOverlay');
  const categories   = Array.from(document.querySelectorAll('.part-category'));

  if (!configSelect || !saveStatus || !saveBtn || !overlay) {
    console.error('✋ Не все элементы найдены в DOM');
    return;
  }

  let currentConfigId = null;
  const selectedParts = {};

  function getBuildTitle(specs) {
    return [
      specs.manufacturer,
      specs.series,
      specs.model,
      specs.metadata?.name
    ].filter(Boolean).join(' ') || specs.id;
  }
  function getBuildImage(specs) {
    return specs.images?.[0]||'/img/placeholder.png';
  }
  function getBuyLink(specs) {
    const asin = specs.general_product_information?.amazon_sku;
    return asin ? `https://www.amazon.com/dp/${asin}` : null;
  }
  function getStoreIcon(specs) {
    return specs.general_product_information?.amazon_sku
      ? '<img src="/img/placeholder.png" class="store-icon" alt="Amazon"/>'
      : '';
  }

  function renderPart(cat, prod) {
    selectedParts[cat]=prod;
    const container = document.querySelector(`.part-category[data-cat="${cat}"]`);
    container.querySelectorAll('.selected-part').forEach(el=>el.remove());
    const btn = container.querySelector('.add-btn');
    btn.textContent = 'Swap Part';

    const {specs,prices} = prod;
    const div = document.createElement('div');
    div.className = 'selected-part';
    div.innerHTML = `
      <img src="${getBuildImage(specs)}" class="sp-thumb"
           onerror="this.src='/img/placeholder.png'" />
      <div class="sp-info">
        <div class="sp-title">${getBuildTitle(specs)}</div>
        <div class="sp-price"> 'N/A' ₴ ${getStoreIcon(specs)}</div>
      </div>
      <div class="sp-actions">
        ${getBuyLink(specs)?`<a href="${getBuyLink(specs)}" target="_blank" class="sp-buy">Buy</a>`:''}
        <button class="sp-remove">&times;</button>
      </div>
    `;
    container.append(div);
  }

  // загрузка списка
  async function loadConfigList(){
    const token = localStorage.getItem('token');
    const res = await fetch('/api/configs',{
      headers:{'Authorization':'Bearer '+token}
    });
    const cfgs = await res.json();
    configSelect.innerHTML = `<option value="">– New build –</option>`
      + cfgs.map(c=>`<option value="${c._id}" ${c._id===currentConfigId?'selected':''}>${c.name}</option>`).join('');
  }

  // загрузка по id
  async function fetchConfigAndFill(id){
    const token = localStorage.getItem('token');
    const r = await fetch(`/api/configs/${id}`,{
      headers:{'Authorization':'Bearer '+token}
    });
    if(!r.ok){ alert('Не вдалось завантажити'); return; }
    const {components} = await r.json();
    // очистка UI и data
    categories.forEach(c=>{
      delete selectedParts[c.dataset.cat];
      c.querySelectorAll('.selected-part').forEach(el=>el.remove());
      c.querySelector('.add-btn').textContent = `+ Add ${c.querySelector('h3').textContent}`;
    });
    // загрузка каждого
    for(const id of components){
      const p = await (await fetch(`/api/components/${id}`,{
        headers:{'Authorization':'Bearer '+localStorage.getItem('token')}
      })).json();
      window.dispatchEvent(new CustomEvent('add-component',{
        detail:{category:p.category,product:p}
      }));
    }
  }

  let saveTimer;
  function scheduleSave(){
    saveStatus.textContent='Saving…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave,500);
  }
  async function autoSave(){
    const comps = Object.values(selectedParts).map(x=>x.opendb_id);
    const token = localStorage.getItem('token');
    const body = JSON.stringify({
      name: configSelect.selectedOptions[0].text||'Auto Build',
      components:comps
    });
    const url = currentConfigId?`/api/configs/${currentConfigId}`:'/api/configs';
    const method = currentConfigId?'PUT':'POST';
    const res = await fetch(url,{method,headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },body});
    const data=await res.json();
    currentConfigId=data._id;
    saveStatus.textContent='Saved';
    await loadConfigList();
    configSelect.value=currentConfigId;
  }

  // ивенты
  window.addEventListener('add-component',e=>{
    const {category,product}=e.detail;
    renderPart(category,product);
    scheduleSave();
  });
  document.body.addEventListener('click',e=>{
    if(e.target.matches('.sp-remove')){
      const cat = e.target.closest('.part-category').dataset.cat;
      delete selectedParts[cat];
      e.target.closest('.selected-part').remove();
      document.querySelector(`.part-category[data-cat="${cat}"] .add-btn`)
        .textContent = `+ Add ${document.querySelector(`.part-category[data-cat="${cat}"] h3`).textContent}`;
      scheduleSave();
    }
  });

  configSelect.addEventListener('change',async ()=>{
    const id = configSelect.value;
    currentConfigId = id||null;
    if(id){
      saveBtn.textContent='Update Build';
      await fetchConfigAndFill(id);
      saveStatus.textContent='Saved';
    } else {
      saveBtn.textContent='Save Build';
      saveStatus.textContent='Unsaved';
      // полная очистка
      categories.forEach(c=>{
        delete selectedParts[c.dataset.cat];
        c.querySelectorAll('.selected-part').forEach(el=>el.remove());
        c.querySelector('.add-btn').textContent = `+ Add ${c.querySelector('h3').textContent}`;
      });
    }
  });

  saveBtn.addEventListener('click',async ()=>{
    // локальная кнопка теперь ведёт как одноразовый Save
    const comps = Object.values(selectedParts).map(x=>x.opendb_id);
    if(!comps.length){ return alert('Додайте компоненти'); }
    const name = prompt('Назва збірки',configSelect.selectedOptions[0].text||'My Build');
    if(!name) return;
    const token=localStorage.getItem('token');
    const res = await fetch('/api/configs',{method:'POST',headers:{
      'Content-Type':'application/json',
      'Authorization':'Bearer '+token
    },body:JSON.stringify({name,components:comps})});
    if(res.ok){
      alert('Збережено');
      location.href='/saved.html';
    } else {
      const err=await res.json(); alert(err.message||'Error');
    }
  });

  // initial
  if(!localStorage.getItem('token')){
    location.href='/login.html';
    return;
  }
  const urlP = new URLSearchParams(window.location.search);
  if(urlP.get('config')){
    saveBtn.textContent='Update Build';
    fetchConfigAndFill(urlP.get('config'));
  }
  loadConfigList();
});
