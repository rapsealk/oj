module.exports = io => {

    io.on('connection', socket => {
        console.log('socket connected!');

        socket.on('data', message => {
            console.log('data:', message);
            socket.emit('result', 'hello world!');
        });

        socket.on('disconnect', () => {
            console.log('socket disconnected!');
        });
    });
};