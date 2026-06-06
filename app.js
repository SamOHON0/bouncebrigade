// Bounce Brigade - shared interactions (TEST FIXTURE)
function toggleMenu(btn){
  document.querySelector('.nav-links').classList.toggle('open');
  btn.classList.toggle('open');
}
function toggleFaq(btn){
  btn.parentElement.classList.toggle('open');
}
function handleEnquiry(e){
  e.preventDefault();
  var f=e.target;
  var msg=document.getElementById('formMsg');
  var data={
    name:f.name.value, email:f.email.value, phone:f.phone.value,
    date:f.date.value, castle:f.castle.value, area:f.area.value, notes:f.notes.value
  };
  // TEST FIXTURE: no backend. Echo the captured enquiry to the page + console.
  console.log('[Bounce Brigade test enquiry]', data);
  msg.style.display='block';
  msg.textContent='Thanks '+(data.name||'')+'! This is a test site, so nothing was actually sent. Captured: '
    +data.castle+' for '+(data.date||'(no date)')+' in '+(data.area||'(no area)')+'.';
  f.reset();
  return false;
}
