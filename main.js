// CONSTANTS

const API_URL = 'https://api.bitcraft.io'

// GOOGLE ANALYTICS

function handleOutboundLinkClicks(event) {
  ga('send', 'event', {
    eventCategory: 'Outbound Link',
    eventAction: 'click',
    eventLabel: event.target.closest('a').href,
    // After the click is sent to Analytics, resume normal behavior
    hitCallback: function() {
      $(event.target).trigger(event.type);
    }
  });
}

function handleFormSubmission(name) {
  ga('send', 'event', {
    eventCategory: 'Form',
    eventAction: 'submit',
    eventLabel: name
  });
}

// POLYFILLS

Date.prototype.nextDayOfWeek = function(desired_day_of_week) {
  var nextDay = new Date();
  nextDay.setDate(this.getDate() + (desired_day_of_week + (7 - this.getDay())) % 7);
  return nextDay;
}

Date.prototype.getMonthName = function() {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  return monthNames[this.getMonth()];
}

Date.prototype.getDateth = function() {
  var date = this.getDate();

  switch (date % 10) {
    case 1:
      return `${date}st`;
      break;
    case 2:
      return `${date}nd`;
      break;
    case 3:
      return `${date}rd`;
    default:
      return `${date}th`;
  }
}

// EVENT LISTENERS

// Only listen for outbound links (i.e. that are empty or don't point to an id element)
$('a:not([href=""]):not([href^="#"])').one('click', function(event) {
  event.preventDefault();
  handleOutboundLinkClicks(event);
});

$('#contact-us-form').on('submit', function(event) {
  event.preventDefault()

  handleFormSubmission('Contact Us');

  var name_el = document.getElementById('contact-us-name');
  var email_el = document.getElementById('contact-us-email');
  var subject_el = document.getElementById('contact-us-subject');
  var message_el = document.getElementById('contact-us-message');

  // We perform this check in case some browser does not support
  // the "required" attribute we put in the HTML form
  var required_fields = [name_el, email_el, subject_el, message_el];
  var is_form_filled = true;
  required_fields.forEach((field) => {
    if (field.value === '') is_form_filled = false;
  });

  var submit_el = document.getElementById('contact-us-submit');
  var loader_el = document.getElementById('contact-us-loader');
  var response_el = document.getElementById('contact-us-response');

  // Disable submit button so we don't get duplicates
  submit_el.disabled = true;

  // Show the loader so that the user knows we're processing the request
  loader_el.classList.remove('hidden');

  // Preparing response div
  response_el.classList.remove('success');
  response_el.classList.remove('failure');
  response_el.classList.add('hidden');

  success_msg = 'We have received your message and will get back to you as soon as we can.'
  error_msg = 'Something went wrong and we could not send your message. \
    Please make sure you filled out all the fields. If this problem persists, please email us to \
    <a href="mailto:help@bitcraft.io">help@bitcraft.io</a>.';

  if (is_form_filled) {
    axios.post(API_URL + '/send', {
        name: name_el.value,
        email: email_el.value,
        subject: subject_el.value,
        message: message_el.value
      })
      .then((response) => {
        response_el.innerHTML = success_msg;
        
        // Make the response green
        response_el.classList.add('success');
        // Show the response
        response_el.classList.remove('hidden');
      })
      .catch((error) => {
        response_el.innerHTML = error_msg;
        
        // Make the response red
        response_el.classList.add('failure');
        // Show the response
        response_el.classList.remove('hidden');

        // Enable the button again only when sending the email fails
        submit_el.disabled = false;
      })
      .finally(() => {
        // No matter the response, hide the loader again
        loader_el.classList.add('hidden');
      });
  }
});

$('.bottom-banner-close').one('click', () => {
  $('.bottom-banner').slideToggle(500);
});

$('#bottom-banner-submit').on('click', function(event) {
  event.preventDefault()

  var submit_el = $('#bottom-banner-submit');
  var bottom_banner_el = $('.bottom-banner');

  // If it's already running stop executing to avoid duplicates
  if (submit_el.hasClass('running')) {
    return null;
  }

  handleFormSubmission('News Subscribe');

  var email_el = $('#bottom-banner-email');

  // We perform this check in case some browser does not support
  // the "required" attribute we put in the HTML form
  var required_fields = [email_el];
  var is_form_filled = true;
  required_fields.forEach((field) => {
    if (field.value === '') is_form_filled = false;
  });

  var current_date = new Date();

  // Hack so that if it's past 10 AM, the next newsletter date
  // shows up as next Saturday week and not today
  if (current_date.getHours() > 10) {
    current_date.setDate(current_date.getDate() + 1);
  }

  var next_newsletter_date = current_date.nextDayOfWeek(6);
  var month = next_newsletter_date.getMonthName();
  var date = next_newsletter_date.getDateth()

  var success_title = 'Confirmed!';
  var success_subtitle = 'Thanks for subscribing to our weekly newsletter!';
  var success_msg = `We send our newsletters every <span class="underline bold">\
    Saturday morning</span>, so you will receive your first newsletter on \
    ${month} ${date}.`;
  var success_msg_el = $("<div></div>").append(success_msg)[0];

  var error_title = 'Oops!';
  var error_subtitle = 'Something went wrong and we could not subscribe you to our \
  newsletter.';
  var error_msg = 'Maybe you are already subscribed with this email? If this problem \
  persists, please email us to <a href="mailto:help@bitcraft.io">help@bitcraft.io</a>.';
  var error_msg_el = $("<div></div>").append(error_msg)[0];

  if (is_form_filled) {
    // Loading button starts running after the email is submitted
    // but before the request is made
    submit_el.addClass('running');

    axios.post(API_URL + '/subscribe', {
        email: email_el.val()
      })
      .then((response) => {
        swal({
          title: success_title,
          text: success_subtitle,
          content: success_msg_el,
          icon: 'success',
          className: 'success',
          button: 'Great!'
        })
        .then(() => {
          bottom_banner_el.slideToggle(500);
        });
      })
      .catch((error) => {
        swal({
          title: error_title,
          text: error_subtitle,
          content: error_msg_el,
          icon: 'error',
          className: 'error'
        });
      })
      .finally(() => {
        submit_el.removeClass('running');
      });
  }
});

// ON LOAD

$(document).ready(function() {
  $('.bottom-banner').delay(1000).slideToggle(500);
});