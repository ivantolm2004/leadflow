const leads=[
 {name:'Анна Петрова',request:'Настройка CRM',source:'Сайт',status:'new',label:'Новая',time:'10:42'},
 {name:'Илья Морозов',request:'Интеграция Telegram',source:'Реклама',status:'work',label:'В работе',time:'10:18'},
 {name:'Олег Смирнов',request:'Автоматизация отчётов',source:'Рекомендация',status:'done',label:'Закрыта',time:'09:51'},
 {name:'Мария Волкова',request:'Бот для поддержки',source:'Сайт',status:'new',label:'Новая',time:'09:24'}
];
const tbody=document.querySelector('#leadsTable');
const initials=name=>name.split(' ').map(word=>word[0]).join('');
function render(filter='all'){
 tbody.innerHTML=leads.filter(lead=>filter==='all'||lead.status===filter).map(lead=>`<tr><td><div class="person"><span class="avatar">${initials(lead.name)}</span><b>${lead.name}</b></div></td><td>${lead.request}</td><td>${lead.source}</td><td><span class="status ${lead.status}">${lead.label}</span></td><td>Сегодня, ${lead.time}</td></tr>`).join('');
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('.filters .active').classList.remove('active');button.classList.add('active');render(button.dataset.filter)}));
document.querySelector('#demoButton').addEventListener('click',()=>{
 leads.unshift({name:'Елена Соколова',request:'AI-помощник',source:'Сайт',status:'new',label:'Новая',time:new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})});
 document.querySelector('#totalCount').textContent=Number(document.querySelector('#totalCount').textContent)+1;
 document.querySelector('#newCount').textContent=Number(document.querySelector('#newCount').textContent)+1;
 render(document.querySelector('.filters .active').dataset.filter);
 const toast=document.querySelector('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200);
 document.querySelector('#dashboard').scrollIntoView();
});
render();
