document.getElementById('contact-us-form').addEventListener('submit', function(event){
  event.preventDefault()

  var name_el = document.getElementById('contact-us-name');
  var email_el = document.getElementById('contact-us-email');
  var subject_el = document.getElementById('contact-us-subject');
  var message_el = document.getElementById('contact-us-message');

  // We perform this check in case some browser does not support
  // the "required" attribute we put in the HTML form
  var required_fields = [name_el, email_el, subject_el, message_el];
  var is_form_ready = true;
  required_fields.forEach((field) => {
    if (field.value === '') is_form_ready = false;
  });

  if (is_form_ready) {
    console.log(name_el.value);
    console.log(email_el.value);
    console.log(subject_el.value);
    console.log(message_el.value);

    axios.post('https://luis-bitcraft-api.localtunnel.me/send', {
        name: name_el.value,
        email: email_el.value,
        subject: subject_el.value,
        message: message_el.value
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
});