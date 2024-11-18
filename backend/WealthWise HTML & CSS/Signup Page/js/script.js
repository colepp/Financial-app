var password = document.getElementById("password")
, compare_password = document.getElementById("confirmed_password");

function validatePassword(){
  if(password.value != compare_password.value) {
      compare_password.setCustomValidity("Passwords Don't Match");
  } else {
      compare_password.setCustomValidity('');
  }
}

password.onchange = validatePassword;
compare_password.onkeyup = validatePassword;

// <!--code for message with requirements for password-->
var myInput = document.getElementById("password");
var letter = document.getElementById("letter");
var capital = document.getElementById("capital");
var number = document.getElementById("number");
var length = document.getElementById("length");

myInput.onfocus = function() {
document.getElementById("message").style.display = "block";
container.style.transition = "height 0.3s"; 
container.style.height = "1070px";
confirm_password.style.transition = "margin-top";
confirm_password.style.marginTop = "-7px";
}

myInput.onblur = function() {
document.getElementById("message").style.display = "none";
container.style.transition = "height 0.3s"; 
container.style.height = "854px"; 
confirm_password.style.transition = "margin-top";
confirm_password.style.marginTop = "4%"; 
}

myInput.onkeyup = function() {
var lowerCaseLetters = /[a-z]/g;
if(myInput.value.match(lowerCaseLetters)) {
  letter.classList.remove("invalid");
  letter.classList.add("valid");
} else {
  letter.classList.remove("valid");
  letter.classList.add("invalid");
}

var upperCaseLetters = /[A-Z]/g;
if(myInput.value.match(upperCaseLetters)) {
  capital.classList.remove("invalid");
  capital.classList.add("valid");
} else {
  capital.classList.remove("valid");
  capital.classList.add("invalid");
}

var numbers = /[0-9]/g;
if(myInput.value.match(numbers)) {
  number.classList.remove("invalid");
  number.classList.add("valid");
} else {
  number.classList.remove("valid");
  number.classList.add("invalid");
}

if(myInput.value.length >= 8) {
  length.classList.remove("invalid");
  length.classList.add("valid");
} else {
  length.classList.remove("valid");
  length.classList.add("invalid");
}
}