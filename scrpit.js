// Profile photo fallback: if images/profile.jpg is missing, show initials instead of a broken image.
document.querySelectorAll('img[src="images/profile.jpg"]').forEach(function (img) {
  img.addEventListener('error', function () {
    var box = img.closest('.ph');
    if (box) { box.textContent = 'PM'; } else { img.style.visibility = 'hidden'; }
  });
});