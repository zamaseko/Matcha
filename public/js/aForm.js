var tAcc = document.getElementById('go')

tAcc.addEventListener('submit', (f) => {
    var form = f.target

    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
      }).then(res => {
          res.text()
          console.log(res)
        })
    f.preventDefault()
})