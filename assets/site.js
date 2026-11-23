/* Shared case navigation and a keyboard / touch accessible screenshot viewer. */
(() => {
  const root = document.body;
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    const toc = document.createElement('details');
    toc.className = 'toc-mobile';
    toc.innerHTML = '<summary>案例目录与项目导航</summary><nav aria-label="手机案例目录">' + sidebar.innerHTML + '<a href="index.html#work">返回全部作品</a></nav>';
    document.querySelector('.top').after(toc);
    toc.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { toc.open = false; }));
  }
  const pager = document.createElement('nav');
  pager.className = 'case-pager'; pager.setAttribute('aria-label', '切换项目');
  [['ra-studio.html','RA Studio'],['sellerlab.html','Seller Lab'],['membership-ai.html','Membership AI']].forEach(([url,name]) => {
    const a=document.createElement('a');a.href=url;a.textContent=name;
    if(location.pathname.endsWith(url)) a.setAttribute('aria-current','page');
    pager.append(a);
  });
  document.querySelector('main')?.append(pager);
  const shots = [...document.querySelectorAll('[data-gallery]')];
  if(shots.length){
    const dialog=document.createElement('dialog'); dialog.className='lightbox'; dialog.setAttribute('aria-label','项目截图查看器');
    dialog.innerHTML='<div class="lightbox-head"><span class="lightbox-count"></span><div class="lightbox-tools"><button type="button" data-act="zoom">原图尺寸</button><a target="_blank" rel="noopener" data-original>新窗口查看</a><button type="button" data-act="close" aria-label="关闭截图">关闭</button></div></div><div class="lightbox-view"><img alt=""></div><div class="lightbox-caption"><button type="button" data-act="prev" aria-label="上一张截图">上一张</button><p></p><button type="button" data-act="next" aria-label="下一张截图">下一张</button></div>';
    root.append(dialog);
    let index=0, opener=null, startX=null, previousOverflow='';
    const view=dialog.querySelector('.lightbox-view'), img=view.querySelector('img');
    function show(i){
      index=(i+shots.length)%shots.length;
      const source=shots[index].querySelector('img'); img.src=source.src;img.alt=source.alt;
      dialog.querySelector('[data-original]').href=source.src;
      dialog.querySelector('.lightbox-count').textContent=`${index+1} / ${shots.length} · ${source.alt}`;
      dialog.querySelector('.lightbox-caption p').textContent=shots[index].closest('figure').querySelector('figcaption p')?.textContent||source.alt;
      view.classList.remove('is-zoomed');dialog.querySelector('[data-act="zoom"]').textContent='原图尺寸';view.scrollTo(0,0);
    }
    function close(){dialog.close();}
    shots.forEach((shot,i)=>shot.addEventListener('click',()=>{opener=shot;show(i);previousOverflow=root.style.overflow;root.style.overflow='hidden';dialog.showModal();dialog.querySelector('[data-act="close"]').focus();}));
    dialog.addEventListener('close',()=>{root.style.overflow=previousOverflow;opener?.focus();});
    dialog.querySelector('[data-act="close"]').addEventListener('click',close);
    dialog.querySelector('[data-act="prev"]').addEventListener('click',()=>show(index-1));
    dialog.querySelector('[data-act="next"]').addEventListener('click',()=>show(index+1));
    dialog.querySelector('[data-act="zoom"]').addEventListener('click',e=>{const zoom=view.classList.toggle('is-zoomed');e.currentTarget.textContent=zoom?'适应屏幕':'原图尺寸';});
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&!view.classList.contains('is-zoomed')){e.preventDefault();show(index+1);}if(e.key==='ArrowLeft'&&!view.classList.contains('is-zoomed')){e.preventDefault();show(index-1);}});
    view.addEventListener('touchstart',e=>{if(!view.classList.contains('is-zoomed'))startX=e.changedTouches[0].clientX;},{passive:true});
    view.addEventListener('touchend',e=>{if(startX===null)return;const delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>65)show(index+(delta<0?1:-1));startX=null;},{passive:true});
  }
  document.querySelectorAll('[data-diagnosis]').forEach(button=>button.addEventListener('click',()=>{
    document.querySelectorAll('[data-diagnosis]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));
    const panel=document.querySelector('#diagnosis-panel');panel.querySelector('h3').textContent=button.dataset.title;panel.querySelector('p').textContent=button.dataset.description;
  }));
})();
