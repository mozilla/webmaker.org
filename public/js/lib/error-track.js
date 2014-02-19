(function(context) {
  context.addEventListener("error", function(evt) {
    window.jsErrorDetected = true;
  });
}(this));
