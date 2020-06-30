var admin = document.querySelector("input[name=admin]");
var verify = document.getElementsByClassName('verify')
var options = document.getElementsByClassName('options')
var passkey = document.getElementById("passkey")
var kingme = document.getElementById("kingme")

admin.addEventListener('change', function() {
    if(this.checked) {
        toggleVis(verify, "")
        fetch("/p/admin")
    } else {
        toggleVis(verify, "none")
    }
})

function toggleVis(item, toggle) {
        for (i = 0; i < item.length; i++)
            item[i].style["display"] = `${toggle}`
}

kingme.addEventListener('submit', (f) => {
    var form = f.target

    fetch(form.action, {
        method: form.method,
        body: new FormData(form)
      }).then(res => {
          res.text()
          console.log(res)
        })
    f.preventDefault()
})