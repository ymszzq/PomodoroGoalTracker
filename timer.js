// the pomodoro timer functions..
var Pcounter = 0;
var Bcounter = 0;
var pomodoroes = 1;
var end = document.getElementById("end_session");
var timer = document.getElementById("timer");
var pomo_timer = document.getElementById("pomo_timer");
var pomo = document.getElementById("pomo");
var pomo_box = document.getElementById("pomo_box");
var data_num = 0;
var data_user = '';
var data_name = '';
var data_pomo = 0;
var data_break = 0;
var interval = '';
var eventId = '';

function beginTimer(pomo_len, break_len, name, user, id){
  var pomoDuration = pomo_len*60;
  var breakDuration = break_len*60;
  data_name = name;
  data_pomo = pomo_len;
  data_break = break_len;
  data_user = user;
  eventId = id;
  interval = setInterval(timeIt, 1000);
  function timeIt(){
  if(pomodoroes < 21){
    if(Pcounter < pomoDuration){
      Pcounter++;
      pomo.innerHTML = "<b>TURN </b>#" + pomodoroes + "<br /><br />" +tim(pomoDuration - Pcounter);
    } else if(pomoDuration == Pcounter && !Bcounter){
      pomodoroes++;
      Bcounter = 1;
      var img = '<img id="img"src="pomo_img.png" width="32px">';
      appendHtml(pomo_box, img);
      // play timer sound
      document.getElementById('timer-bling').play();
    } else {
      Bcounter++;
      pomo.innerHTML = "<b>BREAK</b>" + "<br /><br />" +tim(breakDuration - Bcounter);
       if(Bcounter == breakDuration){
         Bcounter = 0;
         Pcounter = 0;
         // play timer sound
         document.getElementById('timer-bling').play();
       }
    }
  } else {
      endSession();
   }
  }
}

function endSession(){
  clearInterval(interval);
  pomodoroes = 1;
  data_num = pomo_box.children.length;
  var data_user_encoded = encode(data_user);
  var timeStamp = new Date().toString().slice(0, -15);
  console.log(timeStamp);
  // send data to firebase
  // senData(data_num, data_name);
  upLoad();
  updateComplete(eventId, data_num);
  function upLoad(){
    var reF = data_user_encoded + '/' + data_name;
    var goalRef = database.ref(reF);
    var total = '';
    goalRef.once("value", gotData, errData);
    function gotData(snap){
      if(snap.val() !== null){
         total = snap.val().total;
      }
    }
    function errData(err){
      console.log(err);
    }
    total += data_num;
    total = Number(total);
    goalRef.child(timeStamp).set(data_num);
    goalRef.child("total").set(total);
    window.location.reload();
  }

  timer.style.display = 'block';
  pomo_timer.style.display = 'none';
  pomo_box.innerHTML = "";
  listUpcomingEvents();
}

function updateComplete(eventId, data_num){
  var newD = data_num + " X " + data_pomo + " minutes.";
  var event = gapi.client.calendar.events.get({
    "calendarId":'primary',
    "eventId": eventId,
  });
  event.colorId = "10";
  event.description = newD;
console.log(event);
console.log(eventId);
console.log(data_num);
  var request = gapi.client.calendar.events.patch({
    'calendarId': 'primary',
    'eventId': eventId,
    'resource': event
  });
  request.execute(function(done){
    console.log(done);
  });
}

function appendHtml(el, str) {
  var div = document.createElement('div');
  div.innerHTML = str;
  while (div.children.length > 0) {
    el.appendChild(div.children[0]);
  }
}

function tim(y) {
m = Math.floor(y / 60);
s = y % 60;
return duo(m) + ":" + duo(s);
}
