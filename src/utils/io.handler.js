const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const execution = {
	"10": function(dirname, timestamp, socket) {
		const inputs = fs.readFileSync(`${dirname}/20181109_in.txt`, { encoding: 'utf-8' }).split('\n');
		inputs.pop();
		const answers = fs.readFileSync(`${dirname}/20181109_out.txt`, { encoding: 'utf-8' }).split('\n');
		inputs.forEach((input, index) => {
			const execute = spawn(`${dirname}/${timestamp}`, input.split(' '));
			execute.stdout.on('data', data => {
				data = data.toString('utf-8').replace('\n', '');
				const equals = (data == answers[index]);
				console.log('[execute:stdout]:', data, '[expected]:', answers[index], '[equals]:', equals);
				if (!equals) {
					socket.emit('exerror', `Input: ${input}, Expected: ${answers[index]}, Output: ${data}`);
					execute.kill('SIGKILL');
				} else {
					socket.emit('correct', `Input: ${input}, Expected: ${answers[index]}, Output: ${data}`);
				}
			});
			execute.stderr.on('data', data => console.log('[execute:stderr]:', data.toString('utf-8')));
			execute.on('error', message => console.log('[execute:error]:', message));
			execute.on('close', code => console.log('[execute:close]:', code));
		});
	},
	"11": function(dirname, timestamp, socket) {
		
		const inputs = fs.readFileSync(`${dirname}/20181116_in.txt`, { encoding: 'utf-8' }).split('\n');
		inputs.pop();
		const answers = fs.readFileSync(`${dirname}/20181116_out.txt`, { encoding: 'utf-8' }).split('\n');

		inputs.forEach((input, index) => {
			const execute = spawn(`${dirname}/${timestamp}`);
			execute.stdout.on('data', data => {
				data = data.toString('utf-8').replace('\n', '');
				console.log('[execute:stdout]:', data);
				const topic = (data == answers[index]) ? 'correct' : 'exerror';
				socket.emit(topic, `Expected: ${answers[index]}, Output: ${data}`);
			});
			execute.stderr.on('data', data => console.log('[execute:stderr]:', data.toString('utf-8')));
			execute.on('error', message => console.log('[execute:error]:', message));
			execute.on('close', code => console.log('[execute:close]:', code));
	
			execute.stdin.setEncoding('utf-8');
			execute.stdin.write(input+'\n');
			execute.stdin.end();
		});
	}
};

module.exports = io => {

	io.on('connection', socket => {
		console.log('socket connected!');

		socket.on('data', data => {

			const { week, code } = data;

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
				const compile = spawn('gcc', [`${dirname}/${filename}`, '-o', `${dirname}/${timestamp}`, '-std=c99', '-static']);	// -O2, -Wall
				compile.stdout.on('data', data => console.log('[compile:stdout]:', data.toString('utf-8')));
				compile.stderr.on('data', data => {
					isCompileSuccessful = false;
					data = data.toString('utf-8').split(':').slice(1).join(':');
					console.log('[compile:stderr]:', data);
					socket.emit('cperror', data);
					compile.kill('SIGKILL');
				});
				compile.on('error', message => console.log('[compile:error]:', message));
				compile.on('close', code => {
					console.log('[compile:close]:', code);
	
					if (!isCompileSuccessful) return;

					// execute
					execution[week](dirname, timestamp, socket);
				});
			} catch (e) {
				console.log('[compile_error]:', e);
			}
		});

		socket.on('disconnect', () => {
			console.log('socket disconnected!');
		});
	});
};
