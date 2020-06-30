var block = document.getElementsByClassName("block")
const q = {status : block[0].id}

function checkStat () {
  fetch("/p/stat-b", {
    method: "POST",
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(q),
    }).then(res => res.json()).then(data => {
      if (parseInt(data.status) === 1) {
          block[0].innerHTML = "unblock"
      }
      else if (parseInt(data.status) === 0) {
        block[0].innerHTML = "block"
      }
      else if (parseInt(data.status) === 3) {
        block[0].innerHTML = "unsuspend"
      }
      else if (parseInt(data.status) === 4) {
        block[0].innerHTML = "suspend"
      }
      else {
        toggleVis(block[0], "none")
      }
      console.log("status check", data.status)
    }).catch((error) => {
      console.error('status check errror', error)
    })
}

checkStat()

block[0].addEventListener("click", () => {
    block[0].disabled = true
    var xhr = new XMLHttpRequest()
    xhr.open("post", "/p/block", true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify( { block : block[0].id } ) )

    xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText)
            console.log('label : ', response.label)
            console.log('value : ', response.value)
            console.log('initiator : ', response.initiator)
            console.log('user : ', response.user)
          } else {
            console.error(xhr.statusText)
          }
        }
    }
    xhr.onerror = function (e) {
        console.error(xhr.statusText);
    }
    setTimeout( () => {
      checkStat()
      block[0].disabled = false 
    }, 1000)
})