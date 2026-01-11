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
