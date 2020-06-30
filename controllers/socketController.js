
exports.notif = (req, res, next) => {
	var user = req.session.user
	let soc = []
   const io = req.app.get('socket');
	const nsp = io.of(`/${user}`)

   nsp.on('connection', socket => {
      soc.push(socket.id)
      req.session.soc = soc[0]
   	console.log(`${user} connected [namespace: ${soc[0]}]`)
      if (soc[0] === socket.id) {
        // remove the connection listener for any subsequent 
        // connections with the same ID
        nsp.removeAllListeners('connection'); 
      }
		socket.on('disconnect', () => {console.log(user+' disconnected')})
		socket.on('chat message', (msg) => {
			 nsp.emit('chat message', msg)
			 console.log(user+': '+msg)
		})
   })
	next()
}
