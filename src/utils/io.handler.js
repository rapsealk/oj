const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

module.exports = io => {

	io.on('connection', socket => {
		console.log('socket connected!');

		socket.on('data', code => {
			console.log('data:', code);

			// check if dir "submits" exists.
			const dirname = path.join(__dirname, '../submits');
			try {
				fs.statSync(dirname);
			} catch (e) {
				if (e.code === 'ENOENT') fs.mkdirSync(dirname);
			}

			// Promise
			const timestamp = Date.now();
			const filename = `${timestamp}.c`;

			fs.writeFileSync(`${dirname}/${filename}`, code, 'utf-8');

			let isCompileSuccessful = true;

			// compile
			try {
				const compile = spawn('gcc', [`${dirname}/${filename}`, '-o', `${dirname}/${timestamp}`]);
				compile.stdout.on('data', data => console.log('[compile:stdout]:', data.toString('utf-8')));
				compile.stderr.on('data', data => {
					isCompileSuccessful = false;
					data = data.toString('utf-8').split(':');
					data.shift();
					data = data.join(':');
					console.log('[compile:stderr]:', data);
					socket.emit('cperror', data);
				});
				compile.on('error', message => console.log('[compile:error]:', message));
				compile.on('close', code => {
					console.log('[compile:close]:', code);
	
					if (!isCompileSuccessful) return;
	
					// execute
					/*
					try {
						const execute = spawn(`${dirname}/${timestamp}`);
						execute.stdout.on('data', data => console.log('[execute:stdout]:', data.toString('utf-8')));
						execute.stderr.on('data', data => console.log('[execute:stderr]:', data.toString('utf-8')));
						execute.on('error', message => console.log('[execute:error]:', message));
						execute.on('close', code => console.log('[execute:close]:', code));
					} catch (e) {
						console.log('[execute_error]:', e);
						throw e;
					}
					*/
				});
			} catch (e) {
				console.log('[compile_error]:', e);
			}

			// socket.emit('result', 'hello world!');
		});

		socket.on('disconnect', () => {
			console.log('socket disconnected!');
		});
	});
};
