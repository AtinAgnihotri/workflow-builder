(function () {
  var copyBtn = document.getElementById("copy-install");
  var installCmd = document.getElementById("install-cmd");
  if (!copyBtn || !installCmd) return;

  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(installCmd.textContent || "").then(function () {
      copyBtn.textContent = "Copied";
      setTimeout(function () {
        copyBtn.textContent = "Copy";
      }, 1600);
    });
  });
})();
