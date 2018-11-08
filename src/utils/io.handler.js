const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

module.exports = io => {

	io.on('connection', socket => {
		console.log('socket connected!');

		socket.on('data', code => {
			console.log('data:', code);

			// check if dir "submits" exists.
			try {
				fs.statSync('submits');
			} catch (e) {
				if (e.errno === -4058) fs.mkdirSync('submits');
			}

			// Promise
			const timestamp = Date.now();
			const filename = `submits/${timestamp}.c`;

			fs.writeFileSync(filename, code, 'utf-8');

			let isCompileSuccessful = true;

			// compile
			const compile = spawn('gcc', [filename, '-o', `submits/${timestamp}`]);
			compile.stdout.on('data', data => console.log('[compile:stdout]:', data.toString('utf-8')));
			compile.stderr.on('data', data => {
				isCompileSuccessful = false;
				console.log('[compile:stderr]:', data.toString('utf-8'));
				socket.emit('error', data.toString('utf-8'));
			});
			compile.on('close', code => {
				console.log('[compile:close]:', code);

				if (!isCompileSuccessful) return;

				// execute
				const execute = spawn(`${path.join(__dirname, '../submits/' + timestamp)}`);
				execute.stdout.on('data', data => console.log('[execute:stdout]:', data.toString('utf-8')));
				execute.stderr.on('data', data => console.log('[execute:stderr]:', data.toString('utf-8')));
				execute.on('error', message => console.log('[execute:error]:', message));
				execute.on('close', code => console.log('[execute:close]:', code));
			});

			socket.emit('result', 'hello world!');
		});

		socket.on('disconnect', () => {
			console.log('socket disconnected!');
		});
	});
};