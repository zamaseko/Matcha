var like = document.getElementsByClassName("like")
const query = {status : like[0].id}
//toggleVis(like, "none")
function checkStatus () {
  fetch("/p/stat-l", {
    method: "POST",
    headers: { 'Content-Type': 'application/json', },
    body: JSON.stringify(query),
    }).then(res => res.json()).then(data => {
      if (parseInt(data.status) === 1) {
          like[0].innerHTML = "unlike"
      }
      else {
        like[0].innerHTML = "like"
      }
      console.log(data.status)
    }).catch((error) => {
      console.error('status check errror', error)
    })
}

checkStatus()

like[0].addEventListener("click", () => {
    like[0].disabled = true
    var xhr = new XMLHttpRequest();
    xhr.open("post", "/p/like", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify( { like : like[0].id } ) )

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
      checkStatus()
      like[0].disabled = false 
    }, 1000)
})

function toggleVis(item, toggle) {
  for (i = 0; i < item.length; i++)
      item[i].style["display"] = `${toggle}`
}