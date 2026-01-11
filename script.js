document.addEventListener("DOMContentLoaded",()=>{

  const tabs = document.querySelectorAll(".sup-tab");
  const cards = document.querySelectorAll(".support-card");

  tabs.forEach(tab=>{
    tab.addEventListener("click",()=>{

      tabs.forEach(t=>t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.dataset.filter;

      cards.forEach(card=>{
        if(filter === "all" || card.classList.contains(filter)){
          card.style.display = "block";
        }else{
          card.style.display = "none";
        }
      });

    });
  });

});
document.addEventListener("DOMContentLoaded",()=>{

  const openSupporters = document.querySelector('.nav-dropdown > .nav-link');
  const section = document.getElementById('supportersSection');

  if(openSupporters && section){
    openSupporters.addEventListener('click',e=>{
      e.preventDefault();
      section.scrollIntoView({behavior:"smooth"});
    });
  }

  const selectors = document.querySelectorAll('.selector-card');
  const boxes = document.querySelectorAll('.content-box');

  selectors.forEach(sel=>{
    sel.addEventListener('click',()=>{
      selectors.forEach(s=>s.classList.remove('active'));
      boxes.forEach(b=>b.classList.remove('active'));

      sel.classList.add('active');
      document.getElementById(sel.dataset.target).classList.add('active');
    });
  });

});
document.querySelectorAll('.support-card').forEach(card=>{

  card.addEventListener('mousemove',e=>{
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -(y - centerY) / 15;
    const rotateY = (x - centerX) / 15;

    card.style.transform =
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;

    card.style.setProperty('--x',`${x}px`);
    card.style.setProperty('--y',`${y}px`);
  });

  card.addEventListener('mouseleave',()=>{
    card.style.transform =
      'rotateX(0deg) rotateY(0deg) translateY(0)';
  });

});
